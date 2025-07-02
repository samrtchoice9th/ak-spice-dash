
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Warehouse, 
  Receipt,
  Settings
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Sales', path: '/sales', icon: ShoppingCart },
  { name: 'Purchase', path: '/purchase', icon: Package },
  { name: 'Inventory', path: '/inventory', icon: Warehouse },
  { name: 'Receipt', path: '/receipt', icon: Receipt },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const TopNavigation = () => {
  return (
    <div className="xl:hidden bg-white border-b border-gray-200 px-4 py-2 sticky top-0 z-40">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-bold text-gray-800">Ak Spice</h1>
      </div>
      
      <div className="flex overflow-x-auto space-x-1 pb-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center min-w-[60px] px-2 py-2 rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <item.icon size={20} className="mb-1" />
            <span className="text-xs font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};
