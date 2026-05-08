import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUSES = ["processing", "shipped", "delivered", "cancelled"];

function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,user_id,status,total_amount,created_at,order_items(title,quantity)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  return (
    <div className="p-8">
      <h1 className="mb-2 text-3xl font-bold">Orders</h1>
      <p className="mb-6 text-muted-foreground">{orders.length} orders</p>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No orders yet.</TableCell></TableRow>
            ) : orders.map((o: any) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">#{o.id.slice(0, 8)}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{o.user_id.slice(0, 8)}</TableCell>
                <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{o.order_items?.reduce((s: number, i: any) => s + i.quantity, 0) ?? 0} items</Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">${Number(o.total_amount).toFixed(2)}</TableCell>
                <TableCell>
                  <Select value={o.status} onValueChange={(v) => update(o.id, v)}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
