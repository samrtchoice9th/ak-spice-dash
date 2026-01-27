

# Fix Receipt Type Edit Issue: Purchase to Sales

## Problem Summary

When editing a receipt to change its type (e.g., from "Purchase" to "Sales"), the change appears to save but reverts after refresh. The root cause is a **stale state issue** where the `editingReceipt` variable in `ReceiptPage` is never updated after the receipts refresh from the database.

## Root Cause Analysis

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Current Flow (Broken)                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. User clicks Edit → editingReceipt = old receipt object               │
│ 2. User changes type Purchase → Sales                                   │
│ 3. User clicks Save → updateReceipt() called                            │
│ 4. Database updated correctly ✓                                         │
│ 5. refreshReceipts() updates receipts array ✓                           │
│ 6. BUT editingReceipt still holds OLD object ✗                          │
│ 7. Dialog closes, user sees updated table                               │
│ 8. Next edit: useEffect sees same receipt reference, doesn't reset      │
└─────────────────────────────────────────────────────────────────────────┘
```

The `EditReceiptDialog` component's `useEffect` has `[receipt]` as dependency. Since `editingReceipt` is never updated to reflect the new receipt from the refreshed array, React doesn't detect a change and the effect doesn't re-run properly.

## Solution

### Step 1: Update editingReceipt After Save
**File: `src/pages/ReceiptPage.tsx`**

After successfully saving, update `editingReceipt` with the fresh data from the updated receipts array. This ensures the dialog has the latest data if reopened.

Changes:
- After `updateReceipt` completes and receipts refresh, find the updated receipt in the array
- Update `editingReceipt` state with the fresh receipt object
- Alternatively, clear `editingReceipt` immediately after successful save

### Step 2: Clear State Properly on Dialog Close
**File: `src/pages/ReceiptPage.tsx`**

Ensure `editingReceipt` is cleared when the dialog closes, forcing a fresh object reference when reopened.

### Step 3: Force State Reset in Dialog
**File: `src/components/EditReceiptDialog.tsx`**

Add `isOpen` to the `useEffect` dependency array so the dialog's local state resets whenever it opens. This ensures fresh data is loaded each time.

## Technical Implementation

### File 1: `src/pages/ReceiptPage.tsx`

```tsx
// Current problematic code:
const handleSaveReceipt = async (id: string, receiptData: any) => {
  try {
    await updateReceipt(id, receiptData);
    await new Promise(resolve => setTimeout(resolve, 300));
  } catch (error) {
    console.error('Failed to save receipt:', error);
    throw error;
  }
};

// Fixed code:
const handleSaveReceipt = async (id: string, receiptData: any) => {
  try {
    await updateReceipt(id, receiptData);
    // Clear editingReceipt immediately to prevent stale data
    setEditingReceipt(null);
    setIsEditDialogOpen(false);
  } catch (error) {
    console.error('Failed to save receipt:', error);
    throw error;
  }
};
```

### File 2: `src/components/EditReceiptDialog.tsx`

```tsx
// Current problematic code:
useEffect(() => {
  if (receipt) {
    setItems([...receipt.items]);
    setType(receipt.type);
  }
}, [receipt]);

// Fixed code:
useEffect(() => {
  if (receipt && isOpen) {
    setItems([...receipt.items]);
    setType(receipt.type);
  }
}, [receipt, isOpen]);
```

Also remove the setTimeout delay in handleSave since we're now closing the dialog from the parent after successful save:

```tsx
// Current code in handleSave:
await onSave(receipt.id, receiptData);
toast({
  title: "Success",
  description: "Receipt updated successfully."
});
setTimeout(() => {
  onClose();
}, 300);

// Fixed code:
await onSave(receipt.id, receiptData);
toast({
  title: "Success",
  description: "Receipt updated successfully."
});
// Dialog will be closed by parent component after successful save
```

## Files to Modify

1. **`src/pages/ReceiptPage.tsx`**
   - Update `handleSaveReceipt` to close dialog and clear state after successful save
   - Remove onClose from EditReceiptDialog since parent handles closure on success

2. **`src/components/EditReceiptDialog.tsx`**
   - Add `isOpen` to useEffect dependency array
   - Remove setTimeout for closing (parent handles this on success)
   - Keep dialog close on cancel button

## Expected Outcome

After these changes:
- When user changes receipt type from Purchase to Sales and saves
- Database is updated correctly
- Dialog closes immediately after save success
- editingReceipt is cleared to prevent stale data
- Next time user opens edit dialog, fresh data is loaded
- Receipt type change persists correctly

