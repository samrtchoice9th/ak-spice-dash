
import React, { useState, useMemo } from 'react';
import { MobileSidebarButton } from './MobileSidebarButton';
import { MobileSidebar } from './MobileSidebar';
import { DesktopSidebar } from './DesktopSidebar';
import { useUserRole } from '@/hooks/useUserRole';
import { getFilteredMenuItems } from '@/config/menuItems';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { role } = useUserRole();

  const menuItems = useMemo(() => {
    return getFilteredMenuItems(role);
  }, [role]);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <MobileSidebarButton onClick={toggleSidebar} />
      <MobileSidebar 
        isOpen={isOpen} 
        onClose={closeSidebar} 
        menuItems={menuItems}
      />
      <DesktopSidebar menuItems={menuItems} />
    </>
  );
};
