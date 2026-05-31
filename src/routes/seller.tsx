import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Package, ShoppingBag, Home, LogOut, Copy, FileText, Boxes, ClipboardList, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/seller")({
  head: () => ({ meta: [{ title: "Dashboard — Bytewave" }, { name: "robots", content: "noindex" }] }),
  component: SellerLayout,
});

function SellerLayout() {
  const { user, isSeller, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
    else if (!isSeller) navigate({ to: "/" });
  }, [user, isSeller, loading, navigate]);

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

  const sellerNav = [
    { to: "/seller", label: "Overview", icon: Home, exact: true },
    { to: "/seller/products", label: "My Products", icon: Package },
    { to: "/seller/orders", label: "My Orders", icon: ShoppingBag },
  ];

  const adminNav = [
    { to: "/admin", label: "Store overview", icon: Home, exact: true },
    { to: "/admin/products", label: "All products", icon: Boxes },
    { to: "/admin/orders", label: "All orders", icon: ClipboardList },
    { to: "/admin/blog", label: "Journal", icon: FileText },
  ];

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path.startsWith(to) && to !== "/seller" && to !== "/admin";

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr]">
      <aside className="relative flex flex-col border-r border-border/60 bg-sidebar text-sidebar-foreground">
        <Link to="/" className="flex h-16 items-center justify-between border-b border-border/60 px-5">
          <span className="editorial text-lg">Bytewave</span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Hub</span>
        </Link>

        <nav className="flex-1 p-3">
          <div className="mb-2 px-3 pt-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Seller</div>
          {sellerNav.map((n) => {
            const active = isActive(n.to, n.exact);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="mt-6 mb-2 flex items-center gap-2 px-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Admin <Badge variant="outline" className="h-4 border-primary/40 px-1.5 text-[9px] text-primary"><Shield className="mr-0.5 h-2.5 w-2.5" /> Staff</Badge>
              </div>
              {adminNav.map((n) => {
                const active = isActive(n.to, n.exact);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <n.icon className="h-4 w-4" /> {n.label}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="border-t border-border/60 p-3">
          <Button variant="ghost" onClick={() => signOut()} className="w-full justify-start text-muted-foreground hover:text-foreground">
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
