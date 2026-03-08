

# Remove Super Admin from Sidebar for Shop Users

## Problem
When the Ak Spice shop owner (who also has `super_admin` role) logs in, the "Super Admin" item appears in both the sidebar and top navigation. The user wants the Super Admin panel completely hidden when viewing a shop context.

## Change

### `src/components/Sidebar.tsx` — Line 39
Change the `isSuperAdmin && shop` case to exclude `superAdminOnly` items:

```typescript
if (isSuperAdmin && shop) return allMenuItems.filter(item => !item.superAdminOnly);
```

This means:
- **Super admin with no shop** → sees only Super Admin panel
- **Super admin with a shop** → sees all shop items, NO Super Admin link
- **Shop owner / admin** → sees all shop items (unchanged)
- **Staff** → sees staff-visible items only (unchanged)

The Super Admin panel remains accessible only when the super admin has no shop association.

