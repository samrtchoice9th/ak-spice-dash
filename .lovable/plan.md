

# Role-Based Access Control: Admin & User Roles

## Overview

Implement role-based access using a `user_roles` table in Supabase. The admin user (`ak7live1140@gmail.com`) gets full access; regular users see only Sales, Purchase, and Receipt pages.

**Important**: The password you provided will not be hardcoded anywhere. Both users already exist in Supabase Auth — we just need to assign roles.

## Database Changes

### Migration 1: Create role system
```sql
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: users can read their own role
CREATE POLICY "Users can read own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

### Data Insert: Assign roles
- `ak7live1140@gmail.com` → `admin`
- `msanan7@gmail.com` → `user`

### Trigger: Auto-assign 'user' role on signup
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
AS $$ BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();
```

## Frontend Changes

### 1. Create `useUserRole` hook (`src/hooks/useUserRole.ts`)
- Query `user_roles` table for current user
- Return `{ role, isAdmin, loading }`

### 2. Update `AuthContext` to expose role
- Add role info from the hook so it's available app-wide

### 3. Filter navigation by role
- **`src/components/Sidebar.tsx`** / **`TopNavigation.tsx`**: Filter `menuItems` based on role
  - Admin: all pages
  - User: Sales, Purchase, Receipt only

### 4. Create `RoleProtectedRoute` component
- Wrap admin-only routes (Dashboard, Stock Adjustment, Inventory, Report, Settings)
- Redirects unauthorized users to `/sales`

### 5. Update `App.tsx` routes
- Wrap admin-only routes with `RoleProtectedRoute`
- Change default route for regular users to `/sales`

## Access Matrix

| Page             | Admin | User |
|------------------|-------|------|
| Dashboard        | ✓     | ✗    |
| Sales            | ✓     | ✓    |
| Purchase         | ✓     | ✓    |
| Stock Adjustment | ✓     | ✗    |
| Inventory        | ✓     | ✗    |
| Receipt          | ✓     | ✓    |
| Report           | ✓     | ✗    |
| Settings         | ✓     | ✗    |

## Files to Create/Modify

1. **DB Migration**: `user_roles` table, `has_role` function, trigger
2. **DB Insert**: Role assignments for existing users
3. **`src/hooks/useUserRole.ts`** — new hook
4. **`src/contexts/AuthContext.tsx`** — expose role
5. **`src/components/RoleProtectedRoute.tsx`** — new component
6. **`src/components/Sidebar.tsx`** — filter menu items
7. **`src/components/TopNavigation.tsx`** — filter menu items
8. **`src/App.tsx`** — wrap routes with role protection

