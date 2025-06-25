
import { useState, useEffect } from 'react';
import { useProducts } from '@/contexts/ProductsContext';

export const useItemDropdown = (value: string) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showAddNew, setShowAddNew] = useState(false);
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

  const handleItemSelect = (item: string) => {
    setIsOpen(false);
    setSelectedIndex(-1);
    return item;
  };

  const handleAddNewItem = async (newItemName: string) => {
    if (newItemName && !itemNames.includes(newItemName)) {
      // Add to localStorage for backward compatibility
      const existingItems = JSON.parse(localStorage.getItem('spiceItems') || '[]');
      const updatedItems = [...existingItems, newItemName];
      localStorage.setItem('spiceItems', JSON.stringify(updatedItems));
      window.dispatchEvent(new CustomEvent('spiceItemsUpdated'));
      
      setShowAddNew(false);
      setIsOpen(false);
      return newItemName;
    }
    return null;
  };

  const handleKeyNavigation = (e: React.KeyboardEvent) => {
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
      return filteredItems[selectedIndex];
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
    return null;
  };

  return {
    isOpen,
    setIsOpen,
    filteredItems,
    selectedIndex,
    showAddNew,
    setShowAddNew,
    handleItemSelect,
    handleAddNewItem,
    handleKeyNavigation
  };
};
