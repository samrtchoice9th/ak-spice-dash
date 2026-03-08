
-- Add address and phone columns to shops table
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS phone text;

-- Update trigger to read metadata for shop name, address, phone
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _invitation record;
  _shop_id uuid;
  _shop_name text;
  _shop_address text;
  _shop_phone text;
BEGIN
  -- Auto-assign super_admin for specific email
  IF NEW.email = 'smartchoice9thmile@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin');
    RETURN NEW;
  END IF;

  -- Check if this user has a pending invitation
  SELECT * INTO _invitation
  FROM public.shop_invitations
  WHERE email = NEW.email AND status = 'pending'
  LIMIT 1;

  IF _invitation IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'staff');
    INSERT INTO public.shop_members (shop_id, user_id, role) VALUES (_invitation.shop_id, NEW.id, 'staff');
    UPDATE public.shop_invitations SET status = 'accepted' WHERE id = _invitation.id;
  ELSE
    -- Read metadata from signup
    _shop_name := COALESCE(NEW.raw_user_meta_data->>'shop_name', split_part(NEW.email, '@', 1) || '''s Shop');
    _shop_address := NEW.raw_user_meta_data->>'shop_address';
    _shop_phone := NEW.raw_user_meta_data->>'shop_phone';

    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'shop_owner');
    INSERT INTO public.shops (name, owner_id, status, address, phone) VALUES (
      _shop_name,
      NEW.id,
      'pending',
      _shop_address,
      _shop_phone
    ) RETURNING id INTO _shop_id;
    INSERT INTO public.shop_members (shop_id, user_id, role) VALUES (_shop_id, NEW.id, 'owner');
  END IF;

  RETURN NEW;
END;
$function$;
