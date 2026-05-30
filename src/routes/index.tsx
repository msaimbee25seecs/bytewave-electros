import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Cpu,
  Zap,
  Shield,
  Truck,
  Sparkles,
  Shirt,
  Home as HomeIcon,
  Dumbbell,
  BookOpen,
  Sparkle,
  Gamepad2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

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

      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center">
            <Badge className="mb-4 w-fit border-primary/40 bg-accent text-foreground" variant="outline">
              <Sparkles className="mr-1 h-3 w-3" /> New arrivals across every category
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
              Everything you love, <span className="text-gradient">one store</span>.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              From electronics and fashion to home essentials, beauty, books, and
              more — curated by independent sellers and shipped fast.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop">
                <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 glow">
                  Shop everything <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/blog">
                <Button size="lg" variant="outline">Read the blog</Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Free shipping over $50</div>
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> 30-day returns</div>
              <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Same-day dispatch</div>
            </div>
          </div>

          {/* Hero showcase */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl" />
            <div className="glass relative grid w-full max-w-md grid-cols-2 gap-4 rounded-2xl p-6 shadow-card">
              <div className="col-span-2 rounded-xl bg-gradient-primary p-6 text-primary-foreground">
                <div className="text-xs uppercase tracking-wider opacity-80">Featured</div>
                <div className="mt-1 text-2xl font-bold">Multi-category marketplace</div>
                <div className="mt-1 text-sm opacity-90">Tech · Style · Home · More</div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-3xl font-bold">10k+ SKUs</span>
                  <Sparkles className="h-12 w-12 opacity-80" />
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <Shirt className="h-6 w-6 text-primary" />
                <div className="mt-2 text-xs text-muted-foreground">Fashion</div>
                <div className="text-sm font-semibold">New season drops</div>
                <div className="mt-1 text-sm font-bold">From $12</div>
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <HomeIcon className="h-6 w-6 text-primary" />
                <div className="mt-2 text-xs text-muted-foreground">Home</div>
                <div className="text-sm font-semibold">Living essentials</div>
                <div className="mt-1 text-sm font-bold">From $9</div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold">Shop by category</h2>
            <p className="text-muted-foreground">Find exactly what your build needs.</p>
          </div>
          <Link to="/shop" className="text-sm text-primary hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug }}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-6 text-center transition-all hover:border-primary/50 hover:glow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent transition-colors group-hover:bg-gradient-primary">
                <c.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold">Top rated</h2>
            <p className="text-muted-foreground">Loved by makers around the world.</p>
          </div>
        </div>
        {featured && featured.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-12 text-center">
            <Cpu className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 text-muted-foreground">No products yet. Add some from the admin dashboard.</p>
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
