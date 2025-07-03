
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { Receipt, ReceiptItem } from '@/contexts/ReceiptsContext';
import { useToast } from '@/hooks/use-toast';

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
  const [type, setType] = useState<'purchase' | 'sales'>('sales');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (receipt) {
      setItems([...receipt.items]);
      setType(receipt.type);
    }
  }, [receipt]);

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
    
    // Recalculate total for this item
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

    // Validate items
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
      
      onClose();
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
              <Select value={type} onValueChange={(value: 'purchase' | 'sales') => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
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
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg">
                  <div className="col-span-4">
                    <Label htmlFor={`item-name-${index}`} className="text-xs">Item Name</Label>
                    <Input
                      id={`item-name-${index}`}
                      value={item.itemName}
                      onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                      placeholder="Enter item name"
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`qty-${index}`} className="text-xs">Quantity</Label>
                    <Input
                      id={`qty-${index}`}
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(index, 'qty', Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`price-${index}`} className="text-xs">Price</Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Total</Label>
                    <div className="text-sm font-medium mt-2">
                      Rs.{item.total.toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <Button
                      onClick={() => removeItem(index)}
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
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
