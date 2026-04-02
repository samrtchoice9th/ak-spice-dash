
-- Create customers table
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  whatsapp_number text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(shop_id, phone)
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_customers_select" ON public.customers FOR SELECT TO authenticated
  USING (shop_id = get_user_shop_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "shop_customers_insert" ON public.customers FOR INSERT TO authenticated
  WITH CHECK (shop_id = get_user_shop_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "shop_customers_update" ON public.customers FOR UPDATE TO authenticated
  USING (shop_id = get_user_shop_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (shop_id = get_user_shop_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "shop_customers_delete" ON public.customers FOR DELETE TO authenticated
  USING (shop_id = get_user_shop_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create suppliers table
CREATE TABLE public.suppliers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  whatsapp_number text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(shop_id, phone)
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_suppliers_select" ON public.suppliers FOR SELECT TO authenticated
  USING (shop_id = get_user_shop_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "shop_suppliers_insert" ON public.suppliers FOR INSERT TO authenticated
  WITH CHECK (shop_id = get_user_shop_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "shop_suppliers_update" ON public.suppliers FOR UPDATE TO authenticated
  USING (shop_id = get_user_shop_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (shop_id = get_user_shop_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "shop_suppliers_delete" ON public.suppliers FOR DELETE TO authenticated
  USING (shop_id = get_user_shop_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Add columns to receipts table
ALTER TABLE public.receipts
  ADD COLUMN customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  ADD COLUMN supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  ADD COLUMN paid_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN due_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN due_date text;
