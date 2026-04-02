

# Single Shop Enforcement — All Users Share One Shop

## Current State

- **3 shops exist**: `Ak Spice` (a0000000-...0001), `ihsan456's Shop`, `Demo Shop`
- **All real data** (84 products, 6079 receipts, customers, suppliers) is already in `Ak Spice`
- **Problem**: 2 users are in separate shops, so RLS filters prevent them from seeing shared data. When they create data, it goes to their own shop — causing duplication.
- **Edge function bug**: `getOrCreateProduct` and `reverseStockEffect` don't filter by `shop_id`, so product lookups can collide across shops.

## Database Changes (Migration)

### 1. Move all users to the single shop

```sql
-- Delete orphan shop memberships
DELETE FROM shop_members WHERE shop_id != 'a0000000-0000-0000-0000-000000000001';

-- Insert missing users into Ak Spice shop
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

-- Add unique constraint on products (name, shop_id) to prevent duplicates
ALTER TABLE products ADD CONSTRAINT products_name_shop_unique UNIQUE (name, shop_id);
```

### 2. Update signup trigger to always assign to the single shop

Replace `handle_new_user_role()` so new users are added to the existing shop instead of creating a new one.

## Edge Function Fix — `manage-receipt/index.ts`

### Add `shop_id` filter to all product lookups

- `getOrCreateProduct()`: add `.eq("shop_id", shopId)` to query
- `reverseStockEffect()`: add `shopId` parameter, filter by it
- `handleDelete()`: pass `shopId` (currently missing)
- Throw error if `shopId` is null (no fallback allowed)

## Client-Side — No Major Changes

The services already query `shop_members` for `shop_id`. Since all users will now be in the same shop, they'll all get the same `shop_id` and see/modify the same data. RLS policies already scope by `shop_id` — this is correct.

## Files Changed

| File | Change |
|------|--------|
| Migration SQL | Move users, delete extra shops, add unique constraint, update trigger |
| `supabase/functions/manage-receipt/index.ts` | Add `shop_id` filter to product queries, require shopId |

## Execution Order

1. Run migration to consolidate all users into single shop
2. Update edge function with shop_id filters
3. Update signup trigger to assign new users to existing shop

