
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface ItemSearchDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

// Predefined spice items
const spiceItems = [
  'Turmeric Powder',
  'Red Chili Powder',
  'Coriander Powder',
  'Cumin Powder',
  'Garam Masala',
  'Black Pepper',
  'Cardamom',
  'Cinnamon',
  'Bay Leaves',
  'Mustard Seeds',
  'Fenugreek Seeds',
  'Cloves',
  'Star Anise',
  'Nutmeg',
  'Saffron'
];

export const ItemSearchDropdown: React.FC<ItemSearchDropdownProps> = ({
  value,
  onChange,
  placeholder = "Search or enter item name",
  onKeyDown
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState(spiceItems);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filtered = spiceItems.filter(item =>
      item.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemSelect = (item: string) => {
    onChange(item);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={onKeyDown}
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
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleItemSelect(item)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                {item}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500">No items found</div>
          )}
        </div>
      )}
    </div>
  );
};
