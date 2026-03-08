

# Multi-Shop Architecture with Super Admin / Admin / Staff Roles

## Overview

Transform the current single-shop app into a multi-tenant system with four roles: **Super Admin** (system-wide), **Shop Owner** (pending approval), **Admin** (per-shop), and **Staff** (per-shop, limited). New shop registrations require Super Admin approval before becoming active.

## Database Changes

### 1. Update Role Enum
Extend `app_role` to include new roles:
```sql
ALTER TYPE public.app_role ADD VALUE 'super_admin';
ALTER TYPE public.app_role ADD VALUE 'shop_owner';
ALTER TYPE public.app_role ADD VALUE 'staff';
```

### 2. Create `shops` Table
```
shops
  id          uuid PK
  name        text NOT NULL
  owner_id    uuid -> auth.users(id)
  status      text ('pending' | 'active' | 'suspended') DEFAULT 'pending'
  created_at  timestamptz DEFAULT now()
```

### 3. Create `shop_members` Table
Links users to shops with their shop-level role.
```
shop_members
  id        uuid PK
  shop_id   uuid -> shops(id) ON DELETE CASCADE
  user_id   uuid -> auth.users(id) ON DELETE CASCADE
  role      text ('owner' | 'admin' | 'staff')
  created_at timestamptz DEFAULT now()
  UNIQUE(shop_id, user_id)
```

### 4. Create `shop_invitations` Table
For admin to invite staff.
```
shop_invitations
  id        uuid PK
  shop_id   uuid -> shops(id) ON DELETE CASCADE
  email     text NOT NULL
  role      text ('staff') DEFAULT 'staff'
  status    text ('pending' | 'accepted') DEFAULT 'pending'
  created_at timestamptz DEFAULT now()
```

### 5. Add `shop_id` to Existing Tables
Add `shop_id` (nullable initially) to `products` and `receipts`. Migrate existing data, then make NOT NULL.

### 6. Migrate Existing Data
- Create shop "Ak Spice" with `owner_id` = admin user (`287bbc16-...`), `status` = 'active'
- Add both existing users to `shop_members` (admin as 'owner', other as 'staff')
- Set `shop_id` on all existing products and receipts
- Assign `super_admin` role to the admin user in `user_roles`

### 7. Security Definer Functions
```sql
-- Get user's shop_id
CREATE FUNCTION public.get_user_shop_id(_user_id uuid) RETURNS uuid

-- Check shop membership
CREATE FUNCTION public.is_shop_member(_user_id uuid, _shop_id uuid) RETURNS boolean
```

### 8. Update RLS Policies
Replace all `user_id = auth.uid()` policies with shop-based policies:
- `products`: `shop_id = get_user_shop_id(auth.uid())`
- `receipts`: same
- `receipt_items`: via receipts join
- Super admin bypass: `OR has_role(auth.uid(), 'super_admin')`

### 9. Update Signup Trigger
Change `handle_new_user_role` to:
- Assign 'shop_owner' role (not 'user')
- Create a new shop with status 'pending'
- Add user as 'owner' in `shop_members`

## Frontend Changes

### 1. New Context: `ShopContext.tsx`
- Fetch current user's shop from `shop_members`
- Provide `{ shop, shopMembers, isShopActive }` to all components
- Gate all data pages behind `isShopActive` check

### 2. Update Role System (`useUserRole.ts`)
- Support new roles: `super_admin`, `admin`, `staff`, `shop_owner`
- Return `{ role, isSuperAdmin, isAdmin, isStaff, loading }`
- `isAdmin` = true for both `super_admin` and `admin`

### 3. New Page: Super Admin Dashboard (`/super-admin`)
- List all shops with status (pending/active/suspended)
- Approve/reject pending shops
- Assign admin to shops
- View all shop data

### 4. Pending Approval Screen
- When a shop owner logs in and shop status is 'pending', show a "Your shop is pending approval" message instead of the app
- No access to any data pages until approved

### 5. Update Services
- `productService.ts`: Include `shop_id` when creating products
- `receiptService.ts`: Include `shop_id` when creating receipts
- RLS handles filtering, but inserts need `shop_id`

### 6. Update Navigation
- **Super Admin**: Sees all pages + "Super Admin" panel
- **Admin**: Sees all shop pages (Dashboard, Sales, Purchase, Stock Adjustment, Inventory, Receipt, Report, Settings)
- **Staff**: Sees only pages assigned (default: Sales, Purchase, Receipt)
- Shop name displayed dynamically from ShopContext

### 7. Update Settings Page
- Add "Shop" tab (admin only): Shop name, member list, invite staff
- Add "Staff Management" section: Add/remove staff, view members

### 8. Update Auth Page
- Normal signup creates a new shop (pending)
- If email has pending invitation, join existing shop as staff instead

### 9. Update Receipt Print
- Use shop name from ShopContext instead of hardcoded "AK SPICE TRADING"

## Access Matrix

| Page | Super Admin | Admin | Staff | Shop Owner (pending) |
|------|------------|-------|-------|---------------------|
| Super Admin Panel | Yes | No | No | No |
| Dashboard | Yes (all shops) | Yes (own shop) | No | No |
| Sales | Yes | Yes | Yes | No |
| Purchase | Yes | Yes | Yes | No |
| Stock Adjustment | Yes | Yes | No | No |
| Inventory | Yes | Yes | No | No |
| Receipt | Yes | Yes | Yes | No |
| Report | Yes | Yes | No | No |
| Settings | Yes | Yes | No | No |

## Files to Create/Modify

| Action | File |
|--------|------|
| Create | Migration: shops, shop_members, shop_invitations tables |
| Create | Migration: add shop_id to products & receipts, migrate data |
| Create | Migration: update RLS policies for shop-based access |
| Create | Migration: update role enum, helper functions |
| Create | `src/contexts/ShopContext.tsx` |
| Create | `src/pages/SuperAdmin.tsx` |
| Create | `src/components/PendingApprovalScreen.tsx` |
| Modify | `src/hooks/useUserRole.ts` — support 4 roles |
| Modify | `src/components/RoleProtectedRoute.tsx` — support super_admin |
| Modify | `src/components/Sidebar.tsx` — dynamic menu per role |
| Modify | `src/components/TopNavigation.tsx` — dynamic menu per role |
| Modify | `src/App.tsx` — add ShopProvider, super admin route, pending screen |
| Modify | `src/services/productService.ts` — add shop_id |
| Modify | `src/services/receiptService.ts` — add shop_id |
| Modify | `src/pages/Auth.tsx` — handle invitations on signup |
| Modify | `src/pages/Settings.tsx` — add shop/staff management tab |
| Modify | `src/utils/printReceipt.ts` — dynamic shop name |

