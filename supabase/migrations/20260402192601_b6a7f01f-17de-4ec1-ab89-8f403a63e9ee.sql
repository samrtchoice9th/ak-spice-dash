
-- Remove memberships for other shops
DELETE FROM shop_members WHERE shop_id != 'a0000000-0000-0000-0000-000000000001';

-- Add missing users to the single shop
INSERT INTO shop_members (shop_id, user_id, role)
SELECT 'a0000000-0000-0000-0000-000000000001', ur.user_id, 'staff'
FROM user_roles ur
WHERE NOT EXISTS (
  SELECT 1 FROM shop_members sm 
  WHERE sm.user_id = ur.user_id 
  AND sm.shop_id = 'a0000000-0000-0000-0000-000000000001'
);

-- Delete unused shops
DELETE FROM shops WHERE id != 'a0000000-0000-0000-0000-000000000001';
