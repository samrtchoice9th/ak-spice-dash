

# Remove Super Admin from TopNavigation

## Problem
The "Super Admin" menu item appears in the TopNavigation bar for the Ak Spice dashboard, as shown in the screenshot. It should not be visible there.

## Change

### `src/components/TopNavigation.tsx`
Filter out the `superAdminOnly` items from the top navigation menu. The Super Admin link should only be accessible from the sidebar, not the horizontal top nav.

```typescript
// In the menuItems useMemo, filter out superAdminOnly items entirely
const menuItems = useMemo(() => {
  const filtered = (() => {
    if (isSuperAdmin && !shop) return allMenuItems.filter(item => item.superAdminOnly);
    if (isSuperAdmin && shop) return allMenuItems;
    return allMenuItems.filter(item => {
      if (item.superAdminOnly) return false;
      if (isAdmin) return true;
      if (isStaff) return item.staffVisible;
      return item.staffVisible;
    });
  })();
  // Remove Super Admin from top nav - it's only in the sidebar
  return filtered.filter(item => !item.superAdminOnly);
}, [isSuperAdmin, isAdmin, isStaff, shop]);
```

This keeps the Super Admin accessible via the sidebar while decluttering the top navigation.

