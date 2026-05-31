import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Cpu,
  Shirt,
  Home as HomeIcon,
  Dumbbell,
  BookOpen,
  Sparkle,
  Gamepad2,
  Zap,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  component: Index,
});

const categories = [
  { name: "Electronics", slug: "electronics", icon: Cpu },
  { name: "Fashion", slug: "fashion", icon: Shirt },
  { name: "Home & Living", slug: "home", icon: HomeIcon },
  { name: "Sports & Fitness", slug: "sports", icon: Dumbbell },
  { name: "Books & Media", slug: "books", icon: BookOpen },
  { name: "Beauty", slug: "beauty", icon: Sparkle },
  { name: "Toys & Games", slug: "toys", icon: Gamepad2 },
  { name: "Accessories", slug: "accessories", icon: Zap },
];

function Index() {
  const { isSeller, isAdmin } = useAuth();
  const showDashboard = isSeller || isAdmin;

  const { data: featured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,title,price,compare_at_price,sku,rating,reviews_count,image_url,category,quantity")
        .order("rating", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data as ProductCardData[];
    },
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero — editorial */}
      <section className="container mx-auto max-w-6xl px-6 pt-28 pb-24">
        <div className="max-w-3xl">
          <div className="mb-8 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-px w-8 bg-border" />
            Issue 01 — A multi-category marketplace
          </div>
          <h1 className="editorial text-5xl leading-[1.05] md:text-7xl">
            Everything you love,
            <br />
            <em className="text-primary not-italic">one store.</em>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground">
            Bytewave is a curated marketplace for electronics, fashion, home,
            beauty, books and more — quietly assembled by independent sellers.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link to="/shop">
              <Button size="lg" className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
                Shop everything <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/blog" className="text-sm text-foreground underline-offset-4 hover:underline">
              Read the journal
            </Link>
            {showDashboard && (
              <Link
                to="/seller"
                className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
              >
                <LayoutDashboard className="h-4 w-4" /> Open dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-t border-border/60">
        <div className="container mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <div className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">§ Categories</div>
              <h2 className="editorial text-3xl md:text-4xl">Shop by category</h2>
            </div>
            <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border/60 bg-border/60 md:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/shop"
                search={{ category: c.slug }}
                className="group flex flex-col gap-6 bg-background p-8 transition-colors hover:bg-card"
              >
                <c.icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                <div>
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Browse →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="border-t border-border/60">
        <div className="container mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12">
            <div className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">§ Featured</div>
            <h2 className="editorial text-3xl md:text-4xl">Top rated this season</h2>
          </div>
          {featured && featured.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-border/60 p-16 text-center">
              <p className="text-sm text-muted-foreground">No products yet. Sellers — add inventory from your dashboard.</p>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
