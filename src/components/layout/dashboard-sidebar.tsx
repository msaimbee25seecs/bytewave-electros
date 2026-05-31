import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Package, ShoppingBag, FileText, Boxes, ClipboardList, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

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

export function DashboardSidebar() {
  const { isAdmin, signOut } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path.startsWith(to) && to !== "/seller" && to !== "/admin";

  return (
    <aside className="relative flex min-h-screen flex-col border-r border-border/60 bg-sidebar text-sidebar-foreground">
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
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="mt-6 mb-2 flex items-center gap-2 px-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Admin
              <Badge variant="outline" className="h-4 border-primary/40 px-1.5 text-[9px] text-primary">
                <Shield className="mr-0.5 h-2.5 w-2.5" /> Staff
              </Badge>
            </div>
            {adminNav.map((n) => {
              const active = isActive(n.to, n.exact);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
        <Button
          variant="ghost"
          onClick={() => signOut()}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
    </aside>
  );
}
