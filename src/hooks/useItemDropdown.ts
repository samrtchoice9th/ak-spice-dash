
import { useState, useEffect, useMemo } from 'react';
import { useProducts } from '@/contexts/ProductsContext';

export const useItemDropdown = (value: string) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { products } = useProducts();

  const itemNames = useMemo(() => products.map(p => p.name), [products]);

  useEffect(() => {
    if (!value.trim()) {
      setFilteredItems([]);
      setIsOpen(false);
      return;
    }
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
    handleItemSelect,
    handleKeyNavigation
  };
};
