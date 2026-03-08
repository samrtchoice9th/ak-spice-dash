

# Super Admin: Dedicated Panel with Shop Data Viewer

## Overview
When a super admin logs in, they should **only** see the Super Admin panel in navigation (no Dashboard, Sales, etc.). The Super Admin panel will show a list of active shops that are clickable, revealing that shop's products, receipts, and inventory data.

## Changes

### 1. Navigation - Show only Super Admin for super_admin role
**Files**: `src/components/Sidebar.tsx`, `src/components/TopNavigation.tsx`
- Update the menu filtering logic: if `isSuperAdmin`, only show the Super Admin menu item (filter out all others)
- Currently super admin sees ALL menu items — change to only show `{ name: 'Super Admin', path: '/super-admin' }`

### 2. App routing - Redirect super admin to /super-admin by default
**File**: `src/App.tsx`
- When `isSuperAdmin`, redirect `/` to `/super-admin` instead of showing Dashboard
- Super admin has no shop membership, so Dashboard/Sales/etc. would be empty anyway

### 3. Super Admin Panel - Add clickable shop detail view
**File**: `src/pages/SuperAdmin.tsx`
- Add a `selectedShop` state. When an active shop card is clicked, show a detail view
- Detail view fetches and displays:
  - **Products** (from `products` table where `shop_id = selected shop`)
  - **Receipts** (from `receipts` table where `shop_id = selected shop`) with totals
  - **Shop info**: name, address, phone, members count
- Add a "Back" button to return to the shops list
- Keep existing approve/suspend functionality for pending/active tabs

### 4. Shop Detail Component
**New file**: `src/components/ShopDetailView.tsx`
- Receives `shopId` and `shopName` as props
- Tabs: **Products** | **Receipts** | **Members**
- Products tab: table with name, price, current stock
- Receipts tab: table with date, type, total amount
- Members tab: list of shop members with roles
- All queries use super admin's RLS access (already permitted by existing policies)

## Execution Order
1. Update Sidebar + TopNavigation filtering for super admin
2. Update App.tsx routing to redirect super admin to /super-admin
3. Create ShopDetailView component
4. Update SuperAdmin page with clickable shops and detail view

