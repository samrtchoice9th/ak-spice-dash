
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Receipt, ReceiptItem } from '@/contexts/ReceiptsContext';
import { useToast } from '@/hooks/use-toast';
import { EditReceiptItemRow } from './EditReceiptItemRow';

interface EditReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: Receipt | null;
  onSave: (id: string, receiptData: Omit<Receipt, 'id' | 'date' | 'time'>) => Promise<void>;
}

export const EditReceiptDialog: React.FC<EditReceiptDialogProps> = ({
  isOpen,
  onClose,
  receipt,
  onSave
}) => {
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [type, setType] = useState<'purchase' | 'sales' | 'adjustment' | 'increase' | 'reduce'>('sales');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (receipt && isOpen) {
      setItems([...receipt.items]);
      setType(receipt.type);
    }
  }, [receipt, isOpen]);

  const addNewItem = () => {
    const newItem: ReceiptItem = {
      id: `temp-${Date.now()}`,
      itemName: '',
      qty: 0,
      price: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof ReceiptItem, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'qty' || field === 'price') {
      const qty = field === 'qty' ? Number(value) : updatedItems[index].qty;
      const price = field === 'price' ? Number(value) : updatedItems[index].price;
      updatedItems[index].total = qty * price;
    }
    
    setItems(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSave = async () => {
    if (!receipt) return;

    const validItems = items.filter(item => 
      item.itemName.trim() && item.qty > 0 && item.price > 0
    );

    if (validItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one valid item.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      const receiptData = {
        type,
        items: validItems,
        totalAmount: calculateTotal()
      };

      await onSave(receipt.id, receiptData);
      
      toast({
        title: "Success",
        description: "Receipt updated successfully."
      });
      // Dialog will be closed by parent component after successful save
    } catch (error) {
      console.error('Error updating receipt:', error);
      toast({
        title: "Error",
        description: "Failed to update receipt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!receipt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Receipt - {receipt.id.slice(0, 8)}...</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Receipt Type</Label>
              <Select value={type} onValueChange={(value: 'purchase' | 'sales' | 'adjustment' | 'increase' | 'reduce') => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                  <SelectItem value="increase">Increase</SelectItem>
                  <SelectItem value="reduce">Reduce</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Total Amount</Label>
              <div className="text-lg font-semibold text-gray-800 mt-2">
                Rs.{calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Items</h3>
              <Button onClick={addNewItem} variant="outline" size="sm">
                <Plus size={16} className="mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <EditReceiptItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                />
              ))}
            </div>

            {items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No items added yet. Click "Add Item" to get started.
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Updating..." : "Update Receipt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
