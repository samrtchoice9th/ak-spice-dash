
import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddNewItemFormProps {
  showAddNew: boolean;
  onShowAddNew: (show: boolean) => void;
  onAddItem: (itemName: string) => void;
}

export const AddNewItemForm: React.FC<AddNewItemFormProps> = ({
  showAddNew,
  onShowAddNew,
  onAddItem
}) => {
  const [newItemName, setNewItemName] = useState('');

  const handleAddNewItem = () => {
    if (newItemName.trim()) {
      onAddItem(newItemName.trim());
      setNewItemName('');
      onShowAddNew(false);
    }
  };

  const handleCancel = () => {
    onShowAddNew(false);
    setNewItemName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddNewItem();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!showAddNew) {
    return (
      <button
        type="button"
        onClick={() => onShowAddNew(true)}
        className="w-full flex items-center space-x-2 px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded"
      >
        <Plus size={16} />
        <span>Add New Item</span>
      </button>
    );
  }

  return (
    <div className="flex space-x-2">
      <input
        type="text"
        value={newItemName}
        onChange={(e) => setNewItemName(e.target.value)}
        onKeyDown={handleKeyDown}
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
        onClick={handleCancel}
        className="px-2 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
      >
        Cancel
      </button>
    </div>
  );
};
