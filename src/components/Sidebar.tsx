
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Warehouse, 
  Receipt,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const menuItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Sales', path: '/sales', icon: ShoppingCart },
  { name: 'Purchase', path: '/purchase', icon: Package },
  { name: 'Inventory', path: '/inventory', icon: Warehouse },
  { name: 'Receipt', path: '/receipt', icon: Receipt },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => setIsOpen(!isOpen);

  if (isMobile) {
    return (
      <>
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-[100] p-2 bg-white rounded-lg shadow-lg border border-gray-200 lg:hidden"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[90] lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Mobile sidebar */}
        <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-[95] lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-4 pt-16 h-full overflow-y-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Ak Spice</h1>
            </div>
            
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={toggleSidebar}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div className="w-64 bg-gray-100 h-screen border-r border-gray-300 p-4 hidden lg:block">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Ak Spice</h1>
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
