
import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { getFilteredMenuItems } from '@/config/menuItems';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const TopNavigation = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const { role } = useUserRole();
  const location = useLocation();

  const menuItems = useMemo(() => {
    return getFilteredMenuItems(role);
  }, [role]);

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
        <h1 className="text-lg font-bold text-gray-800">My Shop</h1>
        {user && (
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="min-h-11 text-muted-foreground hover:text-destructive"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </Button>
        )}
      </div>
      
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {menuItems.map((item) => item.children ? (
          <DropdownMenu key={item.name}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={`h-auto min-h-14 min-w-[76px] flex-col gap-1 px-3 py-2 ${item.children.some(child => location.pathname.startsWith(child.path)) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}>
                <item.icon size={22} /><span className="text-xs">{item.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-48">
              {item.children.map(child => <DropdownMenuItem key={child.name} asChild><NavLink to={child.path} className="min-h-11 gap-3"><child.icon className="h-4 w-4" />{child.name}</NavLink></DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
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
