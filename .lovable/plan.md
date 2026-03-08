

# Navigate to Shop Dashboard from Super Admin Panel

## Problem
When a super admin clicks a shop name in the admin panel, it currently shows a `ShopDetailView` component inline. The user wants it to navigate to the actual shop dashboard with full navigation (sidebar, sales, inventory, etc.).

## Approach
Add a `switchShop` method to `ShopContext` that lets the super admin override the active shop. When they click a shop in the Super Admin panel, we set that shop as the active context and navigate to `/` (the Dashboard).

## Changes

### 1. `src/contexts/ShopContext.tsx` — Add `switchShop` and `exitShop`
- Add `switchShop(shop: Shop)` to set an overridden shop (stores shop data directly, bypassing membership lookup)
- Add `exitShop()` to clear the override and return to super admin mode
- Add `isViewingAsAdmin` boolean to indicate when a super admin is viewing a shop they don't belong to
- Update context type to expose these new methods

### 2. `src/pages/SuperAdmin.tsx` — Navigate on shop click
- Import `useNavigate` from react-router and `useShop` context
- When an active shop is clicked, call `switchShop(shop)` then `navigate('/')`
- Remove the `selectedShop` / `ShopDetailView` logic (no longer needed)

### 3. `src/components/Sidebar.tsx` + `src/components/DesktopSidebar.tsx` — Add "Back to Admin" button
- When `isViewingAsAdmin` is true, show a "Back to Admin Panel" button at the top of the sidebar
- Clicking it calls `exitShop()` and navigates to `/super-admin`

### 4. `src/components/TopNavigation.tsx` — Add "Back to Admin" in mobile nav
- Same "Back to Admin Panel" button when `isViewingAsAdmin` is true

## Behavior Summary
- Super admin clicks shop name → shop loads into context → navigates to `/` (Dashboard)
- Sidebar/nav shows shop items + "Back to Admin Panel" button
- Clicking "Back to Admin" clears shop context → navigates to `/super-admin`

