
import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  PackageMinus,
  Warehouse, 
  Receipt,
  BarChart3,
  Settings,
  Shield
} from 'lucide-react';
import { MobileSidebarButton } from './MobileSidebarButton';
import { MobileSidebar } from './MobileSidebar';
import { DesktopSidebar } from './DesktopSidebar';
import { useUserRole } from '@/hooks/useUserRole';
import { useShop } from '@/contexts/ShopContext';

const allMenuItems = [
  { name: 'Super Admin', path: '/super-admin', icon: Shield, superAdminOnly: true, adminOnly: false, staffVisible: false },
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, superAdminOnly: false, adminOnly: true, staffVisible: false },
  { name: 'Sales', path: '/sales', icon: ShoppingCart, superAdminOnly: false, adminOnly: false, staffVisible: true },
  { name: 'Purchase', path: '/purchase', icon: Package, superAdminOnly: false, adminOnly: false, staffVisible: true },
  { name: 'Stock Adjustment', path: '/stock-adjustment', icon: PackageMinus, superAdminOnly: false, adminOnly: true, staffVisible: false },
  { name: 'Inventory', path: '/inventory', icon: Warehouse, superAdminOnly: false, adminOnly: true, staffVisible: false },
  { name: 'Receipt', path: '/receipt', icon: Receipt, superAdminOnly: false, adminOnly: false, staffVisible: true },
  { name: 'Report', path: '/report', icon: BarChart3, superAdminOnly: false, adminOnly: true, staffVisible: false },
  { name: 'Settings', path: '/settings', icon: Settings, superAdminOnly: false, adminOnly: true, staffVisible: false },
];

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isSuperAdmin, isAdmin, isStaff } = useUserRole();
  const { shop } = useShop();

  const menuItems = useMemo(() => 
    allMenuItems.filter(item => {
      if (item.superAdminOnly) return isSuperAdmin;
      if (isSuperAdmin) return true;
      if (isAdmin) return !item.superAdminOnly;
      if (isStaff) return item.staffVisible;
      return item.staffVisible; // default for shop_owner etc
    }),
    [isSuperAdmin, isAdmin, isStaff]
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
      <DesktopSidebar menuItems={menuItems} shopName={shop?.name} />
    </>
  );
};
