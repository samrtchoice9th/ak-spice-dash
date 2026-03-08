
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LucideIcon, ArrowLeft } from 'lucide-react';
import { useShop } from '@/contexts/ShopContext';

interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface DesktopSidebarProps {
  menuItems: MenuItem[];
  shopName?: string;
  isSuperAdmin?: boolean;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ menuItems, shopName, isSuperAdmin }) => {
  const { isViewingAsAdmin, exitShop } = useShop();
  const navigate = useNavigate();

  const handleBackToAdmin = () => {
    exitShop();
    navigate('/super-admin');
  };

  return (
    <div className="hidden xl:flex xl:flex-col xl:w-64 xl:bg-gray-100 xl:h-screen xl:border-r xl:border-gray-300 xl:p-4">
      {isViewingAsAdmin && (
        <button
          onClick={handleBackToAdmin}
          className="flex items-center space-x-2 px-3 py-2 mb-4 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Admin Panel</span>
        </button>
      )}
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{shopName || (isSuperAdmin ? 'Super Admin Panel' : 'My Shop')}</h1>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-200'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
