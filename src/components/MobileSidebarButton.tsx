
import React from 'react';
import { Menu } from 'lucide-react';

interface MobileSidebarButtonProps {
  onClick: () => void;
}

export const MobileSidebarButton: React.FC<MobileSidebarButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 xl:hidden touch-manipulation"
      style={{ minHeight: '44px', minWidth: '44px' }}
    >
      <Menu size={20} className="text-gray-700" />
    </button>
  );
};
