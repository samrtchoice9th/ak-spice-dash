
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
  children?: MenuItem[];
}

interface DesktopSidebarProps {
  menuItems: MenuItem[];
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ menuItems }) => {
  const { pathname } = useLocation();
  const accountsActive = menuItems.some(item => item.children?.some(child => pathname.startsWith(child.path)));
  const [accountsOpen, setAccountsOpen] = useState(accountsActive);

  return (
    <div className="hidden xl:flex xl:flex-col xl:w-64 xl:bg-sidebar xl:text-sidebar-foreground xl:h-screen xl:border-r xl:border-sidebar-border xl:p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Shop</h1>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => item.children ? (
          <div key={item.name}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAccountsOpen(open => !open)}
              aria-expanded={accountsOpen}
              className={`h-11 w-full justify-start px-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${accountsActive ? 'bg-sidebar-accent' : ''}`}
            >
              <item.icon size={20} /><span className="flex-1 text-left">{item.name}</span><ChevronDown className={`h-4 w-4 transition-transform ${accountsOpen ? 'rotate-180' : ''}`} />
            </Button>
            {accountsOpen && <div className="ml-6 mt-1 space-y-1 border-l border-sidebar-border pl-2">
              {item.children.map(child => <NavLink key={child.name} to={child.path} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-md px-3 text-sm ${isActive ? 'bg-sidebar-accent font-medium' : 'hover:bg-sidebar-accent'}`}><child.icon size={18} /><span>{child.name}</span></NavLink>)}
            </div>}
          </div>
        ) : (
          <NavLink key={item.name} to={item.path} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-md px-4 transition-colors ${isActive ? 'bg-sidebar-accent font-medium' : 'hover:bg-sidebar-accent'}`}><item.icon size={20} /><span className="font-medium">{item.name}</span></NavLink>
        ))}
      </nav>
    </div>
  );
};
