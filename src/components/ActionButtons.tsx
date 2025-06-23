
import React from 'react';
import { Printer, Plus, Save } from 'lucide-react';

interface ActionButtonsProps {
  onPrint: () => void;
  onAddItem?: () => void;
  onSave?: () => void;
  showAddItem?: boolean;
  showSave?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onPrint,
  onAddItem,
  onSave,
  showAddItem = false,
  showSave = false
}) => {
  return (
    <div className="mt-8 flex flex-wrap gap-4 justify-center">
      <button
        onClick={onPrint}
        className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white font-medium rounded-lg border-2 border-gray-600 hover:bg-gray-700 transition-colors"
      >
        <Printer size={20} />
        <span>Print</span>
      </button>
      
      {showAddItem && onAddItem && (
        <button
          onClick={onAddItem}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg border-2 border-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Item</span>
        </button>
      )}
      
      {showSave && onSave && (
        <button
          onClick={onSave}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg border-2 border-green-600 hover:bg-green-700 transition-colors"
        >
          <Save size={20} />
          <span>Save</span>
        </button>
      )}
    </div>
  );
};
