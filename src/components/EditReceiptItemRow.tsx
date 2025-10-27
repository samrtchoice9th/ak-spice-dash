import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ReceiptItem } from '@/contexts/ReceiptsContext';
import { ItemSearchDropdown } from './ItemSearchDropdown';
import { useProducts } from '@/contexts/ProductsContext';

interface EditReceiptItemRowProps {
  item: ReceiptItem;
  index: number;
  onUpdate: (index: number, field: keyof ReceiptItem, value: string | number) => void;
  onRemove: (index: number) => void;
}

export const EditReceiptItemRow: React.FC<EditReceiptItemRowProps> = ({
  item,
  index,
  onUpdate,
  onRemove
}) => {
  const { products } = useProducts();

  const handleItemSelect = (itemName: string) => {
    const selectedProduct = products.find(p => p.name === itemName);
    if (selectedProduct) {
      onUpdate(index, 'itemName', itemName);
      onUpdate(index, 'price', selectedProduct.price);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg">
      <div className="col-span-4">
        <Label htmlFor={`item-name-${index}`} className="text-xs">Item Name</Label>
        <ItemSearchDropdown
          value={item.itemName}
          onChange={(value) => {
            onUpdate(index, 'itemName', value);
            handleItemSelect(value);
          }}
          placeholder="Search item..."
        />
      </div>
      <div className="col-span-2">
        <Label htmlFor={`qty-${index}`} className="text-xs">Quantity</Label>
        <Input
          id={`qty-${index}`}
          type="number"
          value={item.qty}
          onChange={(e) => onUpdate(index, 'qty', Number(e.target.value))}
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
          onChange={(e) => onUpdate(index, 'price', Number(e.target.value))}
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
          onClick={() => onRemove(index)}
          variant="destructive"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
};
