
-- Issue #5: Add UPDATE RLS policy for payments table
CREATE POLICY "shop_payments_update"
ON public.payments
FOR UPDATE
TO authenticated
USING ((shop_id = get_user_shop_id(auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK ((shop_id = get_user_shop_id(auth.uid())) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Issue #6: Make get_user_shop_id deterministic with ORDER BY
CREATE OR REPLACE FUNCTION public.get_user_shop_id(_user_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT shop_id FROM public.shop_members WHERE user_id = _user_id ORDER BY created_at ASC LIMIT 1
$$;
