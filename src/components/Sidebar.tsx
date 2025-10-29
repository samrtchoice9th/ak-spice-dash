
import React, { useState } from 'react';
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

const menuItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Sales', path: '/sales', icon: ShoppingCart },
  { name: 'Purchase', path: '/purchase', icon: Package },
  { name: 'Stock Adjustment', path: '/stock-adjustment', icon: PackageMinus },
  { name: 'Inventory', path: '/inventory', icon: Warehouse },
  { name: 'Receipt', path: '/receipt', icon: Receipt },
  { name: 'Report', path: '/report', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

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
