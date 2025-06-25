
import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { ChevronDown, Edit2, Trash2, Plus } from 'lucide-react';

interface ItemSearchDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  inputRef?: (ref: HTMLInputElement | null) => void;
}

// Default spice items
const defaultSpiceItems = [
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
  onKeyDown,
  inputRef
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [spiceItems, setSpiceItems] = useState(defaultSpiceItems);
  const [filteredItems, setFilteredItems] = useState(spiceItems);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const internalInputRef = useRef<HTMLInputElement>(null);

  // Initialize localStorage with default items if not exists
  useEffect(() => {
    const existingItems = localStorage.getItem('spiceItems');
    if (!existingItems) {
      localStorage.setItem('spiceItems', JSON.stringify(defaultSpiceItems));
    } else {
      setSpiceItems(JSON.parse(existingItems));
    }
  }, []);

  // Listen for custom events when items are updated
  useEffect(() => {
    const handleItemsUpdated = () => {
      const updatedItems = JSON.parse(localStorage.getItem('spiceItems') || '[]');
      setSpiceItems(updatedItems);
    };

    window.addEventListener('spiceItemsUpdated', handleItemsUpdated);
    return () => window.removeEventListener('spiceItemsUpdated', handleItemsUpdated);
  }, []);

  useEffect(() => {
    const filtered = spiceItems.filter(item =>
      item.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredItems(filtered);
    setSelectedIndex(-1); // Reset selection when filtering
  }, [value, spiceItems]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setEditingItem(null);
        setShowAddNew(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set input ref
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

  const handleEditItem = (oldItem: string, newItem: string) => {
    if (newItem.trim() && newItem !== oldItem) {
      const updatedItems = spiceItems.map(item => 
        item === oldItem ? newItem.trim() : item
      );
      setSpiceItems(updatedItems);
      localStorage.setItem('spiceItems', JSON.stringify(updatedItems));
      window.dispatchEvent(new CustomEvent('spiceItemsUpdated'));
    }
    setEditingItem(null);
    setEditValue('');
  };

  const handleDeleteItem = (itemToDelete: string) => {
    if (confirm(`Are you sure you want to delete "${itemToDelete}"?`)) {
      const updatedItems = spiceItems.filter(item => item !== itemToDelete);
      setSpiceItems(updatedItems);
      localStorage.setItem('spiceItems', JSON.stringify(updatedItems));
      window.dispatchEvent(new CustomEvent('spiceItemsUpdated'));
    }
  };

  const handleAddNewItem = () => {
    if (newItemName.trim() && !spiceItems.includes(newItemName.trim())) {
      const updatedItems = [...spiceItems, newItemName.trim()];
      setSpiceItems(updatedItems);
      localStorage.setItem('spiceItems', JSON.stringify(updatedItems));
      window.dispatchEvent(new CustomEvent('spiceItemsUpdated'));
      setNewItemName('');
      setShowAddNew(false);
    }
  };

  const startEditing = (item: string) => {
    setEditingItem(item);
    setEditValue(item);
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
      // Call the original onKeyDown for other keys (like Enter for navigation)
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
                className={`flex items-center justify-between px-3 py-2 hover:bg-gray-100 ${
                  selectedIndex === index ? 'bg-blue-100' : ''
                }`}
              >
                {editingItem === item ? (
                  <div className="flex-1 flex space-x-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleEditItem(item, editValue);
                        } else if (e.key === 'Escape') {
                          setEditingItem(null);
                          setEditValue('');
                        }
                      }}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleEditItem(item, editValue)}
                      className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem(null);
                        setEditValue('');
                      }}
                      className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleItemSelect(item)}
                      className="flex-1 text-left"
                    >
                      {item}
                    </button>
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(item);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Edit item"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item);
                        }}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Delete item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
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
