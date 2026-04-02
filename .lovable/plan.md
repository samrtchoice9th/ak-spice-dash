# Customer & Supplier Module — Full Implementation

## Database Changes (Migration)

### New Tables

`customers` — shop-scoped (then only one shop not multi shop)

- `id` uuid PK, `shop_id` uuid, `name` text NOT NULL, `phone` text, `whatsapp_number` text, `address` text, `created_at` timestamptz DEFAULT now()
- Unique constraint on `(shop_id, phone)` to prevent duplicates
- RLS: same pattern as products — `shop_id = get_user_shop_id(auth.uid()) OR has_role('super_admin')`

`**suppliers**` — identical structure to customers

- Same columns, same RLS policies

### Modify `receipts` table

- Add `customer_id` uuid nullable (FK to customers)
- Add `supplier_id` uuid nullable (FK to suppliers)
- Add `paid_amount` numeric DEFAULT 0
- Add `due_amount` numeric DEFAULT 0
- Add `due_date` text nullable

## New Files

### Services


| File                              | Purpose                  |
| --------------------------------- | ------------------------ |
| `src/services/customerService.ts` | CRUD for customers table |
| `src/services/supplierService.ts` | CRUD for suppliers table |


### Contexts


| File                                | Purpose                   |
| ----------------------------------- | ------------------------- |
| `src/contexts/CustomersContext.tsx` | Customer state + provider |
| `src/contexts/SuppliersContext.tsx` | Supplier state + provider |


### Pages


| File                           | Purpose                                                        |
| ------------------------------ | -------------------------------------------------------------- |
| `src/pages/Customers.tsx`      | Customer list with due amounts, search, add/edit dialog        |
| `src/pages/CustomerDetail.tsx` | Single customer: info, total purchases, due, last transactions |
| `src/pages/Suppliers.tsx`      | Supplier list (same pattern as customers)                      |
| `src/pages/SupplierDetail.tsx` | Single supplier detail                                         |


### Components


| File                                        | Purpose                                                        |
| ------------------------------------------- | -------------------------------------------------------------- |
| `src/components/customers/CustomerForm.tsx` | Add/Edit form with validation (name required, WhatsApp format) |
| `src/components/customers/CustomerList.tsx` | List with due highlighting (red=overdue, yellow=upcoming)      |
| `src/components/customers/DueAlert.tsx`     | Due/overdue badge component                                    |
| `src/components/suppliers/SupplierForm.tsx` | Add/Edit form                                                  |
| `src/components/sales/CustomerSelect.tsx`   | Customer picker in Sales POS (optional per sale)               |
| `src/components/sales/PaymentSection.tsx`   | Paid/due amount inputs shown after customer selected           |
| `src/components/WhatsAppButton.tsx`         | Reusable "Send via WhatsApp" button                            |
| `src/components/ReceiptPDF.tsx`             | PDF receipt generator using browser print/download             |


## Feature Details

### Due System

- When saving a sale with a customer: `due_amount = totalAmount - paid_amount`
- If `paid_amount < totalAmount`, status is "Due"
- `due_date` is optional, set by user
- Customer detail page aggregates total due from all their receipts
- Dashboard shows overdue count if any exist

### WhatsApp Integration (wa.me links, no API needed)

- Text-based receipt message (no PDF hosting required):
  ```
  *AK SPICE*
  Date: 2026-04-02
  ---------------
  Item 1 x2 = Rs.100
  Item 2 x1 = Rs.50
  ---------------
  Total: Rs.150
  Paid: Rs.100
  Due: Rs.50
  ```
- "Send via WhatsApp" opens `https://wa.me/{number}?text={encoded_message}`
- Available in: SaveSuccessModal, CustomerDetail page, SupplierDetail page

### PDF Receipt

- Generate using browser `window.print()` with a hidden print-optimized div
- Shows: shop name, date, items table, totals, customer name
- "Download PDF" button in SaveSuccessModal and CustomerDetail

### Due Alerts

- Dashboard: card showing "X overdue payments" with total amount
- Customer list: red highlight for overdue, yellow for due within 3 days
- Customer detail: warning banner if overdue

## Modified Files


| File                                        | Change                                                                     |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| `src/App.tsx`                               | Add routes for customers, suppliers, detail pages; wrap with new providers |
| `src/config/menuItems.ts`                   | Add Customers and Suppliers menu items (admin role)                        |
| `src/hooks/usePOSData.ts`                   | Add customer_id, paid_amount, due_amount to save logic                     |
| `src/pages/Sales.tsx`                       | Add CustomerSelect and PaymentSection above TotalBar                       |
| `src/pages/Purchase.tsx`                    | Add SupplierSelect above TotalBar                                          |
| `src/components/sales/SaveSuccessModal.tsx` | Add "Send via WhatsApp" and "Download PDF" buttons                         |
| `src/components/sales/TotalBar.tsx`         | Show due amount when customer selected                                     |
| `src/services/receiptService.ts`            | Include customer_id, supplier_id, paid/due amounts in create/update        |
| `src/contexts/ReceiptsContext.tsx`          | Add customer_id, supplier_id, paid/due to Receipt type                     |
| `src/pages/Dashboard.tsx`                   | Add overdue alerts card                                                    |


## Execution Order

1. Database migration (new tables + receipts columns)
2. Customer/Supplier services and contexts
3. Customer/Supplier list pages and forms
4. Customer/Supplier detail pages
5. CustomerSelect + PaymentSection in Sales/Purchase POS
6. Due tracking logic and alerts
7. WhatsApp text receipt integration
8. PDF receipt (browser print)
9. Dashboard overdue alerts
10. Menu items and routing