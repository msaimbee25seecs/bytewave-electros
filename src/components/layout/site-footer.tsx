import { Link } from "@tanstack/react-router";
import { Cpu } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/50 glass">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary">
              <Cpu className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">Bytewave</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Premium electronics components for makers, engineers, and dreamers.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop">All products</Link></li>
            <li><Link to="/shop">Microcontrollers</Link></li>
            <li><Link to="/shop">Passives</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/dashboard">Account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Stay in the loop</h4>
          <p className="text-sm text-muted-foreground">New drops, deep dives, and discounts.</p>
        </div>
      </div>
      <div className="border-t border-border/50 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Bytewave. All rights reserved.
      </div>
    </footer>
  );
}
