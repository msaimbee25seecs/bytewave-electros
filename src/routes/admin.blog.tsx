import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/blog")({
  component: AdminBlog,
});

interface PostForm {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  tags: string;
  read_minutes: number;
  cover_image_url: string;
  seo_title: string;
  meta_description: string;
  publish: boolean;
}

const empty: PostForm = {
  title: "", slug: "", excerpt: "", content: "", author: "Bytewave Team",
  tags: "", read_minutes: 5, cover_image_url: "", seo_title: "", meta_description: "", publish: false,
};

function AdminBlog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PostForm>(empty);

  const { data: posts = [] } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const save = async () => {
    if (!form.title || !form.slug) return toast.error("Title and slug required");
    const payload: any = {
      title: form.title, slug: form.slug, excerpt: form.excerpt, content: form.content,
      author: form.author, read_minutes: form.read_minutes, cover_image_url: form.cover_image_url || null,
      seo_title: form.seo_title || null, meta_description: form.meta_description || null,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      published_at: form.publish ? new Date().toISOString() : null,
    };
    const { error } = form.id
      ? await supabase.from("blog_posts").update(payload).eq("id", form.id)
      : await supabase.from("blog_posts").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false); setForm(empty);
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog posts</h1>
          <p className="text-muted-foreground">{posts.length} total</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm(empty)} className="bg-gradient-primary text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" /> New post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader><DialogTitle>{form.id ? "Edit post" : "New post"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="my-post" /></div>
              <div><Label>Excerpt</Label><Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
              <div><Label>Content (markdown / plain)</Label><Textarea rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
              <div className="grid gap-4 md:grid-cols-3">
                <div><Label>Author</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
                <div><Label>Tags (comma-sep)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
                <div><Label>Read minutes</Label><Input type="number" value={form.read_minutes} onChange={(e) => setForm({ ...form, read_minutes: parseInt(e.target.value) || 5 })} /></div>
              </div>
              <div><Label>Cover image URL</Label><Input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} /></div>
              <div><Label>SEO title</Label><Input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} /></div>
              <div><Label>Meta description</Label><Textarea rows={2} value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} /></div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.publish} onChange={(e) => setForm({ ...form, publish: e.target.checked })} />
                Publish now
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={save} className="bg-gradient-primary text-primary-foreground">Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-12 text-center text-muted-foreground">No posts yet.</TableCell></TableRow>
            ) : posts.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell className="font-mono text-xs">{p.slug}</TableCell>
                <TableCell>
                  {p.published_at ? <Badge className="bg-success/20 text-success">Published</Badge> : <Badge variant="secondary">Draft</Badge>}
                </TableCell>
                <TableCell>{p.author}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setForm({
                    id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt ?? "", content: p.content ?? "",
                    author: p.author, tags: (p.tags ?? []).join(", "), read_minutes: p.read_minutes,
                    cover_image_url: p.cover_image_url ?? "", seo_title: p.seo_title ?? "",
                    meta_description: p.meta_description ?? "", publish: !!p.published_at,
                  }); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => del(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
