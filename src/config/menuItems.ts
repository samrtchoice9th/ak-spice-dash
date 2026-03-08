
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  PackageMinus,
  Warehouse, 
  Receipt,
  BarChart3,
  Settings,
  Shield,
  LucideIcon
} from 'lucide-react';

export interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
  superAdminOnly: boolean;
  adminOnly: boolean;
  staffVisible: boolean;
}

export const allMenuItems: MenuItem[] = [
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

export const getFilteredMenuItems = (isSuperAdmin: boolean, isAdmin: boolean, isStaff: boolean, hasShop: boolean) => {
  if (isSuperAdmin && !hasShop) return allMenuItems.filter(item => item.superAdminOnly);
  if (isSuperAdmin && hasShop) return allMenuItems.filter(item => !item.superAdminOnly);
  return allMenuItems.filter(item => {
    if (item.superAdminOnly) return false;
    if (isAdmin) return true;
    if (isStaff) return item.staffVisible;
    return item.staffVisible;
  });
};
