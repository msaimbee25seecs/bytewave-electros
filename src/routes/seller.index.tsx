import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Package, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/seller/")({
  component: SellerOverview,
});

function SellerOverview() {
  const { user } = useAuth();

  const { data } = useQuery({
    enabled: !!user,
    queryKey: ["seller-overview", user?.id],
    queryFn: async () => {
      const [products, items] = await Promise.all([
        supabase.from("products").select("id,quantity", { count: "exact" }).eq("seller_id", user!.id),
        supabase.from("order_items").select("order_id,price,quantity,products!inner(seller_id)").eq("products.seller_id", user!.id),
      ]);
      const rows = items.data ?? [];
      const revenue = rows.reduce((s, r: any) => s + Number(r.price) * r.quantity, 0);
      const orderIds = new Set(rows.map((r: any) => r.order_id));
      const lowStock = (products.data ?? []).filter((p: any) => p.quantity <= 5).length;
      return {
        products: products.count ?? 0,
        orders: orderIds.size,
        revenue,
        lowStock,
      };
    },
  });

  const stats = [
    { label: "My Products", value: data?.products ?? 0, icon: Package },
    { label: "Orders", value: data?.orders ?? 0, icon: ShoppingBag },
    { label: "Revenue", value: `$${(data?.revenue ?? 0).toFixed(2)}`, icon: DollarSign },
    { label: "Low stock (≤5)", value: data?.lowStock ?? 0, icon: TrendingUp },
  ];

  return (
    <div className="p-8">
      <h1 className="mb-2 text-3xl font-bold">Seller Overview</h1>
      <p className="mb-8 text-muted-foreground">Welcome back. Here's your store at a glance.</p>
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
