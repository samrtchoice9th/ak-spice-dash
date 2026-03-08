
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Shop {
  id: string;
  name: string;
  owner_id: string;
  status: string;
  created_at: string;
  address: string | null;
  phone: string | null;
}

export interface ShopMember {
  id: string;
  shop_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface ShopContextType {
  shop: Shop | null;
  shopMembers: ShopMember[];
  isShopActive: boolean;
  isShopPending: boolean;
  shopRole: string | null;
  loading: boolean;
  isViewingAsAdmin: boolean;
  refreshShop: () => Promise<void>;
  switchShop: (shop: Shop) => void;
  exitShop: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [overrideShop, setOverrideShop] = useState<Shop | null>(null);
  const [shopMembers, setShopMembers] = useState<ShopMember[]>([]);
  const [shopRole, setShopRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshShop = useCallback(async () => {
    if (!user) {
      setShop(null);
      setShopMembers([]);
      setShopRole(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data: membership, error: memError } = await supabase
        .from('shop_members')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (memError || !membership) {
        setShop(null);
        setShopMembers([]);
        setShopRole(null);
        setLoading(false);
        return;
      }

      setShopRole(membership.role);

      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('id', membership.shop_id)
        .single();

      if (shopError || !shopData) {
        setShop(null);
        setLoading(false);
        return;
      }

      setShop(shopData as Shop);

      const { data: members } = await supabase
        .from('shop_members')
        .select('*')
        .eq('shop_id', membership.shop_id);

      setShopMembers((members || []) as ShopMember[]);
    } catch (error) {
      console.error('Error fetching shop:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshShop();
  }, [refreshShop]);

  const switchShop = useCallback((targetShop: Shop) => {
    setOverrideShop(targetShop);
  }, []);

  const exitShop = useCallback(() => {
    setOverrideShop(null);
  }, []);

  const activeShop = overrideShop || shop;
  const isViewingAsAdmin = overrideShop !== null;

  return (
    <ShopContext.Provider value={{
      shop: activeShop,
      shopMembers,
      isShopActive: activeShop?.status === 'active',
      isShopPending: activeShop?.status === 'pending',
      shopRole,
      loading,
      isViewingAsAdmin,
      refreshShop,
      switchShop,
      exitShop,
    }}>
      {children}
    </ShopContext.Provider>
  );
};
