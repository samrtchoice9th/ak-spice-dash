

# Fix: Receipt Editable Only Once Per Day

## Root Cause Analysis

After reviewing all relevant code, there is **no explicit daily editing restriction** in the codebase. The issue stems from two problems:

### Problem 1: Loading State Flicker
When `updateReceipt` is called, it triggers `refreshReceipts()` which sets `loading=true`. This causes the **entire ReceiptPage to unmount the table and show a loading spinner**. While this works, it creates a jarring UX and can cause timing issues with state management.

### Problem 2: Supabase 1000-Row Default Limit
The `getAllReceipts()` query has **no explicit row limit**, so Supabase applies its default limit of 1000 rows. With 1,800+ receipts in the database, older receipts may disappear from the list after a refresh, making it appear that edits were lost.

### Problem 3: Stale State After Refresh
After `refreshReceipts()` completes, the `receipts` array is replaced with a fresh array. If the user tries to edit the same receipt again, the `editingReceipt` reference is stale (pointing to the old array's object). The previous fix (clearing `editingReceipt` on save) helps, but the `refreshReceipts` call during `updateReceipt` sets `loading=true`, which unmounts the table and can interfere with the dialog state.

## Solution

### Step 1: Don't show full loading spinner during updates
**File: `src/contexts/ReceiptsContext.tsx`**

- In `updateReceipt`, update the local state optimistically instead of calling `refreshReceipts()` which triggers a full loading state
- Use a silent refresh (without setting `loading=true`) to sync with the database afterward
- This prevents the table from unmounting during edits

### Step 2: Add pagination/higher limit to receipt queries
**File: `src/services/receiptService.ts`**

- Add `.limit(5000)` or use pagination to ensure all receipts are returned
- This prevents receipts from disappearing after refresh

### Step 3: Ensure edit dialog always gets fresh data
**File: `src/pages/ReceiptPage.tsx`**

- When opening the edit dialog, find the receipt from the current `receipts` array by ID
- This guarantees fresh data even after multiple edits

## Technical Implementation

### File 1: `src/contexts/ReceiptsContext.tsx`

```tsx
// Add a silent refresh that doesn't trigger loading state
const silentRefreshReceipts = async () => {
  try {
    const fetchedReceipts = await receiptService.getAllReceipts();
    setReceipts(fetchedReceipts);
  } catch (error) {
    console.error('Failed to fetch receipts:', error);
  }
};

// Update updateReceipt to use optimistic update + silent refresh
const updateReceipt = async (id, receiptData) => {
  await receiptService.updateReceipt(id, receiptData);
  // Update local state immediately (optimistic)
  setReceipts(prev => prev.map(r => 
    r.id === id ? { ...r, type: receiptData.type, items: receiptData.items, totalAmount: receiptData.totalAmount } : r
  ));
  // Silent refresh to sync IDs from database
  silentRefreshReceipts();
};
```

### File 2: `src/services/receiptService.ts`

Add `.limit(5000)` to `getAllReceipts()` query to prevent Supabase's 1000-row default from hiding receipts.

## Files to Modify

1. **`src/contexts/ReceiptsContext.tsx`** - Optimistic updates, silent refresh
2. **`src/services/receiptService.ts`** - Add explicit query limit

## Expected Outcome

- Receipts can be edited unlimited times with no daily restriction
- Table stays visible during updates (no loading spinner flash)
- All receipts remain visible after edits
- Changes reflect immediately in the table and related pages

