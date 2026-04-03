

# Customer/Supplier Partial Payment System

## What Already Works
- Receipts already store `paid_amount`, `due_amount`, `due_date`, `customer_id`, `supplier_id`
- Sales/Purchase pages already have the PaymentSection for initial partial payment
- CustomerDetail/SupplierDetail already show total due, overdue alerts, transaction history, WhatsApp reminders
- DueAlert component already color-codes red (overdue), yellow (upcoming), orange (partial)

## What's New — Balance Payment After Initial Sale

The missing piece: when a customer has a due balance from a previous sale, there's no way to record a later payment to reduce that due.

### 1. Database Migration — Create `payments` table

```sql
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid REFERENCES receipts(id) ON DELETE CASCADE,
  customer_id uuid,
  supplier_id uuid,
  amount numeric NOT NULL CHECK (amount > 0),
  payment_type text NOT NULL CHECK (payment_type IN ('in', 'out')),
  payment_method text NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank', 'other')),
  note text,
  shop_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
-- RLS policies scoped by shop_id (same pattern as other tables)
```

### 2. Edge Function Update — `manage-receipt/index.ts`

Add a new action `"pay_due"` that:
- Accepts `receipt_id`, `amount`, `payment_method`
- Validates amount does not exceed current `due_amount`
- Inserts into `payments` table
- Updates `receipts.paid_amount` += amount, `receipts.due_amount` -= amount
- Returns updated receipt

### 3. New Component — `PayDueDialog.tsx`

A dialog with:
- Amount input (validated: > 0, <= due amount)
- Payment method select (Cash / Bank / Other)
- Optional note field
- Shows current due amount prominently

### 4. CustomerDetail.tsx & SupplierDetail.tsx Updates

- Add "Pay Due" button next to each receipt that has due > 0
- Add summary cards: Total Purchases, Total Paid, Total Due
- Show payment history per receipt (fetch from `payments` table)
- Color coding: Red = overdue, Yellow = partial, Green = fully paid (already exists via DueAlert)

### 5. Receipt Service Update — `receiptService.ts`

Add `payDue(receiptId, amount, paymentMethod, note?)` method that calls the edge function.

### 6. Validation Rules
- `paid_amount` cannot exceed `total_amount`
- Payment amount cannot exceed `due_amount`
- No negative values
- Receipt total is never edited after payment starts (enforced by using payments table)

## Files Changed

| File | Change |
|------|--------|
| Migration SQL | Create `payments` table with RLS |
| `supabase/functions/manage-receipt/index.ts` | Add `pay_due` action |
| `src/components/customers/PayDueDialog.tsx` | New — payment form dialog |
| `src/services/receiptService.ts` | Add `payDue()` method |
| `src/pages/CustomerDetail.tsx` | Add Pay Due button per receipt, summary cards |
| `src/pages/SupplierDetail.tsx` | Same as CustomerDetail |
| `src/contexts/ReceiptsContext.tsx` | Add `payDue` to context |

## Execution Order
1. Migration (payments table)
2. Edge function update
3. PayDueDialog component
4. receiptService + ReceiptsContext update
5. CustomerDetail + SupplierDetail UI updates

