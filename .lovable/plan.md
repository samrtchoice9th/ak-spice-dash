

# Clean Rebuild: Single Shop, Simplified Roles

## Overview
Strip out all multi-shop complexity (ShopContext, ShopProvider, switchShop, shop membership queries, SuperAdmin page). Replace with a simple 3-role system where access is controlled purely by `user_roles`.

## New Role Definitions

| Role | Pages |
|------|-------|
| `super_admin` | All pages (Dashboard, Sales, Purchase, Stock Adjustment, Inventory, Receipt, Report, Settings) |
| `admin` | Sales, Purchase, Receipt, Report |
| `user` | Sales, Purchase |

## Changes

### 1. Remove multi-shop files and references
- **Delete** `src/contexts/ShopContext.tsx`
- **Delete** `src/pages/SuperAdmin.tsx`
- **Delete** `src/components/ShopDetailView.tsx`
- **Delete** `src/components/PendingApprovalScreen.tsx`
- Remove all `ShopProvider`, `useShop`, `switchShop`, `exitShop`, `isViewingAsAdmin` usage from:
  - `src/App.tsx`
  - `src/components/Sidebar.tsx`
  - `src/components/DesktopSidebar.tsx`
  - `src/components/TopNavigation.tsx`
  - `src/components/MobileSidebar.tsx`

### 2. Simplify `useUserRole.ts`
- Remove `shop_owner` and `staff` roles
- Only 3 roles: `super_admin`, `admin`, `user`
```
isSuperAdmin: role === 'super_admin'
isAdmin: role === 'super_admin' || role === 'admin'
```

### 3. Update `menuItems.ts` with new access rules
Replace `superAdminOnly` / `adminOnly` / `staffVisible` with a single `minRole` field:
- Dashboard → `super_admin`
- Sales → `user`
- Purchase → `user`
- Stock Adjustment → `super_admin`
- Inventory → `super_admin`
- Receipt → `admin`
- Report → `admin`
- Settings → `super_admin`

Remove the Super Admin menu item entirely.

### 4. Update `RoleProtectedRoute.tsx`
Simplify to check against the 3 roles. Routes accessible to `user` need no wrapper. Routes for `admin` check `isAdmin`. Routes for `super_admin` check `isSuperAdmin`.

### 5. Simplify `App.tsx`
- Remove `ShopProvider` wrapper
- Remove `AppContent` component (no shop loading logic needed)
- Inline the layout directly
- Remove super admin redirect logic
- Apply correct `RoleProtectedRoute` wrappers per the role table above

### 6. Clean up services
- Remove `shopId` parameters from `productService.ts` and `receiptService.ts`
- Remove shop_members queries from services (data scoped by RLS using `user_id` or kept as-is)

### 7. Simplify Sidebar/Navigation
- Remove shop name display, "Back to Admin" buttons
- Show app name or a simple title instead

