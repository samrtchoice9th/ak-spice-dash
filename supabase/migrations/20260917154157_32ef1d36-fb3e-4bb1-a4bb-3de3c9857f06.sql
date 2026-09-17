CREATE TABLE public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT accounts_name_not_blank CHECK (btrim(name) <> '')
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_accounts_select" ON public.accounts
FOR SELECT TO authenticated
USING ((shop_id = public.get_user_shop_id(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "shop_accounts_insert" ON public.accounts
FOR INSERT TO authenticated
WITH CHECK ((shop_id = public.get_user_shop_id(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "shop_accounts_update" ON public.accounts
FOR UPDATE TO authenticated
USING ((shop_id = public.get_user_shop_id(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'))
WITH CHECK ((shop_id = public.get_user_shop_id(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "shop_accounts_delete" ON public.accounts
FOR DELETE TO authenticated
USING ((shop_id = public.get_user_shop_id(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));

CREATE UNIQUE INDEX accounts_shop_name_unique_idx ON public.accounts (shop_id, lower(btrim(name)));

CREATE TABLE public.day_book_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  description text NOT NULL DEFAULT '',
  debit numeric(14,2),
  credit numeric(14,2),
  entry_order integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT day_book_one_sided_amount CHECK (
    (debit IS NOT NULL AND debit > 0 AND credit IS NULL)
    OR (credit IS NOT NULL AND credit > 0 AND debit IS NULL)
  ),
  CONSTRAINT day_book_entry_order_nonnegative CHECK (entry_order >= 0)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.day_book_entries TO authenticated;
GRANT ALL ON public.day_book_entries TO service_role;

ALTER TABLE public.day_book_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_day_book_entries_select" ON public.day_book_entries
FOR SELECT TO authenticated
USING ((shop_id = public.get_user_shop_id(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "shop_day_book_entries_insert" ON public.day_book_entries
FOR INSERT TO authenticated
WITH CHECK (
  ((shop_id = public.get_user_shop_id(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'))
  AND EXISTS (
    SELECT 1 FROM public.accounts a
    WHERE a.id = account_id AND a.shop_id = day_book_entries.shop_id
  )
);

CREATE POLICY "shop_day_book_entries_update" ON public.day_book_entries
FOR UPDATE TO authenticated
USING ((shop_id = public.get_user_shop_id(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (
  ((shop_id = public.get_user_shop_id(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'))
  AND EXISTS (
    SELECT 1 FROM public.accounts a
    WHERE a.id = account_id AND a.shop_id = day_book_entries.shop_id
  )
);

CREATE POLICY "shop_day_book_entries_delete" ON public.day_book_entries
FOR DELETE TO authenticated
USING ((shop_id = public.get_user_shop_id(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));

CREATE INDEX day_book_entries_shop_date_order_idx
ON public.day_book_entries (shop_id, entry_date, entry_order, created_at);

CREATE OR REPLACE FUNCTION public.set_day_book_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_accounts_updated_at
BEFORE UPDATE ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.set_day_book_updated_at();

CREATE TRIGGER set_day_book_entries_updated_at
BEFORE UPDATE ON public.day_book_entries
FOR EACH ROW EXECUTE FUNCTION public.set_day_book_updated_at();