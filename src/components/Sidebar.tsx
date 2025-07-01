
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

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile menu button - always visible on mobile */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 lg:hidden"
      >
        <Menu size={20} className="text-gray-700" />
      </button>

      {/* Mobile backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={closeSidebar}
      />

      {/* Mobile sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Mobile sidebar header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Ak Spice</h1>
          <button
            onClick={closeSidebar}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>
        
        {/* Mobile navigation menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full ${
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

      {/* Desktop sidebar - always visible on desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-gray-100 lg:h-screen lg:border-r lg:border-gray-300 lg:p-4">
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
    </>
  );
};
