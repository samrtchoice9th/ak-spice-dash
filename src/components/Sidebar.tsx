
import React, { useState, useMemo } from 'react';
import { MobileSidebarButton } from './MobileSidebarButton';
import { MobileSidebar } from './MobileSidebar';
import { DesktopSidebar } from './DesktopSidebar';
import { useUserRole } from '@/hooks/useUserRole';
import { useShop } from '@/contexts/ShopContext';
import { getFilteredMenuItems } from '@/config/menuItems';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isSuperAdmin, isAdmin, isStaff } = useUserRole();
  const { shop, isViewingAsAdmin } = useShop();

  const menuItems = useMemo(() => {
    return getFilteredMenuItems(isSuperAdmin, isAdmin, isStaff, !!shop);
  }, [isSuperAdmin, isAdmin, isStaff, shop]);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <MobileSidebarButton onClick={toggleSidebar} />
      <MobileSidebar 
        isOpen={isOpen} 
        onClose={closeSidebar} 
        menuItems={menuItems}
        shopName={shop?.name}
        isSuperAdmin={isSuperAdmin}
        isViewingAsAdmin={isViewingAsAdmin}
      />
      <DesktopSidebar menuItems={menuItems} shopName={shop?.name} isSuperAdmin={isSuperAdmin} />
    </>
  );
};
