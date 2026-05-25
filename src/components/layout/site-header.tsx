import { Link, useRouterState } from "@tanstack/react-router";
import { Cpu, ShoppingCart, User, LogOut, Shield, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/blog", label: "Blog" },
];

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, isAdmin, isSeller, signOut } = useAuth();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary glow">
            <Cpu className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Byte<span className="text-gradient">wave</span>
          </span>
        </Link>

        <nav className="hidden gap-1 md:flex">
          {nav.map((n) => {
            const active = path === n.to || (n.to !== "/" && path.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  active ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {count > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full bg-gradient-primary px-1 text-[10px]">
                {count}
              </Badge>
            )}
          </Link>
          {isSeller && (
            <Link to="/seller">
              <Button variant="ghost" size="icon" title="Seller Hub">
                <Store className="h-5 w-5" />
              </Button>
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" size="icon" title="Admin">
                <Shield className="h-5 w-5" />
              </Button>
            </Link>
          )}
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => signOut()}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
