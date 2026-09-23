CREATE TABLE public.day_book_closures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  closure_date date NOT NULL,
  opening_balance numeric NOT NULL DEFAULT 0,
  total_credit numeric NOT NULL DEFAULT 0,
  total_debit numeric NOT NULL DEFAULT 0,
  closing_balance numeric NOT NULL DEFAULT 0,
  is_closed boolean NOT NULL DEFAULT true,
  closed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (shop_id, closure_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.day_book_closures TO authenticated;
GRANT ALL ON public.day_book_closures TO service_role;

ALTER TABLE public.day_book_closures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_day_book_closures_select" ON public.day_book_closures
  FOR SELECT TO authenticated
  USING (public.is_shop_member(auth.uid(), shop_id) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "shop_day_book_closures_insert" ON public.day_book_closures
  FOR INSERT TO authenticated
  WITH CHECK (public.is_shop_member(auth.uid(), shop_id) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "shop_day_book_closures_update" ON public.day_book_closures
  FOR UPDATE TO authenticated
  USING (public.is_shop_member(auth.uid(), shop_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_shop_member(auth.uid(), shop_id) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "shop_day_book_closures_delete" ON public.day_book_closures
  FOR DELETE TO authenticated
  USING (public.is_shop_member(auth.uid(), shop_id) OR public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER set_day_book_closures_updated_at
  BEFORE UPDATE ON public.day_book_closures
  FOR EACH ROW EXECUTE FUNCTION public.set_day_book_updated_at();

CREATE INDEX idx_day_book_closures_shop_date ON public.day_book_closures (shop_id, closure_date DESC);