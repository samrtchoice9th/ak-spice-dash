
import React from 'react';
import { Printer, Plus, Save, RowsIcon, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ActionButtonsProps {
  onPrint: () => void;
  onThermalPrint?: () => void;
  onAddItem?: () => void;
  onSave?: () => void;
  onAddRow?: () => void;
  showAddItem?: boolean;
  showSave?: boolean;
  showThermalPrint?: boolean;
  disabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onPrint,
  onThermalPrint,
  onAddItem,
  onSave,
  onAddRow,
  showAddItem = false,
  showSave = false,
  showThermalPrint = false,
  disabled = false
}) => {
  const { toast } = useToast();

  const handlePrint = () => {
    onPrint();
    toast({
      title: "Printing started",
      description: "Your receipt is being prepared for printing",
    });
  };

  const handleThermalPrint = () => {
    if (onThermalPrint) {
      onThermalPrint();
      toast({
        title: "Thermal printing",
        description: "Sending to RawBT printer app",
      });
    }
  };

  const handleAddItem = () => {
    if (onAddItem) {
      onAddItem();
      toast({
        title: "Add item dialog opened",
        description: "You can now add a new item to your inventory",
      });
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
  };

  const handleAddRow = () => {
    if (onAddRow) {
      onAddRow();
      toast({
        title: "Row added",
        description: "New item row added to the bill",
      });
    }
  };

  return (
    <div className="mt-6 sm:mt-8 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
        {onAddRow && (
          <button
            onClick={handleAddRow}
            disabled={disabled}
            className="flex items-center justify-center space-x-2 px-6 py-4 sm:py-3 bg-purple-600 text-white font-medium rounded-lg border-2 border-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] text-base sm:text-sm"
          >
            <Plus size={20} />
            <span>Add Row</span>
          </button>
        )}
        
        <button
          onClick={handlePrint}
          disabled={disabled}
          className="flex items-center justify-center space-x-2 px-6 py-4 sm:py-3 bg-gray-600 text-white font-medium rounded-lg border-2 border-gray-600 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] text-base sm:text-sm"
        >
          <Printer size={20} />
          <span>Print</span>
        </button>

        {showThermalPrint && (
          <button
            onClick={handleThermalPrint}
            disabled={disabled}
            className="flex items-center justify-center space-x-2 px-6 py-4 sm:py-3 bg-blue-600 text-white font-medium rounded-lg border-2 border-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] text-base sm:text-sm"
          >
            <Smartphone size={20} />
            <span>Thermal Print</span>
          </button>
        )}
        
        {showAddItem && onAddItem && (
          <button
            onClick={handleAddItem}
            disabled={disabled}
            className="flex items-center justify-center space-x-2 px-6 py-4 sm:py-3 bg-blue-600 text-white font-medium rounded-lg border-2 border-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] text-base sm:text-sm"
          >
            <Plus size={20} />
            <span>Add Item</span>
          </button>
        )}
        
        {showSave && onSave && (
          <button
            onClick={handleSave}
            disabled={disabled}
            className="flex items-center justify-center space-x-2 px-6 py-4 sm:py-3 bg-green-600 text-white font-medium rounded-lg border-2 border-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] text-base sm:text-sm"
          >
            <Save size={20} />
            <span>Save</span>
          </button>
        )}
      </div>
    </div>
  );
};
