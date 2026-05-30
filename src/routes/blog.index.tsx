import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Bytewave" },
      { name: "description", content: "Stories, guides, and product spotlights across every category we carry." },
      { property: "og:title", content: "Blog — Bytewave" },
      { property: "og:description", content: "Stories, guides, and product spotlights across every category we carry." },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { data: posts = [] } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id,slug,title,excerpt,author,tags,read_minutes,cover_image_url,published_at")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12">
        <header className="mb-10">
          <h1 className="text-5xl font-bold tracking-tight">The Bytewave <span className="text-gradient">Journal</span></h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Buying guides, trend reports, and product spotlights across every category.
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-16 text-center text-muted-foreground">
            No published posts yet.
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <article key={p.id} className="group overflow-hidden rounded-xl border border-border/60 bg-card shadow-card transition-all hover:border-primary/50 hover:glow">
                <Link to="/blog/$slug" params={{ slug: p.slug }}>
                  {p.cover_image_url && (
                    <div className="aspect-video overflow-hidden bg-muted/40">
                      <img src={p.cover_image_url} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {p.tags.slice(0, 3).map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                    <h2 className="text-xl font-bold leading-tight group-hover:text-primary">{p.title}</h2>
                    {p.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>}
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{p.author}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.read_minutes} min read</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
