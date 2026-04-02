import React from 'react';
import { useSalesData } from '@/hooks/useSalesData';
import { SalesRowComponent } from '@/components/sales/SalesRow';
import { TotalBar } from '@/components/sales/TotalBar';
import { SaveSuccessModal } from '@/components/sales/SaveSuccessModal';
import { useIsMobile } from '@/hooks/use-mobile';

const Sales = () => {
  const {
    rows,
    errors,
    isSaving,
    showSuccess,
    setShowSuccess,
    lastSavedRows,
    grandTotal,
    distinctItems,
    inputRefs,
    updateRow,
    addRow,
    deleteRow,
    duplicateRow,
    handleKeyDown,
    handleSave,
  } = useSalesData();

  const isMobile = useIsMobile();

  return (
    <div className="pb-24">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground">Sales</h1>
      </div>

      {isMobile ? (
        <div className="space-y-2">
          {rows.map(row => (
            <SalesRowComponent
              key={row.id}
              row={row}
              rowErrors={errors[row.id]}
              onUpdate={updateRow}
              onDelete={deleteRow}
              onDuplicate={duplicateRow}
              onKeyDown={handleKeyDown}
              inputRefs={inputRefs}
            />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left text-sm font-medium text-muted-foreground">Item Name</th>
                <th className="p-2 text-center text-sm font-medium text-muted-foreground">Qty</th>
                <th className="p-2 text-left text-sm font-medium text-muted-foreground">Price</th>
                <th className="p-2 text-right text-sm font-medium text-muted-foreground">Total</th>
                <th className="p-2 text-center text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <SalesRowComponent
                  key={row.id}
                  row={row}
                  rowErrors={errors[row.id]}
                  onUpdate={updateRow}
                  onDelete={deleteRow}
                  onDuplicate={duplicateRow}
                  onKeyDown={handleKeyDown}
                  inputRefs={inputRefs}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TotalBar
        distinctItems={distinctItems}
        grandTotal={grandTotal}
        isSaving={isSaving}
        hasErrors={Object.keys(errors).length > 0}
        onSave={handleSave}
        onAddRow={addRow}
      />

      <SaveSuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        savedRows={lastSavedRows}
      />
    </div>
  );
};

export default Sales;
