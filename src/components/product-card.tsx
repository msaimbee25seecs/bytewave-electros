import { Link } from "@tanstack/react-router";
import { Star, Plus, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";

export interface ProductCardData {
  id: string;
  title: string;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  rating: number;
  reviews_count: number;
  image_url: string | null;
  category: string;
  quantity: number;
}

export function ProductCard({ p }: { p: ProductCardData }) {
  const { add } = useCart();
  const inStock = p.quantity > 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-card transition-all hover:border-primary/50 hover:glow">
      <Link to="/shop" className="relative aspect-square overflow-hidden bg-muted/40">
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Cpu className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        {p.compare_at_price && p.compare_at_price > p.price && (
          <Badge className="absolute left-3 top-3 bg-gradient-primary">
            -{Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100)}%
          </Badge>
        )}
        {!inStock && (
          <Badge variant="secondary" className="absolute right-3 top-3">
            Out of stock
          </Badge>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {p.category}
          </span>
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 fill-warning text-warning" />
            <span>{Number(p.rating).toFixed(1)}</span>
            <span className="text-muted-foreground">({p.reviews_count})</span>
          </div>
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{p.title}</h3>
        {p.sku && <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">${Number(p.price).toFixed(2)}</span>
            {p.compare_at_price && p.compare_at_price > p.price && (
              <span className="text-xs text-muted-foreground line-through">
                ${Number(p.compare_at_price).toFixed(2)}
              </span>
            )}
          </div>
          <Button
            size="icon"
            disabled={!inStock}
            onClick={() =>
              add({
                id: p.id,
                title: p.title,
                price: Number(p.price),
                image_url: p.image_url,
                sku: p.sku,
              })
            }
            className="h-8 w-8 bg-gradient-primary text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
