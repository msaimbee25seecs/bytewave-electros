import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Badge } from "@/components/ui/badge";
import { Clock, User, ArrowLeft } from "lucide-react";
import { ProductCard, type ProductCardData } from "@/components/product-card";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", params.slug)
      .not("published_at", "is", null)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return { post: data };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.post;
    if (!p) return { meta: [{ title: "Post — Bytewave" }] };
    const title = p.seo_title || `${p.title} — Bytewave`;
    const desc = p.meta_description || p.excerpt || "";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        ...(p.cover_image_url ? [{ property: "og:image", content: p.cover_image_url }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Post not found</h1>
        <Link to="/blog" className="mt-4 inline-block text-primary hover:underline">← Back to blog</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container mx-auto py-16 text-center text-destructive">{error.message}</div>
  ),
  component: BlogPost,
});

function BlogPost() {
  const { post } = Route.useLoaderData();
  const { data: related = [] } = useQuery({
    queryKey: ["related-products", post.tags],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id,title,price,compare_at_price,sku,rating,reviews_count,image_url,category,quantity")
        .order("rating", { ascending: false })
        .limit(3);
      return (data || []) as ProductCardData[];
    },
  });

  const published = post.published_at ? new Date(post.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container mx-auto px-4 py-10">
        <Link to="/blog" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All articles
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <article>
            <header className="mb-8">
              <div className="mb-4 flex flex-wrap gap-2">
                {post.tags.map((t: string) => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))}
              </div>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">{post.title}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><User className="h-4 w-4" />{post.author}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{post.read_minutes} min read</span>
                {published && <span>{published}</span>}
              </div>
            </header>

            {post.cover_image_url && (
              <img src={post.cover_image_url} alt={post.title} className="mb-8 w-full rounded-2xl border border-border/60" />
            )}

            <section className="prose prose-invert max-w-none whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
              {post.content}
            </section>

            <section className="mt-12 rounded-xl border border-border/60 bg-card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">About the author</h2>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-lg font-bold text-primary-foreground">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{post.author}</p>
                  <p className="text-sm text-muted-foreground">Writes about embedded systems and maker culture.</p>
                </div>
              </div>
            </section>
          </article>

          <aside className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Related products</h2>
            {related.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products yet.</p>
            ) : (
              <div className="space-y-4">
                {related.map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
            )}
          </aside>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
