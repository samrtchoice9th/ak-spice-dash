

# Code Review: Bugs, Structure Issues, and Security Findings

After reviewing the full codebase, here are the issues found, ordered by severity.

---

## Critical Bug: Super Admin Shop View Shows All Shops' Data

When a super admin clicks a shop name and navigates to its dashboard, the data contexts (`ReceiptsContext`, `ProductsContext`) fetch **all data across all shops** because:
- RLS policies grant `super_admin` access to everything: `OR has_role(auth.uid(), 'super_admin')`
- Neither `receiptService.getAllReceipts()` nor `productService.getAllProducts()` filter by `shop_id`
- The `overrideShop` in `ShopContext` is never passed to data-fetching services

**Fix**: Pass the active `shop.id` from `ShopContext` into the service calls and add `.eq('shop_id', shopId)` filters.

---

## Critical Bug: Super Admin Cannot Create Receipts/Products for Viewed Shop

`getShopId()` in both `receiptService.ts` and `productService.ts` queries `shop_members` for the current user's membership. If the super admin is not a member of the shop they're viewing, this throws "User not assigned to a shop" and all create/update operations fail.

**Fix**: Accept an optional `shopId` parameter in service methods, or expose the active shop ID from `ShopContext` and use it directly instead of querying `shop_members`.

---

## Structural Issue: Duplicated Menu Items Definition

`allMenuItems` is defined identically in **three** files: `Sidebar.tsx`, `TopNavigation.tsx`, and likely referenced similarly. This violates DRY and creates maintenance risk.

**Fix**: Extract to a shared `src/config/menuItems.ts` file and import everywhere.

---

## Minor Bug: No Email Validation on Staff Invitation

`handleInviteStaff` in `Settings.tsx` only checks for empty string, not valid email format. A malformed email would be inserted into the database.

**Fix**: Validate with `emailSchema` from `validations.ts` before inserting.

---

## Minor Bug: MobileSidebar Missing "Back to Admin Panel" Button

`DesktopSidebar` and `TopNavigation` both have the "Back to Admin Panel" button when `isViewingAsAdmin` is true, but `MobileSidebar` (the slide-out drawer) does not.

**Fix**: Add the same back button to `MobileSidebar.tsx`.

---

## Security: Shop Name Update Has No Length Validation

`handleUpdateShopName` in `Settings.tsx` only checks for empty string but has no max length limit, allowing arbitrarily long shop names.

**Fix**: Add `.max(100)` validation before the update call.

---

## Summary of Recommended Changes

| File | Change |
|---|---|
| `src/services/receiptService.ts` | Add `shop_id` filter to queries; accept shop ID parameter |
| `src/services/productService.ts` | Add `shop_id` filter to queries; accept shop ID parameter |
| `src/contexts/ReceiptsContext.tsx` | Pass active shop ID from ShopContext to service calls |
| `src/contexts/ProductsContext.tsx` | Pass active shop ID from ShopContext to service calls |
| `src/config/menuItems.ts` | New file — extract shared menu items |
| `src/components/Sidebar.tsx` | Import from shared config |
| `src/components/TopNavigation.tsx` | Import from shared config |
| `src/components/MobileSidebar.tsx` | Add "Back to Admin Panel" button |
| `src/pages/Settings.tsx` | Add email + shop name length validation |

The two critical bugs (data isolation + create operations) are the highest priority since they affect core functionality when a super admin views a shop.

