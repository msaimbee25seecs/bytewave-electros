import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export const Route = createFileRoute("/seller")({
  head: () => ({ meta: [{ title: "Dashboard — Bytewave" }, { name: "robots", content: "noindex" }] }),
  component: SellerLayout,
});

function SellerLayout() {
  const { user, isSeller, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Checking access…</div>;
  }

  if (!isSeller) {
    return (
      <div className="mx-auto max-w-xl p-12 text-center">
        <h1 className="editorial mb-2 text-3xl">Become a seller</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          Your account is signed in but doesn't have the <span className="font-mono">seller</span> role yet.
        </p>
        <div className="rounded-md border border-border bg-card p-4 text-left text-sm">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Your User ID</p>
          <div className="flex items-center justify-between gap-2 rounded-md bg-background p-2 font-mono text-xs">
            <span className="truncate">{user.id}</span>
            <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(user.id); toast.success("Copied"); }}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Share this ID with an admin to be granted seller access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr]">
      <DashboardSidebar />
      <main className="overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
