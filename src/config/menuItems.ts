
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  PackageMinus,
  Warehouse, 
  Receipt,
  BarChart3,
  Settings,
  LucideIcon
} from 'lucide-react';

export type MinRole = 'super_admin' | 'admin' | 'user';

export interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
  minRole: MinRole;
}

export const allMenuItems: MenuItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, minRole: 'super_admin' },
  { name: 'Sales', path: '/sales', icon: ShoppingCart, minRole: 'user' },
  { name: 'Purchase', path: '/purchase', icon: Package, minRole: 'user' },
  { name: 'Stock Adjustment', path: '/stock-adjustment', icon: PackageMinus, minRole: 'super_admin' },
  { name: 'Inventory', path: '/inventory', icon: Warehouse, minRole: 'super_admin' },
  { name: 'Receipt', path: '/receipt', icon: Receipt, minRole: 'admin' },
  { name: 'Report', path: '/report', icon: BarChart3, minRole: 'admin' },
  { name: 'Settings', path: '/settings', icon: Settings, minRole: 'super_admin' },
];

const roleLevel = (role: MinRole): number => {
  switch (role) {
    case 'super_admin': return 3;
    case 'admin': return 2;
    case 'user': return 1;
  }
};

export const getFilteredMenuItems = (userRole: MinRole | null): MenuItem[] => {
  if (!userRole) return [];
  const level = roleLevel(userRole);
  return allMenuItems.filter(item => level >= roleLevel(item.minRole));
};
