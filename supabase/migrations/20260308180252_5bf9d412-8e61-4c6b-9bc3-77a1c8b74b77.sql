
-- Migrate existing data: create Ak Spice shop, assign members, update shop_id

-- Create the Ak Spice shop
INSERT INTO public.shops (id, name, owner_id, status)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Ak Spice', '287bbc16-1592-4e5d-8c58-f0aa1783d6cc', 'active');

-- Add both users as shop members
INSERT INTO public.shop_members (shop_id, user_id, role)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', '287bbc16-1592-4e5d-8c58-f0aa1783d6cc', 'owner'),
  ('a0000000-0000-0000-0000-000000000001', 'af30598c-c72d-41fa-abc7-aa4198d91673', 'staff');

-- Update existing products and receipts with shop_id
UPDATE public.products SET shop_id = 'a0000000-0000-0000-0000-000000000001' WHERE shop_id IS NULL;
UPDATE public.receipts SET shop_id = 'a0000000-0000-0000-0000-000000000001' WHERE shop_id IS NULL;

-- Upgrade admin user to super_admin
UPDATE public.user_roles SET role = 'super_admin' WHERE user_id = '287bbc16-1592-4e5d-8c58-f0aa1783d6cc';
