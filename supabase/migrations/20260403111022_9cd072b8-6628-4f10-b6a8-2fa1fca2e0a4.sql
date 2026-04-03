
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid REFERENCES public.receipts(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid,
  supplier_id uuid,
  amount numeric NOT NULL CHECK (amount > 0),
  payment_type text NOT NULL CHECK (payment_type IN ('in', 'out')),
  payment_method text NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank', 'other')),
  note text,
  shop_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_payments_select" ON public.payments
  FOR SELECT TO authenticated
  USING ((shop_id = get_user_shop_id(auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "shop_payments_insert" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK ((shop_id = get_user_shop_id(auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "shop_payments_delete" ON public.payments
  FOR DELETE TO authenticated
  USING ((shop_id = get_user_shop_id(auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role));
