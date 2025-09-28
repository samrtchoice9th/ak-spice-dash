
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useProducts } from '@/contexts/ProductsContext';
import { productSchema } from '@/lib/validations';

interface AddItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddItemDialog: React.FC<AddItemDialogProps> = ({ isOpen, onClose }) => {
  const [newItemName, setNewItemName] = useState('');
  const [price, setPrice] = useState('');
  const [initialStock, setInitialStock] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addProduct } = useProducts();

  const handleAddItem = async () => {
    try {
      setIsLoading(true);
      
      // Validate input
      const productData = {
        name: newItemName.trim(),
        current_stock: parseFloat(initialStock) || 0,
        price: parseFloat(price) || 0
      };
      
      const validatedData = productSchema.parse(productData);
      
      // Add to database
      await addProduct(validatedData);

      // Add to localStorage for dropdown
      const existingItems = JSON.parse(localStorage.getItem('spiceItems') || '[]');
      if (!existingItems.includes(newItemName.trim())) {
        const updatedItems = [...existingItems, newItemName.trim()];
        localStorage.setItem('spiceItems', JSON.stringify(updatedItems));
        window.dispatchEvent(new CustomEvent('spiceItemsUpdated'));
      }
      
      // Reset form
      setNewItemName('');
      setPrice('');
      setInitialStock('');
      onClose();
      
      alert('Item added successfully!');
    } catch (error) {
      console.error('Error adding item:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Failed to add item. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <input
              id="itemName"
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter item name"
              autoFocus
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Price per Kg (Rs.)
            </label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              step="0.01"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="initialStock" className="block text-sm font-medium text-gray-700 mb-2">
              Initial Stock (Kg)
            </label>
            <input
              id="initialStock"
              type="number"
              value={initialStock}
              onChange={(e) => setInitialStock(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              step="0.01"
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleAddItem} className="flex items-center space-x-2" disabled={isLoading}>
              <Plus size={16} />
              <span>{isLoading ? 'Adding...' : 'Add Item'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
