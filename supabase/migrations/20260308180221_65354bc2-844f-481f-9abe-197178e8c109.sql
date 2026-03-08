
-- Create shops table
CREATE TABLE public.shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- Create shop_members table
CREATE TABLE public.shop_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'staff')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(shop_id, user_id)
);

ALTER TABLE public.shop_members ENABLE ROW LEVEL SECURITY;

-- Create shop_invitations table
CREATE TABLE public.shop_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('staff')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shop_invitations ENABLE ROW LEVEL SECURITY;

-- Add shop_id to products and receipts (nullable initially for migration)
ALTER TABLE public.products ADD COLUMN shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE;
ALTER TABLE public.receipts ADD COLUMN shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE;

-- Security definer: get user's shop_id
CREATE OR REPLACE FUNCTION public.get_user_shop_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT shop_id FROM public.shop_members WHERE user_id = _user_id LIMIT 1
$$;

-- Security definer: check shop membership
CREATE OR REPLACE FUNCTION public.is_shop_member(_user_id uuid, _shop_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shop_members WHERE user_id = _user_id AND shop_id = _shop_id
  )
$$;

-- Security definer: get user's shop role
CREATE OR REPLACE FUNCTION public.get_shop_role(_user_id uuid, _shop_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.shop_members WHERE user_id = _user_id AND shop_id = _shop_id LIMIT 1
$$;

-- RLS for shops: members can read their shop, super_admin can read all
CREATE POLICY "Members can read own shop" ON public.shops
  FOR SELECT TO authenticated
  USING (
    public.is_shop_member(auth.uid(), id)
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Super admin can manage all shops" ON public.shops
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Owner can insert shop on signup" ON public.shops
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- RLS for shop_members: members can read their shop's members, super_admin can read all
CREATE POLICY "Members can read own shop members" ON public.shop_members
  FOR SELECT TO authenticated
  USING (
    public.is_shop_member(auth.uid(), shop_id)
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Shop admin/owner can manage members" ON public.shop_members
  FOR ALL TO authenticated
  USING (
    public.get_shop_role(auth.uid(), shop_id) IN ('owner', 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    public.get_shop_role(auth.uid(), shop_id) IN ('owner', 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- RLS for shop_invitations
CREATE POLICY "Shop admin can manage invitations" ON public.shop_invitations
  FOR ALL TO authenticated
  USING (
    public.get_shop_role(auth.uid(), shop_id) IN ('owner', 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    public.get_shop_role(auth.uid(), shop_id) IN ('owner', 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Invited user can read own invitation" ON public.shop_invitations
  FOR SELECT TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Now update products RLS: drop old policies and create shop-based ones
DROP POLICY IF EXISTS "authenticated_users_products_select" ON public.products;
DROP POLICY IF EXISTS "authenticated_users_products_insert" ON public.products;
DROP POLICY IF EXISTS "authenticated_users_products_update" ON public.products;
DROP POLICY IF EXISTS "authenticated_users_products_delete" ON public.products;

CREATE POLICY "shop_products_select" ON public.products
  FOR SELECT TO authenticated
  USING (
    shop_id = public.get_user_shop_id(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "shop_products_insert" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (
    shop_id = public.get_user_shop_id(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "shop_products_update" ON public.products
  FOR UPDATE TO authenticated
  USING (
    shop_id = public.get_user_shop_id(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    shop_id = public.get_user_shop_id(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "shop_products_delete" ON public.products
  FOR DELETE TO authenticated
  USING (
    shop_id = public.get_user_shop_id(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- Update receipts RLS
DROP POLICY IF EXISTS "authenticated_users_receipts_select" ON public.receipts;
DROP POLICY IF EXISTS "authenticated_users_receipts_insert" ON public.receipts;
DROP POLICY IF EXISTS "authenticated_users_receipts_update" ON public.receipts;
DROP POLICY IF EXISTS "authenticated_users_receipts_delete" ON public.receipts;

CREATE POLICY "shop_receipts_select" ON public.receipts
  FOR SELECT TO authenticated
  USING (
    shop_id = public.get_user_shop_id(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "shop_receipts_insert" ON public.receipts
  FOR INSERT TO authenticated
  WITH CHECK (
    shop_id = public.get_user_shop_id(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "shop_receipts_update" ON public.receipts
  FOR UPDATE TO authenticated
  USING (
    shop_id = public.get_user_shop_id(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    shop_id = public.get_user_shop_id(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "shop_receipts_delete" ON public.receipts
  FOR DELETE TO authenticated
  USING (
    shop_id = public.get_user_shop_id(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- Update receipt_items RLS to use shop-based receipts
DROP POLICY IF EXISTS "authenticated_users_receipt_items_select" ON public.receipt_items;
DROP POLICY IF EXISTS "authenticated_users_receipt_items_insert" ON public.receipt_items;
DROP POLICY IF EXISTS "authenticated_users_receipt_items_update" ON public.receipt_items;
DROP POLICY IF EXISTS "authenticated_users_receipt_items_delete" ON public.receipt_items;

CREATE POLICY "shop_receipt_items_select" ON public.receipt_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.receipts r
      WHERE r.id = receipt_items.receipt_id
      AND (r.shop_id = public.get_user_shop_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'))
    )
  );

CREATE POLICY "shop_receipt_items_insert" ON public.receipt_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.receipts r
      WHERE r.id = receipt_items.receipt_id
      AND (r.shop_id = public.get_user_shop_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'))
    )
  );

CREATE POLICY "shop_receipt_items_update" ON public.receipt_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.receipts r
      WHERE r.id = receipt_items.receipt_id
      AND (r.shop_id = public.get_user_shop_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.receipts r
      WHERE r.id = receipt_items.receipt_id
      AND (r.shop_id = public.get_user_shop_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'))
    )
  );

CREATE POLICY "shop_receipt_items_delete" ON public.receipt_items
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.receipts r
      WHERE r.id = receipt_items.receipt_id
      AND (r.shop_id = public.get_user_shop_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'))
    )
  );

-- Update user_roles RLS to allow super_admin to manage all roles
CREATE POLICY "Super admin can manage all roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Update the signup trigger to create shop_owner + pending shop
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invitation record;
  _shop_id uuid;
BEGIN
  -- Check if this user has a pending invitation
  SELECT * INTO _invitation
  FROM public.shop_invitations
  WHERE email = NEW.email AND status = 'pending'
  LIMIT 1;

  IF _invitation IS NOT NULL THEN
    -- User was invited: assign staff role, join existing shop
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'staff');
    INSERT INTO public.shop_members (shop_id, user_id, role) VALUES (_invitation.shop_id, NEW.id, 'staff');
    UPDATE public.shop_invitations SET status = 'accepted' WHERE id = _invitation.id;
  ELSE
    -- New shop owner: create pending shop
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'shop_owner');
    INSERT INTO public.shops (name, owner_id, status) VALUES (
      split_part(NEW.email, '@', 1) || '''s Shop',
      NEW.id,
      'pending'
    ) RETURNING id INTO _shop_id;
    INSERT INTO public.shop_members (shop_id, user_id, role) VALUES (_shop_id, NEW.id, 'owner');
  END IF;

  RETURN NEW;
END;
$$;
