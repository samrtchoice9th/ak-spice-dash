
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useProducts } from '@/contexts/ProductsContext';
import { productSchema } from '@/lib/validations';
import { toast } from 'sonner';

interface AddItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddItemDialog: React.FC<AddItemDialogProps> = ({ isOpen, onClose }) => {
  const [newItemName, setNewItemName] = useState('');
  const [price, setPrice] = useState('');
  const [initialStock, setInitialStock] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addProduct, products } = useProducts();

  const handleAddItem = async () => {
    try {
      setIsLoading(true);
      
      const itemName = newItemName.trim();
      if (!itemName) {
        toast.error('Please enter an item name.');
        setIsLoading(false);
        return;
      }

      const isDuplicate = products.some(
        product => product.name.toLowerCase() === itemName.toLowerCase()
      );
      
      if (isDuplicate) {
        toast.error('Item with this name already exists. Please use a different name.');
        setIsLoading(false);
        return;
      }
      
      const productData = {
        name: itemName,
        current_stock: parseFloat(initialStock) || 0,
        price: parseFloat(price) || 0,
        avg_cost: 0
      };
      
      const validatedData = productSchema.parse(productData);
      await addProduct(validatedData);

      setNewItemName('');
      setPrice('');
      setInitialStock('');
      onClose();
      
      toast.success('Item added successfully!');
    } catch (error) {
      console.error('Error adding item:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to add item. Please try again.');
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
            <label htmlFor="itemName" className="block text-sm font-medium text-muted-foreground mb-2">
              Item Name *
            </label>
            <input
              id="itemName"
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              placeholder="Enter item name"
              autoFocus
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-muted-foreground mb-2">
              Price per Kg (Rs.)
            </label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              placeholder="0.00"
              step="0.01"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="initialStock" className="block text-sm font-medium text-muted-foreground mb-2">
              Initial Stock (Kg)
            </label>
            <input
              id="initialStock"
              type="number"
              value={initialStock}
              onChange={(e) => setInitialStock(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
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
