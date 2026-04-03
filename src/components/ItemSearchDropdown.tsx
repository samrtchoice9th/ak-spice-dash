
import React, { useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { DropdownItemsList } from './DropdownItemsList';
import { useItemDropdown } from '@/hooks/useItemDropdown';
import { useClickOutside } from '@/hooks/useClickOutside';

interface ItemSearchDropdownProps {
  value: string;
  onChange: (value: string) => void;
  onItemSelected?: (name: string, avgCost: number) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  inputRef?: (ref: HTMLInputElement | null) => void;
}

export const ItemSearchDropdown: React.FC<ItemSearchDropdownProps> = ({
  value,
  onChange,
  onItemSelected,
  placeholder = "Search item name",
  onKeyDown,
  inputRef
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const internalInputRef = useRef<HTMLInputElement>(null);
  
  const {
    isOpen,
    setIsOpen,
    filteredItems,
    selectedIndex,
    handleItemSelect,
    handleKeyNavigation
  } = useItemDropdown(value);

  useClickOutside(dropdownRef, () => {
    setIsOpen(false);
  });

  useEffect(() => {
    if (inputRef && internalInputRef.current) {
      inputRef(internalInputRef.current);
    }
  }, [inputRef]);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    const selectedItem = handleKeyNavigation(e);
    if (selectedItem) {
      onChange(handleItemSelect(selectedItem));
    } else {
      onKeyDown?.(e);
    }
  };

  const onItemSelect = (item: string) => {
    onChange(handleItemSelect(item));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={internalInputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <ChevronDown size={20} />
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <DropdownItemsList
            filteredItems={filteredItems}
            selectedIndex={selectedIndex}
            onItemSelect={onItemSelect}
          />
        </div>
      )}
    </div>
  );
};
