
-- Step 1: Extend app_role enum with new values
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'shop_owner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'staff';
