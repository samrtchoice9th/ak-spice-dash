
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddItemDialog: React.FC<AddItemDialogProps> = ({ isOpen, onClose }) => {
  const [newItemName, setNewItemName] = useState('');

  const handleAddItem = () => {
    if (newItemName.trim()) {
      // Get existing items from localStorage
      const existingItems = JSON.parse(localStorage.getItem('spiceItems') || '[]');
      
      // Add new item if it doesn't already exist
      if (!existingItems.includes(newItemName.trim())) {
        const updatedItems = [...existingItems, newItemName.trim()];
        localStorage.setItem('spiceItems', JSON.stringify(updatedItems));
        
        // Trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent('spiceItemsUpdated'));
      }
      
      setNewItemName('');
      onClose();
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
              Item Name
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
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleAddItem} className="flex items-center space-x-2">
              <Plus size={16} />
              <span>Add Item</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
