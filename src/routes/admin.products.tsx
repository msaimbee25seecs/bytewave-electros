import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

interface ProductForm {
  id?: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  compare_at_price: number | null;
  cost_per_item: number | null;
  sku: string;
  barcode: string;
  track_quantity: boolean;
  quantity: number;
  category: string;
  variant_label: string;
  variant_value: string;
  handle: string;
  seo_title: string;
  seo_description: string;
}

const empty: ProductForm = {
  title: "", description: "", image_url: "",
  price: 0, compare_at_price: null, cost_per_item: null,
  sku: "", barcode: "", track_quantity: true, quantity: 0,
  category: "misc", variant_label: "", variant_value: "",
  handle: "", seo_title: "", seo_description: "",
};

function AdminProducts() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductForm>(empty);

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const save = async () => {
    const payload = { ...editing };
    if (!payload.title) return toast.error("Title required");
    const { id, ...rest } = payload;
    const { error } = id
      ? await supabase.from("products").update(rest).eq("id", id)
      : await supabase.from("products").insert(rest);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false);
    setEditing(empty);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">{products.length} total</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(empty); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(empty)} className="bg-gradient-primary text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" /> Add product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader><DialogTitle>{editing.id ? "Edit product" : "New product"}</DialogTitle></DialogHeader>
            <ProductFormFields value={editing} onChange={setEditing} />
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} className="bg-gradient-primary text-primary-foreground">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No products yet.</TableCell></TableRow>
            ) : products.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell className="font-mono text-xs">{p.sku ?? "—"}</TableCell>
                <TableCell className="capitalize">{p.category}</TableCell>
                <TableCell className="text-right">${Number(p.price).toFixed(2)}</TableCell>
                <TableCell className="text-right">{p.quantity}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing({ ...empty, ...p }); setOpen(true); }}>
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

function ProductFormFields({ value, onChange }: { value: ProductForm; onChange: (v: ProductForm) => void }) {
  const set = <K extends keyof ProductForm>(k: K, v: ProductForm[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-6">
      <Section title="General">
        <div className="grid gap-4">
          <Field label="Title"><Input value={value.title} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Description"><Textarea rows={4} value={value.description} onChange={(e) => set("description", e.target.value)} /></Field>
          <Field label="Image URL"><Input value={value.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="https://…" /></Field>
        </div>
      </Section>

      <Section title="Pricing">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Price ($)"><Input type="number" step="0.01" value={value.price} onChange={(e) => set("price", parseFloat(e.target.value) || 0)} /></Field>
          <Field label="Compare at"><Input type="number" step="0.01" value={value.compare_at_price ?? ""} onChange={(e) => set("compare_at_price", e.target.value ? parseFloat(e.target.value) : null)} /></Field>
          <Field label="Cost per item"><Input type="number" step="0.01" value={value.cost_per_item ?? ""} onChange={(e) => set("cost_per_item", e.target.value ? parseFloat(e.target.value) : null)} /></Field>
        </div>
      </Section>

      <Section title="Inventory">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="SKU"><Input value={value.sku} onChange={(e) => set("sku", e.target.value)} /></Field>
          <Field label="Barcode"><Input value={value.barcode} onChange={(e) => set("barcode", e.target.value)} /></Field>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-border p-3">
          <Label>Track quantity</Label>
          <Switch checked={value.track_quantity} onCheckedChange={(v) => set("track_quantity", v)} />
        </div>
        {value.track_quantity && (
          <Field label="Available quantity" className="mt-4">
            <Input type="number" value={value.quantity} onChange={(e) => set("quantity", parseInt(e.target.value) || 0)} />
          </Field>
        )}
      </Section>

      <Section title="Variant">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Variant label (e.g. Ohms, Memory)"><Input value={value.variant_label} onChange={(e) => set("variant_label", e.target.value)} /></Field>
          <Field label="Variant value (e.g. 10kΩ, 8MB)"><Input value={value.variant_value} onChange={(e) => set("variant_value", e.target.value)} /></Field>
        </div>
        <Field label="Category" className="mt-4">
          <Input value={value.category} onChange={(e) => set("category", e.target.value.toLowerCase())} placeholder="e.g. electronics, fashion, home" />
        </Field>
      </Section>

      <Section title="Search engine listing">
        <div className="grid gap-4">
          <Field label="URL handle"><Input value={value.handle} onChange={(e) => set("handle", e.target.value)} placeholder="my-product-handle" /></Field>
          <Field label="Meta title"><Input value={value.seo_title} onChange={(e) => set("seo_title", e.target.value)} /></Field>
          <Field label="Meta description"><Textarea rows={2} value={value.seo_description} onChange={(e) => set("seo_description", e.target.value)} /></Field>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}
function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      {children}
    </div>
  );
}
