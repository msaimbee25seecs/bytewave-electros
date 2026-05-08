import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingBag, FileText, DollarSign } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [products, orders, posts] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id,total_amount,status"),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      ]);
      const revenue = (orders.data ?? []).reduce((s, o) => s + Number(o.total_amount), 0);
      return {
        products: products.count ?? 0,
        orders: orders.data?.length ?? 0,
        posts: posts.count ?? 0,
        revenue,
      };
    },
  });

  const stats = [
    { label: "Products", value: data?.products ?? 0, icon: Package },
    { label: "Orders", value: data?.orders ?? 0, icon: ShoppingBag },
    { label: "Blog posts", value: data?.posts ?? 0, icon: FileText },
    { label: "Revenue", value: `$${(data?.revenue ?? 0).toFixed(2)}`, icon: DollarSign },
  ];

  return (
    <div className="p-8">
      <h1 className="mb-2 text-3xl font-bold">Overview</h1>
      <p className="mb-8 text-muted-foreground">Welcome back to your store.</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
