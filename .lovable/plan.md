

# Allow Staff Access to Report Page

Two changes needed:

### 1. `src/config/menuItems.ts` — Line 32
Set `staffVisible: true` for the Report menu item so staff see it in the sidebar/nav.

### 2. `src/App.tsx` — Report route
The Report route is currently wrapped in `<RoleProtectedRoute>` which blocks non-admin users. Remove the `RoleProtectedRoute` wrapper so staff can access `/report`.

