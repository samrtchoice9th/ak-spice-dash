import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSuppliers } from '@/contexts/SuppliersContext';
import { useReceipts } from '@/contexts/ReceiptsContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, AlertTriangle, CreditCard } from 'lucide-react';
import { SupplierForm } from '@/components/suppliers/SupplierForm';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { DueAlert } from '@/components/customers/DueAlert';
import { PayDueDialog } from '@/components/customers/PayDueDialog';
import { useToast } from '@/hooks/use-toast';

const SupplierDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { suppliers, updateSupplier, deleteSupplier } = useSuppliers();
  const { receipts, payDue } = useReceipts();
  const { toast } = useToast();
  const [showEdit, setShowEdit] = useState(false);
  const [payingReceipt, setPayingReceipt] = useState<{ id: string; due: number; date: string } | null>(null);

  const supplier = suppliers.find(s => s.id === id);

  const { supplierReceipts, totalPurchases, totalPaid, totalDue } = useMemo(() => {
    const sr = receipts.filter(r => r.supplier_id === id);
    const tp = sr.reduce((sum, r) => sum + r.totalAmount, 0);
    const tPaid = sr.reduce((sum, r) => sum + (r.paid_amount || 0), 0);
    const td = sr.reduce((sum, r) => sum + (r.due_amount || 0), 0);
    return { supplierReceipts: sr, totalPurchases: tp, totalPaid: tPaid, totalDue: td };
  }, [receipts, id]);

  const overdueReceipts = useMemo(() =>
    supplierReceipts.filter(r => r.due_amount && r.due_amount > 0 && r.due_date && new Date(r.due_date) <= new Date()),
    [supplierReceipts]
  );

  if (!supplier) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Supplier not found</p>
        <Button variant="outline" onClick={() => navigate('/suppliers')} className="mt-4">Back</Button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirm('Delete this supplier?')) return;
    await deleteSupplier(supplier.id);
    toast({ title: 'Supplier deleted' });
    navigate('/suppliers');
  };

  const reminderMessage = `Dear ${supplier.name}, we have a pending payment of Rs.${totalDue.toFixed(2)}. - AK SPICE`;

  return (
    <div className="p-1 sm:p-4 pb-20">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/suppliers')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg sm:text-xl font-bold text-foreground flex-1">{supplier.name}</h1>
        <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}><Edit className="h-4 w-4" /></Button>
        <Button variant="destructive" size="sm" onClick={handleDelete}><Trash2 className="h-4 w-4" /></Button>
      </div>

      {overdueReceipts.length > 0 && (
        <div className="p-3 mb-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <span className="text-sm text-destructive font-medium">
            {overdueReceipts.length} overdue payment{overdueReceipts.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg border bg-card">
          <p className="text-xs text-muted-foreground">Phone</p>
          <p className="text-sm font-medium">{supplier.phone || '—'}</p>
        </div>
        <div className="p-3 rounded-lg border bg-card">
          <p className="text-xs text-muted-foreground">WhatsApp</p>
          <p className="text-sm font-medium">{supplier.whatsapp_number || '—'}</p>
        </div>
        <div className="p-3 rounded-lg border bg-card">
          <p className="text-xs text-muted-foreground">Total Purchases</p>
          <p className="text-sm font-bold">Rs. {totalPurchases.toFixed(2)}</p>
        </div>
        <div className="p-3 rounded-lg border bg-card">
          <p className="text-xs text-muted-foreground">Total Paid</p>
          <p className="text-sm font-bold text-primary">Rs. {totalPaid.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {totalDue > 0 && <DueAlert dueAmount={totalDue} />}
        {supplier.whatsapp_number && totalDue > 0 && (
          <WhatsAppButton phone={supplier.whatsapp_number} message={reminderMessage} label="Send Reminder" />
        )}
      </div>

      <h2 className="font-semibold text-foreground mb-2">Transactions</h2>
      {supplierReceipts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No transactions yet</p>
      ) : (
        <div className="space-y-2">
          {supplierReceipts.map(r => (
            <div key={r.id} className="p-3 rounded-lg border bg-card">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs text-muted-foreground">{r.date} • {r.type}</span>
                  <p className="text-sm font-medium">Rs. {r.totalAmount.toFixed(2)}</p>
                  {(r.paid_amount || 0) > 0 && (
                    <p className="text-xs text-muted-foreground">Paid: Rs.{(r.paid_amount || 0).toFixed(2)}</p>
                  )}
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  {r.due_amount && r.due_amount > 0 ? (
                    <>
                      <DueAlert dueAmount={r.due_amount} dueDate={r.due_date} />
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => setPayingReceipt({ id: r.id, due: r.due_amount!, date: r.date })}
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        Pay Due
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-primary font-medium">Paid</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <SupplierForm
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Supplier"
        initial={{
          name: supplier.name,
          phone: supplier.phone || '',
          whatsapp_number: supplier.whatsapp_number || '',
          address: supplier.address || '',
        }}
        onSave={async (data) => { await updateSupplier(supplier.id, data); }}
      />

      {payingReceipt && (
        <PayDueDialog
          open={!!payingReceipt}
          onClose={() => setPayingReceipt(null)}
          receiptId={payingReceipt.id}
          dueAmount={payingReceipt.due}
          receiptDate={payingReceipt.date}
          onPay={payDue}
        />
      )}
    </div>
  );
};

export default SupplierDetail;
