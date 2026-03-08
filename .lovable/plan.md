# Fix: Super Admin with Shop Sees All Menu Items

## Problem  
Ak spice owner is only for his shop admin or owner  
super admin is manage all shop and see all shop datas

The Ak Spice owner has `super_admin` role in `user_roles` AND is a shop member. Currently, the code filters to show ONLY the "Super Admin" menu item for any super admin. But this user needs access to both their shop (Dashboard, Sales, etc.) AND the Super Admin panel.

## Root Cause

The menu filtering logic does `if (isSuperAdmin) return only superAdminOnly items`, without considering whether the super admin also owns a shop.

## Changes

### 1. Sidebar.tsx + TopNavigation.tsx - Update menu filtering

Change the logic so that if `isSuperAdmin` AND the user has a shop (`shop !== null`), show ALL menu items (Super Admin + shop items). If `isSuperAdmin` with no shop, show only Super Admin.

```typescript
if (isSuperAdmin && !shop) return allMenuItems.filter(item => item.superAdminOnly);
if (isSuperAdmin && shop) return allMenuItems; // show everything
// else existing logic...
```

### 2. App.tsx - Fix root route redirect

Only redirect `/` to `/super-admin` if the super admin has no shop. If they have a shop, show Dashboard as default.

### 3. MobileSidebar.tsx - Fix hardcoded "Ak Spice" header

Pass `shopName` and `isSuperAdmin` props to show the dynamic shop name instead of hardcoded "Ak Spice".

### 4. DesktopSidebar.tsx - Fix header for super admin with shop

When super admin has a shop, show shop name instead of "Super Admin Panel".