

# Fix: Correct Role-Based Menu Access

## Problem
The `useUserRole` hook defines `isAdmin` as only `super_admin || admin`, which **excludes `shop_owner`**. This means the Ak Spice owner (role: `shop_owner`) only sees staff-visible menu items instead of all shop management items (Dashboard, Inventory, Report, Settings, etc.).

Also need to ensure the Super Admin menu item never shows for non-super-admin users.

## Role Mapping (confirmed by user)
- **super_admin**: `smartchoice9thmile@gmail.com` — sees only Super Admin panel (no shop)
- **shop_owner**: `ak7live1140@gmail.com` — sees all shop items, NO Super Admin
- **staff**: `msanan7@gmail.com` — sees only staff-visible items (Sales, Purchase, Receipt)

## Changes

### 1. `src/hooks/useUserRole.ts` — Include `shop_owner` in admin check
```typescript
isAdmin: role === 'super_admin' || role === 'admin' || role === 'shop_owner',
```
This allows shop owners to see all admin-level menu items (Dashboard, Inventory, Report, Settings, Stock Adjustment).

### 2. `src/components/Sidebar.tsx` + `src/components/TopNavigation.tsx` — Verify filtering
Current logic already correctly handles:
- `isSuperAdmin && !shop` → only Super Admin item
- `isSuperAdmin && shop` → all items
- `isAdmin` (now includes shop_owner) → all non-superAdminOnly items
- `isStaff` → only staffVisible items

No changes needed to menu filtering logic since fixing `isAdmin` resolves it.

