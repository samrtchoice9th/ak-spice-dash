
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _invitation record;
  _shop_id uuid;
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
$function$;
