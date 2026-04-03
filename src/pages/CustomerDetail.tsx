import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomers } from '@/contexts/CustomersContext';
import { useReceipts } from '@/contexts/ReceiptsContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, AlertTriangle, CreditCard } from 'lucide-react';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { DueAlert } from '@/components/customers/DueAlert';
import { PayDueDialog } from '@/components/customers/PayDueDialog';
import { useToast } from '@/hooks/use-toast';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, updateCustomer, deleteCustomer } = useCustomers();
  const { receipts, payDue } = useReceipts();
  const { toast } = useToast();
  const [showEdit, setShowEdit] = useState(false);
  const [payingReceipt, setPayingReceipt] = useState<{ id: string; due: number; date: string } | null>(null);

  const customer = customers.find(c => c.id === id);

  const { customerReceipts, totalPurchases, totalPaid, totalDue } = useMemo(() => {
    const cr = receipts.filter(r => r.customer_id === id);
    const tp = cr.reduce((sum, r) => sum + r.totalAmount, 0);
    const tPaid = cr.reduce((sum, r) => sum + (r.paid_amount || 0), 0);
    const td = cr.reduce((sum, r) => sum + (r.due_amount || 0), 0);
    return { customerReceipts: cr, totalPurchases: tp, totalPaid: tPaid, totalDue: td };
  }, [receipts, id]);

  const overdueReceipts = useMemo(() =>
    customerReceipts.filter(r => r.due_amount && r.due_amount > 0 && r.due_date && new Date(r.due_date) <= new Date()),
    [customerReceipts]
  );

  if (!customer) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Customer not found</p>
        <Button variant="outline" onClick={() => navigate('/customers')} className="mt-4">Back</Button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirm('Delete this customer?')) return;
    await deleteCustomer(customer.id);
    toast({ title: 'Customer deleted' });
    navigate('/customers');
  };

  const reminderMessage = `Dear ${customer.name}, you have a pending amount of Rs.${totalDue.toFixed(2)}. Please settle at your earliest convenience. - AK SPICE`;

  return (
    <div className="p-1 sm:p-4 pb-20">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/customers')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg sm:text-xl font-bold text-foreground flex-1">{customer.name}</h1>
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
          <p className="text-sm font-medium">{customer.phone || '—'}</p>
        </div>
        <div className="p-3 rounded-lg border bg-card">
          <p className="text-xs text-muted-foreground">WhatsApp</p>
          <p className="text-sm font-medium">{customer.whatsapp_number || '—'}</p>
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
        {customer.whatsapp_number && totalDue > 0 && (
          <WhatsAppButton phone={customer.whatsapp_number} message={reminderMessage} label="Send Reminder" />
        )}
      </div>

      <h2 className="font-semibold text-foreground mb-2">Transactions</h2>
      {customerReceipts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No transactions yet</p>
      ) : (
        <div className="space-y-2">
          {customerReceipts.map(r => (
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

      <CustomerForm
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Customer"
        initial={{
          name: customer.name,
          phone: customer.phone || '',
          whatsapp_number: customer.whatsapp_number || '',
          address: customer.address || '',
        }}
        onSave={async (data) => { await updateCustomer(customer.id, data); }}
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

export default CustomerDetail;
