import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Bytewave" }] }),
  component: DashboardPage,
});

const statusColor: Record<string, string> = {
  processing: "bg-warning/20 text-warning",
  shipped: "bg-primary/20 text-primary",
  delivered: "bg-success/20 text-success",
  cancelled: "bg-destructive/20 text-destructive",
};

function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const { data: orders = [] } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,status,total_amount,created_at,shipping_address,order_items(title,quantity,unit_price)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  if (loading || !user) return null;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">My account</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </header>

        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                        No orders yet. <Link to="/shop" className="text-primary hover:underline">Browse the shop →</Link>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">#{o.id.slice(0, 8)}</TableCell>
                        <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={statusColor[o.status] || ""}>{o.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">${Number(o.total_amount).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <OrderDetails order={o} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsForm initial={profile} userId={user.id} />
          </TabsContent>
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}

function OrderDetails({ order }: { order: any }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">View details</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Order #{order.id.slice(0, 8)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {order.order_items?.map((it: any, idx: number) => (
            <div key={idx} className="flex justify-between rounded-lg border border-border/60 p-3">
              <div>
                <p className="font-medium">{it.title}</p>
                <p className="text-xs text-muted-foreground">Qty {it.quantity}</p>
              </div>
              <p className="font-semibold">${(Number(it.unit_price) * it.quantity).toFixed(2)}</p>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-3 font-bold">
            <span>Total</span>
            <span>${Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SettingsForm({ initial, userId }: { initial: any; userId: string }) {
  const [fullName, setFullName] = useState(initial?.full_name ?? "");
  const addr = initial?.shipping_address ?? {};
  const [line1, setLine1] = useState(addr.line1 ?? "");
  const [city, setCity] = useState(addr.city ?? "");
  const [postal, setPostal] = useState(addr.postal ?? "");
  const [country, setCountry] = useState(addr.country ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        full_name: fullName,
        shipping_address: { line1, city, postal, country },
      });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Saved");
  };

  return (
    <div className="grid gap-6 rounded-xl border border-border/60 bg-card p-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <Label>Full name</Label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <Label>Address</Label>
        <Input value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Street address" />
      </div>
      <div>
        <Label>City</Label>
        <Input value={city} onChange={(e) => setCity(e.target.value)} />
      </div>
      <div>
        <Label>Postal code</Label>
        <Input value={postal} onChange={(e) => setPostal(e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <Label>Country</Label>
        <Input value={country} onChange={(e) => setCountry(e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <Button onClick={save} disabled={saving} className="bg-gradient-primary text-primary-foreground">
          Save changes
        </Button>
      </div>
    </div>
  );
}
