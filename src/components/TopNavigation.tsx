
import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  PackageMinus,
  Warehouse, 
  Receipt,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
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

export const TopNavigation = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const { isAdmin } = useUserRole();

  const menuItems = useMemo(() => 
    allMenuItems.filter(item => !item.adminOnly || isAdmin),
    [isAdmin]
  );

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully."
    });
  };

  return (
    <div className="xl:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-800">Ak Spice</h1>
        {user && (
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors p-2"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        )}
      </div>
      
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center min-w-[70px] px-3 py-3 rounded-xl transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <item.icon size={22} className="mb-1" />
            <span className="text-xs font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};
