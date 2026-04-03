
import React from 'react';
import { ItemSearchDropdown } from './ItemSearchDropdown';
import { TableRow as TableRowType } from '@/types/table';
import { calculateRowTotal } from '@/utils/calculations';

interface TableRowProps {
  row: TableRowType;
  index: number;
  onUpdateRow: (id: string, field: keyof TableRowType, value: string | number) => void;
  onKeyDown: (e: React.KeyboardEvent, rowIndex: number, field: 'itemName' | 'qty' | 'price') => void;
  inputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
  type?: 'purchase' | 'sales' | 'adjustment';
}

export const TableRowComponent: React.FC<TableRowProps> = ({
  row,
  index,
  onUpdateRow,
  onKeyDown,
  inputRefs,
  type = 'sales'
}) => {
  const isAdjustment = type === 'adjustment';

  return (
    <>
      {/* Desktop layout - hidden on mobile */}
      <tr className="hidden md:table-row border-b border-border hover:bg-muted/30">
        <td className="px-6 py-4 border-r border-border">
          <ItemSearchDropdown
            value={row.itemName}
            onChange={(value) => onUpdateRow(row.id, 'itemName', value)}
            onItemSelected={(name, avgCost) => {
              if (isAdjustment) {
                onUpdateRow(row.id, 'price', avgCost);
              }
            }}
            onKeyDown={(e) => onKeyDown(e, index, 'itemName')}
            inputRef={(ref) => {
              if (inputRefs.current) {
                inputRefs.current[`${row.id}-itemName`] = ref;
              }
            }}
          />
        </td>
        {isAdjustment && (
          <td className="px-6 py-4 border-r border-border">
            <select
              value={row.adjustmentType || 'increase'}
              onChange={(e) => onUpdateRow(row.id, 'adjustmentType', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            >
              <option value="increase">Increase</option>
              <option value="reduce">Reduce</option>
            </select>
          </td>
        )}
        <td className="px-6 py-4 border-r border-border">
          <input
            ref={(ref) => {
              if (inputRefs.current) {
                inputRefs.current[`${row.id}-qty`] = ref;
              }
            }}
            type="text"
            value={row.qty === 0 ? '' : row.qty}
            onChange={(e) => {
              const value = e.target.value;
              if (isAdjustment) {
                const numValue = parseFloat(value);
                onUpdateRow(row.id, 'qty', isNaN(numValue) ? 0 : Math.abs(numValue));
              } else {
                onUpdateRow(row.id, 'qty', value === '' ? 0 : parseFloat(value) || 0);
              }
            }}
            onKeyDown={(e) => onKeyDown(e, index, 'qty')}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            placeholder={isAdjustment ? "10" : "0"}
            step="0.01"
          />
        </td>
        {isAdjustment && (
          <td className="px-6 py-4 border-r border-border">
            <input
              type="number"
              value={row.price === 0 ? '' : row.price}
              onChange={(e) => {
                const value = e.target.value;
                onUpdateRow(row.id, 'price', value === '' ? 0 : parseFloat(value) || 0);
              }}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              placeholder="Cost per Kg"
              step="0.01"
            />
          </td>
        )}
        {isAdjustment && (
          <td className="px-6 py-4 border-r border-border">
            <input
              type="text"
              value={row.reason || ''}
              onChange={(e) => onUpdateRow(row.id, 'reason', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              placeholder="e.g., Damaged, Expired, Returned"
            />
          </td>
        )}
        {isAdjustment && (
          <td className="px-6 py-4">
            <div className="px-3 py-2 bg-muted rounded-md text-foreground font-medium">
              Rs{calculateRowTotal(row.qty, row.price).toFixed(2)}
            </div>
          </td>
        )}
        {!isAdjustment && (
          <>
            <td className="px-6 py-4 border-r border-border">
              <input
                ref={(ref) => {
                  if (inputRefs.current) {
                    inputRefs.current[`${row.id}-price`] = ref;
                  }
                }}
                type="number"
                value={row.price === 0 ? '' : row.price}
                onChange={(e) => {
                  const value = e.target.value;
                  onUpdateRow(row.id, 'price', value === '' ? 0 : parseFloat(value) || 0);
                }}
                onKeyDown={(e) => onKeyDown(e, index, 'price')}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                placeholder="0.00"
                step="0.01"
              />
            </td>
            <td className="px-6 py-4">
              <div className="px-3 py-2 bg-muted rounded-md text-foreground font-medium">
                Rs{calculateRowTotal(row.qty, row.price).toFixed(2)}
              </div>
            </td>
          </>
        )}
      </tr>

      {/* Mobile layout - visible only on mobile */}
      <tr className="md:hidden">
        <td colSpan={4} className="p-3">
          <div className="bg-card border border-border rounded-lg p-4 space-y-4 shadow-sm">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground">Item Name</label>
              <ItemSearchDropdown
                value={row.itemName}
                onChange={(value) => onUpdateRow(row.id, 'itemName', value)}
                onItemSelected={(name, avgCost) => {
                  if (isAdjustment) {
                    onUpdateRow(row.id, 'price', avgCost);
                  }
                }}
                onKeyDown={(e) => onKeyDown(e, index, 'itemName')}
                inputRef={(ref) => {
                  if (inputRefs.current) {
                    inputRefs.current[`${row.id}-itemName`] = ref;
                  }
                }}
              />
            </div>
            
            {isAdjustment ? (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted-foreground">Action</label>
                  <select
                    value={row.adjustmentType || 'increase'}
                    onChange={(e) => onUpdateRow(row.id, 'adjustmentType', e.target.value)}
                    className="w-full px-3 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-base"
                  >
                    <option value="increase">Increase</option>
                    <option value="reduce">Reduce</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted-foreground">Qty (Kg)</label>
                    <input
                      ref={(ref) => {
                        if (inputRefs.current) {
                          inputRefs.current[`${row.id}-qty`] = ref;
                        }
                      }}
                      type="number"
                      value={row.qty === 0 ? '' : row.qty}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = parseFloat(value);
                        onUpdateRow(row.id, 'qty', isNaN(numValue) ? 0 : Math.abs(numValue));
                      }}
                      onKeyDown={(e) => onKeyDown(e, index, 'qty')}
                      className="w-full px-3 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-base"
                      placeholder="10"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted-foreground">Cost/Kg</label>
                    <input
                      type="number"
                      value={row.price === 0 ? '' : row.price}
                      onChange={(e) => {
                        const value = e.target.value;
                        onUpdateRow(row.id, 'price', value === '' ? 0 : parseFloat(value) || 0);
                      }}
                      className="w-full px-3 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-base"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted-foreground">Reason</label>
                  <input
                    type="text"
                    value={row.reason || ''}
                    onChange={(e) => onUpdateRow(row.id, 'reason', e.target.value)}
                    className="w-full px-3 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-base"
                    placeholder="e.g., Damaged, Expired"
                  />
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Value:</span>
                    <div className="px-3 py-2 bg-primary/10 rounded-md text-primary font-bold text-lg">
                      Rs{calculateRowTotal(row.qty, row.price).toFixed(2)}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted-foreground">Qty (Kg)</label>
                    <input
                      ref={(ref) => {
                        if (inputRefs.current) {
                          inputRefs.current[`${row.id}-qty`] = ref;
                        }
                      }}
                      type="number"
                      value={row.qty === 0 ? '' : row.qty}
                      onChange={(e) => {
                        const value = e.target.value;
                        onUpdateRow(row.id, 'qty', value === '' ? 0 : parseFloat(value) || 0);
                      }}
                      onKeyDown={(e) => onKeyDown(e, index, 'qty')}
                      className="w-full px-3 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-base"
                      placeholder="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted-foreground">Price</label>
                    <input
                      ref={(ref) => {
                        if (inputRefs.current) {
                          inputRefs.current[`${row.id}-price`] = ref;
                        }
                      }}
                      type="number"
                      value={row.price === 0 ? '' : row.price}
                      onChange={(e) => {
                        const value = e.target.value;
                        onUpdateRow(row.id, 'price', value === '' ? 0 : parseFloat(value) || 0);
                      }}
                      onKeyDown={(e) => onKeyDown(e, index, 'price')}
                      className="w-full px-3 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-base"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Total:</span>
                    <div className="px-3 py-2 bg-primary/10 rounded-md text-primary font-bold text-lg">
                      Rs{calculateRowTotal(row.qty, row.price).toFixed(2)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </td>
      </tr>
    </>
  );
};
