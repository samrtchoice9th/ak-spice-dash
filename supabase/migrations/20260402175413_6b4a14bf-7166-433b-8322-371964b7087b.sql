
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
