
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);

DO $$
DECLARE
  first_admin uuid;
BEGIN
  SELECT user_id INTO first_admin FROM public.user_roles WHERE role = 'admin' LIMIT 1;
  IF first_admin IS NOT NULL THEN
    UPDATE public.products SET seller_id = first_admin WHERE seller_id IS NULL;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.seller_owns_order(_order_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    WHERE oi.order_id = _order_id AND p.seller_id = _user_id
  )
$$;

REVOKE EXECUTE ON FUNCTION public.seller_owns_order(uuid, uuid) FROM PUBLIC, anon;

DROP POLICY IF EXISTS "Sellers can view own products" ON public.products;
CREATE POLICY "Sellers can view own products"
  ON public.products FOR SELECT TO authenticated
  USING (seller_id = auth.uid() AND public.has_role(auth.uid(), 'seller'::app_role));

DROP POLICY IF EXISTS "Sellers can insert own products" ON public.products;
CREATE POLICY "Sellers can insert own products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (seller_id = auth.uid() AND public.has_role(auth.uid(), 'seller'::app_role));

DROP POLICY IF EXISTS "Sellers can update own products" ON public.products;
CREATE POLICY "Sellers can update own products"
  ON public.products FOR UPDATE TO authenticated
  USING (seller_id = auth.uid() AND public.has_role(auth.uid(), 'seller'::app_role))
  WITH CHECK (seller_id = auth.uid() AND public.has_role(auth.uid(), 'seller'::app_role));

DROP POLICY IF EXISTS "Sellers can delete own products" ON public.products;
CREATE POLICY "Sellers can delete own products"
  ON public.products FOR DELETE TO authenticated
  USING (seller_id = auth.uid() AND public.has_role(auth.uid(), 'seller'::app_role));

DROP POLICY IF EXISTS "Sellers can view orders with their products" ON public.orders;
CREATE POLICY "Sellers can view orders with their products"
  ON public.orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'seller'::app_role) AND public.seller_owns_order(id, auth.uid()));

DROP POLICY IF EXISTS "Sellers can update orders with their products" ON public.orders;
CREATE POLICY "Sellers can update orders with their products"
  ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'seller'::app_role) AND public.seller_owns_order(id, auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'seller'::app_role) AND public.seller_owns_order(id, auth.uid()));

DROP POLICY IF EXISTS "Sellers can view their order items" ON public.order_items;
CREATE POLICY "Sellers can view their order items"
  ON public.order_items FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'seller'::app_role)
    AND EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.seller_id = auth.uid())
  );
