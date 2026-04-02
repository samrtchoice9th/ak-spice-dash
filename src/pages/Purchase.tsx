import React, { useState } from 'react';
import { usePOSData } from '@/hooks/usePOSData';
import { SalesRowComponent } from '@/components/sales/SalesRow';
import { TotalBar } from '@/components/sales/TotalBar';
import { SaveSuccessModal } from '@/components/sales/SaveSuccessModal';
import { SupplierSelect } from '@/components/sales/SupplierSelect';
import { PaymentSection } from '@/components/sales/PaymentSection';
import { useIsMobile } from '@/hooks/use-mobile';
import { Supplier } from '@/services/supplierService';

const Purchase = () => {
  const {
    rows, errors, isSaving, showSuccess, setShowSuccess,
    lastSavedRows, grandTotal, distinctItems, inputRefs,
    updateRow, addRow, deleteRow, duplicateRow, handleKeyDown, handleSave,
    paidAmount, setPaidAmount, dueDate, setDueDate,
    setSelectedContactId,
  } = usePOSData('purchase');

  const isMobile = useIsMobile();
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const handleSupplierSelect = (s: Supplier | null) => {
    setSelectedSupplier(s);
    setSelectedContactId(s?.id || null);
    if (!s) { setPaidAmount(0); setDueDate(''); }
  };

  return (
    <div className="pb-24">
      <div className="mb-3">
        <h1 className="text-lg sm:text-xl font-bold text-foreground">Purchase</h1>
      </div>

      <div className="mb-3">
        <SupplierSelect selectedSupplier={selectedSupplier} onSelect={handleSupplierSelect} />
      </div>

      {isMobile ? (
        <div className="space-y-2">
          {rows.map(row => (
            <SalesRowComponent key={row.id} row={row} rowErrors={errors[row.id]}
              onUpdate={updateRow} onDelete={deleteRow} onDuplicate={duplicateRow}
              onKeyDown={handleKeyDown} inputRefs={inputRefs} />
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
                <SalesRowComponent key={row.id} row={row} rowErrors={errors[row.id]}
                  onUpdate={updateRow} onDelete={deleteRow} onDuplicate={duplicateRow}
                  onKeyDown={handleKeyDown} inputRefs={inputRefs} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSupplier && (
        <div className="mt-3">
          <PaymentSection
            grandTotal={grandTotal}
            paidAmount={paidAmount}
            onPaidAmountChange={setPaidAmount}
            dueDate={dueDate}
            onDueDateChange={setDueDate}
          />
        </div>
      )}

      <TotalBar distinctItems={distinctItems} grandTotal={grandTotal}
        isSaving={isSaving} hasErrors={Object.keys(errors).length > 0}
        onSave={handleSave} onAddRow={addRow} />

      <SaveSuccessModal open={showSuccess} onClose={() => setShowSuccess(false)}
        savedRows={lastSavedRows} type="purchase"
        customerName={selectedSupplier?.name}
        customerWhatsApp={selectedSupplier?.whatsapp_number}
        paidAmount={paidAmount}
        dueAmount={Math.max(0, grandTotal - paidAmount)}
      />
    </div>
  );
};

export default Purchase;
