
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, X } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
  children?: MenuItem[];
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose, menuItems }) => {
  const { pathname } = useLocation();
  const accountsActive = menuItems.some(item => item.children?.some(child => pathname.startsWith(child.path)));
  const [accountsOpen, setAccountsOpen] = useState(accountsActive);
  const showAccounts = accountsOpen || accountsActive;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 xl:hidden transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">My Shop</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="min-h-11 min-w-11"
            aria-label="Close menu"
          >
            <X size={20} className="text-gray-700" />
          </Button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => item.children ? (
            <div key={item.name}>
              <Button type="button" variant="ghost" onClick={() => setAccountsOpen(open => !open)} aria-expanded={showAccounts} className={`min-h-11 w-full justify-start px-4 ${accountsActive ? 'bg-accent text-accent-foreground' : ''}`}>
                <item.icon size={20} /><span className="flex-1 text-left">{item.name}</span><ChevronDown className={`h-4 w-4 transition-transform ${showAccounts ? 'rotate-180' : ''}`} />
              </Button>
              {showAccounts && <div className="ml-6 border-l pl-2">{item.children.map(child => <NavLink key={child.name} to={child.path} onClick={onClose} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-md px-3 ${isActive ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent'}`}><child.icon size={18} /><span>{child.name}</span></NavLink>)}</div>}
            </div>
          ) : (
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
