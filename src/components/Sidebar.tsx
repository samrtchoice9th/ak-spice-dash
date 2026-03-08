
import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  PackageMinus,
  Warehouse, 
  Receipt,
  BarChart3,
  Settings
} from 'lucide-react';
import { MobileSidebarButton } from './MobileSidebarButton';
import { MobileSidebar } from './MobileSidebar';
import { DesktopSidebar } from './DesktopSidebar';
import { useUserRole } from '@/hooks/useUserRole';

const allMenuItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, adminOnly: true },
  { name: 'Sales', path: '/sales', icon: ShoppingCart, adminOnly: false },
  { name: 'Purchase', path: '/purchase', icon: Package, adminOnly: false },
  { name: 'Stock Adjustment', path: '/stock-adjustment', icon: PackageMinus, adminOnly: true },
  { name: 'Inventory', path: '/inventory', icon: Warehouse, adminOnly: true },
  { name: 'Receipt', path: '/receipt', icon: Receipt, adminOnly: false },
  { name: 'Report', path: '/report', icon: BarChart3, adminOnly: true },
  { name: 'Settings', path: '/settings', icon: Settings, adminOnly: true },
];

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin } = useUserRole();

  const menuItems = useMemo(() => 
    allMenuItems.filter(item => !item.adminOnly || isAdmin),
    [isAdmin]
  );

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
