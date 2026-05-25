import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Store, Package, ShoppingBag, Home, LogOut, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/seller")({
  head: () => ({ meta: [{ title: "Seller — Bytewave" }, { name: "robots", content: "noindex" }] }),
  component: SellerLayout,
});

const nav = [
  { to: "/seller", label: "Overview", icon: Home, exact: true },
  { to: "/seller/products", label: "My Products", icon: Package },
  { to: "/seller/orders", label: "Orders", icon: ShoppingBag },
];

function SellerLayout() {
  const { user, isSeller, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
    else if (!isSeller) navigate({ to: "/" });
  }, [user, isSeller, loading, navigate]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Checking access…</div>;
  }

  if (!isSeller) {
    return (
      <div className="mx-auto max-w-xl p-12 text-center">
        <h1 className="mb-2 text-2xl font-bold">Become a seller</h1>
        <p className="mb-4 text-muted-foreground">
          Your account is signed in but doesn't have the <span className="font-mono">seller</span> role yet.
        </p>
        <div className="rounded-lg border border-border bg-card p-4 text-left text-sm">
          <p className="mb-2 text-muted-foreground">Your User ID:</p>
          <div className="flex items-center justify-between gap-2 rounded-md bg-background p-2 font-mono text-xs">
            <span className="truncate">{user.id}</span>
            <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(user.id); toast.success("Copied"); }}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <p className="mt-3 text-muted-foreground">
            Share this ID with an admin to be granted seller access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr]">
      <aside className="relative border-r border-border bg-sidebar text-sidebar-foreground">
        <Link to="/" className="flex h-16 items-center gap-2 border-b border-border px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary"><Store className="h-4 w-4 text-primary-foreground" /></div>
          <span className="font-bold">Seller Hub</span>
        </Link>
        <nav className="p-3">
          {nav.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to) && n.to !== "/seller";
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
        </nav>
        <div className="absolute bottom-4 w-[240px] px-3">
          <Button variant="ghost" onClick={() => signOut()} className="w-full justify-start">
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
