
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type AppRole = 'super_admin' | 'admin' | 'shop_owner' | 'staff' | 'user';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!error && data) {
        setRole(data.role as AppRole);
      } else {
        setRole('user');
      }
      setLoading(false);
    };

    fetchRole();
  }, [user]);

  return {
    role,
    isSuperAdmin: role === 'super_admin',
    isAdmin: role === 'super_admin' || role === 'admin',
    isShopOwner: role === 'shop_owner',
    isStaff: role === 'staff',
    loading,
  };
};
