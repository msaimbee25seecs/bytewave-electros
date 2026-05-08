import { createFileRoute, Link, Outlet, useNavigate, useRouterState, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Cpu, Package, ShoppingBag, FileText, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Bytewave" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Overview", icon: Home, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/blog", label: "Blog", icon: FileText },
];

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
    else if (!isAdmin) navigate({ to: "/" });
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Checking access…
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr]">
      <aside className="border-r border-border bg-sidebar text-sidebar-foreground">
        <Link to="/" className="flex h-16 items-center gap-2 border-b border-border px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary"><Cpu className="h-4 w-4 text-primary-foreground" /></div>
          <span className="font-bold">Bytewave Admin</span>
        </Link>
        <nav className="p-3">
          {nav.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to) && n.to !== "/admin";
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
