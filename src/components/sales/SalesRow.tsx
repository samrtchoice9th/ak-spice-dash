import React, { useCallback } from 'react';
import { POSRow } from '@/hooks/usePOSData';
import { ItemSearch } from './ItemSearch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Copy, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SalesRowProps {
  row: POSRow;
  rowErrors?: { [field: string]: string };
  onUpdate: (id: string, field: keyof POSRow, value: string | number) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent, rowId: string, field: 'name' | 'qty' | 'price') => void;
  inputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
}

export const SalesRowComponent: React.FC<SalesRowProps> = React.memo(({
  row,
  rowErrors,
  onUpdate,
  onDelete,
  onDuplicate,
  onKeyDown,
  inputRefs,
}) => {
  const isMobile = useIsMobile();

  const handleItemSelect = useCallback((name: string, price: number) => {
    onUpdate(row.id, 'name', name);
    onUpdate(row.id, 'price', price);
    onUpdate(row.id, 'qty', 1);
    setTimeout(() => {
      inputRefs.current[`${row.id}-qty`]?.focus();
      inputRefs.current[`${row.id}-qty`]?.select();
    }, 50);
  }, [row.id, onUpdate, inputRefs]);

  const handleQtyStep = useCallback((delta: number) => {
    const newQty = Math.max(0, Number(row.qty) + delta);
    onUpdate(row.id, 'qty', newQty);
  }, [row.id, row.qty, onUpdate]);

  if (isMobile) {
    return (
      <div className={cn(
        "p-3 border rounded-lg mb-2 bg-card transition-colors",
        "focus-within:ring-2 focus-within:ring-ring/30 focus-within:bg-accent/30"
      )}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 mr-2">
            <ItemSearch
              value={row.name}
              hasError={!!rowErrors?.name}
              errorMessage={rowErrors?.name}
              onSelect={handleItemSelect}
              onChange={v => onUpdate(row.id, 'name', v)}
              onKeyDown={e => onKeyDown(e, row.id, 'name')}
              inputRef={el => { inputRefs.current[`${row.id}-name`] = el; }}
            />
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => onDuplicate(row.id)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive" onClick={() => onDelete(row.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Qty</label>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => handleQtyStep(-0.25)}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                ref={el => { inputRefs.current[`${row.id}-qty`] = el; }}
                type="number"
                step="0.01"
                min="0"
                value={row.qty || ''}
                onChange={e => onUpdate(row.id, 'qty', parseFloat(e.target.value) || 0)}
                onKeyDown={e => onKeyDown(e, row.id, 'qty')}
                className={cn("h-10 text-center", rowErrors?.qty && "border-destructive")}
              />
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => handleQtyStep(0.25)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {rowErrors?.qty && <span className="text-xs text-destructive">{rowErrors.qty}</span>}
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Price</label>
            <Input
              ref={el => { inputRefs.current[`${row.id}-price`] = el; }}
              type="number"
              step="0.01"
              min="0"
              value={row.price || ''}
              onChange={e => onUpdate(row.id, 'price', parseFloat(e.target.value) || 0)}
              onKeyDown={e => onKeyDown(e, row.id, 'price')}
              className={cn("h-10", rowErrors?.price && "border-destructive")}
            />
            {rowErrors?.price && <span className="text-xs text-destructive">{rowErrors.price}</span>}
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Total</label>
            <div className="h-10 flex items-center font-semibold text-foreground">
              Rs.{row.total.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <tr className={cn(
      "border-b transition-colors",
      "focus-within:bg-accent/30"
    )}>
      <td className="p-2 w-[40%]">
        <ItemSearch
          value={row.name}
          hasError={!!rowErrors?.name}
          errorMessage={rowErrors?.name}
          onSelect={handleItemSelect}
          onChange={v => onUpdate(row.id, 'name', v)}
          onKeyDown={e => onKeyDown(e, row.id, 'name')}
          inputRef={el => { inputRefs.current[`${row.id}-name`] = el; }}
        />
      </td>
      <td className="p-2 w-[20%]">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleQtyStep(-0.25)}>
            <Minus className="h-3 w-3" />
          </Button>
          <Input
            ref={el => { inputRefs.current[`${row.id}-qty`] = el; }}
            type="number"
            step="0.01"
            min="0"
            value={row.qty || ''}
            onChange={e => onUpdate(row.id, 'qty', parseFloat(e.target.value) || 0)}
            onKeyDown={e => onKeyDown(e, row.id, 'qty')}
            className={cn("h-8 text-center text-sm", rowErrors?.qty && "border-destructive")}
          />
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleQtyStep(0.25)}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        {rowErrors?.qty && <span className="text-xs text-destructive">{rowErrors.qty}</span>}
      </td>
      <td className="p-2 w-[15%]">
        <Input
          ref={el => { inputRefs.current[`${row.id}-price`] = el; }}
          type="number"
          step="0.01"
          min="0"
          value={row.price || ''}
          onChange={e => onUpdate(row.id, 'price', parseFloat(e.target.value) || 0)}
          onKeyDown={e => onKeyDown(e, row.id, 'price')}
          className={cn("h-8 text-sm", rowErrors?.price && "border-destructive")}
        />
        {rowErrors?.price && <span className="text-xs text-destructive">{rowErrors.price}</span>}
      </td>
      <td className="p-2 w-[12%] text-right font-semibold text-foreground text-sm">
        Rs.{row.total.toFixed(2)}
      </td>
      <td className="p-2 w-[13%]">
        <div className="flex gap-1 justify-center">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDuplicate(row.id)} title="Duplicate">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(row.id)} title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
});

SalesRowComponent.displayName = 'SalesRowComponent';
