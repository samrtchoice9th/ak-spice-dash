
-- Add unique constraint on products (name, shop_id) to prevent duplicates
ALTER TABLE products ADD CONSTRAINT products_name_shop_unique UNIQUE (name, shop_id);

-- Update signup trigger to always assign new users to the existing single shop
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _shop_id uuid := 'a0000000-0000-0000-0000-000000000001';
BEGIN
  -- Auto-assign super_admin for specific email
  IF NEW.email = 'smartchoice9thmile@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin');
    INSERT INTO public.shop_members (shop_id, user_id, role)
    VALUES (_shop_id, NEW.id, 'owner')
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  END IF;

  -- All new users get 'staff' role and join the single shop
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'staff');
  INSERT INTO public.shop_members (shop_id, user_id, role)
  VALUES (_shop_id, NEW.id, 'staff')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;
