

# Secure user_roles Table — Add INSERT/UPDATE/DELETE Policies

## Problem
The `user_roles` table currently only has a SELECT policy (own role) and an ALL policy (super_admin). Any authenticated user could potentially insert a row granting themselves `super_admin`.

## Migration

Add three policies to lock down write access:

```sql
-- INSERT: Only super_admin can assign roles
CREATE POLICY "Only super_admin can assign roles"
ON user_roles FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- UPDATE: Only super_admin can update roles
CREATE POLICY "Only super_admin can update roles"
ON user_roles FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- DELETE: Only super_admin can delete roles
CREATE POLICY "Only super_admin can delete roles"
ON user_roles FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));
```

**Note**: The existing `handle_new_user_role()` trigger runs as `SECURITY DEFINER`, so it bypasses RLS and will continue to assign roles on signup without issue.

No code changes needed — migration only.

