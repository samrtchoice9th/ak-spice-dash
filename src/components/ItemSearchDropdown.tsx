
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { useProducts } from '@/contexts/ProductsContext';

interface ItemSearchDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  inputRef?: (ref: HTMLInputElement | null) => void;
}

export const ItemSearchDropdown: React.FC<ItemSearchDropdownProps> = ({
  value,
  onChange,
  placeholder = "Search or enter item name",
  onKeyDown,
  inputRef
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const { products } = useProducts();

  // Get item names from products
  const itemNames = products.map(product => product.name);

  useEffect(() => {
    const filtered = itemNames.filter(item =>
      item.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredItems(filtered);
    setSelectedIndex(-1);
  }, [value, itemNames]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowAddNew(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (inputRef && internalInputRef.current) {
      inputRef(internalInputRef.current);
    }
  }, [inputRef]);

  const handleItemSelect = (item: string) => {
    onChange(item);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleAddNewItem = () => {
    if (newItemName.trim() && !itemNames.includes(newItemName.trim())) {
      // Add to localStorage for backward compatibility
      const existingItems = JSON.parse(localStorage.getItem('spiceItems') || '[]');
      const updatedItems = [...existingItems, newItemName.trim()];
      localStorage.setItem('spiceItems', JSON.stringify(updatedItems));
      window.dispatchEvent(new CustomEvent('spiceItemsUpdated'));
      
      // Select the new item
      onChange(newItemName.trim());
      setNewItemName('');
      setShowAddNew(false);
      setIsOpen(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      }
      setSelectedIndex(prev => 
        prev < filteredItems.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleItemSelect(filteredItems[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    } else {
      onKeyDown?.(e);
    }
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
          {/* Add New Item Section */}
          <div className="border-b border-gray-200 p-2">
            {!showAddNew ? (
              <button
                type="button"
                onClick={() => setShowAddNew(true)}
                className="w-full flex items-center space-x-2 px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded"
              >
                <Plus size={16} />
                <span>Add New Item</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddNewItem();
                    } else if (e.key === 'Escape') {
                      setShowAddNew(false);
                      setNewItemName('');
                    }
                  }}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="Enter new item name"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddNewItem}
                  className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddNew(false);
                    setNewItemName('');
                  }}
                  className="px-2 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Items List */}
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div
                key={index}
                className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                  selectedIndex === index ? 'bg-blue-100' : ''
                }`}
                onClick={() => handleItemSelect(item)}
              >
                {item}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500">No items found</div>
          )}
        </div>
      )}
    </div>
  );
};
