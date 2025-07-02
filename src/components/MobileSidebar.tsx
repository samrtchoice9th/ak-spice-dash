
import React from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose, menuItems }) => {
  return (
    <>
      {/* Mobile backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      {/* Mobile sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 xl:hidden transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Mobile sidebar header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Ak Spice</h1>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 touch-manipulation"
            style={{ minHeight: '44px', minWidth: '44px' }}
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
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full touch-manipulation ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              style={{ minHeight: '44px' }}
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
