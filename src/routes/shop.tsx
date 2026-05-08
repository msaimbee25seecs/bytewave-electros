import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Search } from "lucide-react";

interface ShopSearch {
  category?: string;
}

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): ShopSearch => ({
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop — Bytewave" },
      { name: "description", content: "Browse microcontrollers, ICs, sensors, and passives." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const initial = Route.useSearch();
  const [selectedCats, setSelectedCats] = useState<string[]>(
    initial.category ? [initial.category] : []
  );
  const [price, setPrice] = useState<[number, number]>([0, 500]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [q, setQ] = useState("");

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,title,price,compare_at_price,sku,rating,reviews_count,image_url,category,quantity")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProductCardData[];
    },
  });

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const maxPrice = useMemo(
    () => Math.max(500, ...products.map((p) => Number(p.price))),
    [products]
  );

  const filtered = products.filter((p) => {
    if (selectedCats.length && !selectedCats.includes(p.category)) return false;
    if (Number(p.price) < price[0] || Number(p.price) > price[1]) return false;
    if (inStockOnly && p.quantity <= 0) return false;
    if (q && !`${p.title} ${p.sku ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const toggleCat = (c: string) =>
    setSelectedCats((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">Shop</h1>
          <p className="text-muted-foreground">{filtered.length} products</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products…"
                className="pl-9"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">Category</h3>
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No products yet.</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((c) => (
                    <div key={c} className="flex items-center gap-2">
                      <Checkbox
                        id={`c-${c}`}
                        checked={selectedCats.includes(c)}
                        onCheckedChange={() => toggleCat(c)}
                      />
                      <Label htmlFor={`c-${c}`} className="cursor-pointer text-sm capitalize">
                        {c}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">Price</h3>
              <Slider
                min={0}
                max={maxPrice}
                step={1}
                value={price}
                onValueChange={(v) => setPrice([v[0], v[1]] as [number, number])}
              />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>${price[0]}</span>
                <span>${price[1]}</span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-5">
              <Label htmlFor="stock" className="cursor-pointer">In stock only</Label>
              <Switch id="stock" checked={inStockOnly} onCheckedChange={setInStockOnly} />
            </div>
          </aside>

          {/* Grid */}
          <div>
            {filtered.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-16 text-center text-muted-foreground">
                No products match your filters.
              </div>
            )}
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
