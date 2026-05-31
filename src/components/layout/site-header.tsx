import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingCart, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/blog", label: "Journal" },
];

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, isAdmin, isSeller, signOut } = useAuth();
  const { count } = useCart();
  const showDashboard = isSeller || isAdmin;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="editorial text-xl tracking-tight">Bytewave</span>
          <span className="hidden text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
            Marketplace
          </span>
        </Link>

        <nav className="hidden gap-8 md:flex">
          {nav.map((n) => {
            const active = path === n.to || (n.to !== "/" && path.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`text-sm transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
          {showDashboard && (
            <Link
              to="/seller"
              className={`text-sm transition-colors ${
                path.startsWith("/seller") || path.startsWith("/admin")
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1">
          {showDashboard && (
            <Link to="/seller" className="md:hidden">
              <Button variant="ghost" size="icon" title="Dashboard">
                <LayoutDashboard className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-[18px] w-[18px]" />
            </Button>
            {count > 0 && (
              <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full bg-primary px-1 text-[10px] font-medium">
                {count}
              </Badge>
            )}
          </Link>
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <User className="h-[18px] w-[18px]" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => signOut()}>
                <LogOut className="h-[18px] w-[18px]" />
              </Button>
            </>
          ) : (
            <Link to="/auth" className="ml-2">
              <Button size="sm" className="rounded-full bg-primary px-4 text-primary-foreground hover:bg-primary/90">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
