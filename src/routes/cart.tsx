import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Bytewave" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, remove, setQty, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);

  const checkout = async () => {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (items.length === 0) return;
    setPlacing(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({ user_id: user.id, total_amount: total, status: "processing" })
      .select()
      .single();
    if (error || !order) {
      setPlacing(false);
      toast.error(error?.message ?? "Failed");
      return;
    }
    const { error: e2 } = await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: i.id,
        title: i.title,
        quantity: i.quantity,
        unit_price: i.price,
      }))
    );
    setPlacing(false);
    if (e2) {
      toast.error(e2.message);
      return;
    }
    clear();
    toast.success("Order placed!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10">
        <h1 className="mb-8 text-4xl font-bold">Your cart</h1>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-16 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 text-muted-foreground">Your cart is empty.</p>
            <Link to="/shop"><Button className="mt-4 bg-gradient-primary text-primary-foreground">Shop products</Button></Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {items.map((i) => (
                <div key={i.id} className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4">
                  {i.image_url && <img src={i.image_url} className="h-16 w-16 rounded-lg object-cover" alt="" />}
                  <div className="flex-1">
                    <p className="font-semibold">{i.title}</p>
                    {i.sku && <p className="text-xs text-muted-foreground">SKU {i.sku}</p>}
                  </div>
                  <Input
                    type="number"
                    min={1}
                    value={i.quantity}
                    onChange={(e) => setQty(i.id, parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <p className="w-20 text-right font-semibold">${(i.price * i.quantity).toFixed(2)}</p>
                  <Button variant="ghost" size="icon" onClick={() => remove(i.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <aside className="h-fit rounded-xl border border-border/60 bg-card p-6">
              <h2 className="mb-4 text-lg font-bold">Summary</h2>
              <div className="space-y-2 border-b border-border pb-4 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>Calculated at checkout</span></div>
              </div>
              <div className="flex justify-between py-4 text-lg font-bold">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
              <Button onClick={checkout} disabled={placing} className="w-full bg-gradient-primary text-primary-foreground">
                {user ? "Place order" : "Sign in to checkout"}
              </Button>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
