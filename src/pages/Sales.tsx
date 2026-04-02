import React, { useState } from 'react';
import { usePOSData } from '@/hooks/usePOSData';
import { SalesRowComponent } from '@/components/sales/SalesRow';
import { TotalBar } from '@/components/sales/TotalBar';
import { SaveSuccessModal } from '@/components/sales/SaveSuccessModal';
import { CustomerSelect } from '@/components/sales/CustomerSelect';
import { PaymentSection } from '@/components/sales/PaymentSection';
import { useIsMobile } from '@/hooks/use-mobile';
import { Customer } from '@/services/customerService';

const Sales = () => {
  const {
    rows, errors, isSaving, showSuccess, setShowSuccess,
    lastSavedRows, grandTotal, distinctItems, inputRefs,
    updateRow, addRow, deleteRow, duplicateRow, handleKeyDown, handleSave,
    paidAmount, setPaidAmount, dueDate, setDueDate,
    setSelectedContactId,
  } = usePOSData('sales');

  const isMobile = useIsMobile();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleCustomerSelect = (c: Customer | null) => {
    setSelectedCustomer(c);
    setSelectedContactId(c?.id || null);
    if (!c) { setPaidAmount(0); setDueDate(''); }
  };

  return (
    <div className="pb-24">
      <div className="mb-3">
        <h1 className="text-lg sm:text-xl font-bold text-foreground">Sales</h1>
      </div>

      <div className="mb-3">
        <CustomerSelect selectedCustomer={selectedCustomer} onSelect={handleCustomerSelect} />
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
        <div className="border rounded-lg overflow-visible bg-card">
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

      {selectedCustomer && (
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
        savedRows={lastSavedRows} type="sales"
        customerName={selectedCustomer?.name}
        customerWhatsApp={selectedCustomer?.whatsapp_number}
        paidAmount={paidAmount}
        dueAmount={Math.max(0, grandTotal - paidAmount)}
      />
    </div>
  );
};

export default Sales;
