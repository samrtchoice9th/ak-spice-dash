

# Add Cost/Value Tracking to Stock Adjustments

## Problem
Currently, stock adjustments (expired, damaged, stock clearance) save with `price: 0` and `total: 0`. There's no way to record the financial loss when items are reduced. The user wants to track the cost of expired/damaged goods and stock clearance losses.

## Solution
Add an optional "Cost (per Kg)" field to the Stock Adjustment page. When a value is entered, the receipt records the loss amount. For "reduce" adjustments, the system will use the product's existing avg_cost as the default price if not specified.

## Changes

### 1. `src/components/TableRow.tsx`
- Add a "Cost" input field for adjustment rows (between Qty and Reason)
- Show on both desktop and mobile layouts
- Auto-fill with product's avg_cost when item is selected (optional manual override)

### 2. `src/hooks/useTableData.ts`
- Change line 135-136: instead of hardcoding `price: 0, total: 0` for adjustments, use the entered price value
- Calculate `total = qty * price` for adjustments when price is provided

### 3. `src/components/TableHeader.tsx`
- Add "Cost" column header for adjustment type

### 4. `src/components/DataTable.tsx`
- Show a total/summary for adjustment value (loss amount)

### 5. `src/types/table.ts`
- No change needed — `price` field already exists on TableRow

### 6. Edge Function — No changes needed
- `applyStockEffect` already handles price correctly for increase/reduce types
- For "reduce": avg_cost stays unchanged (correct — remaining stock keeps its value)
- For "increase": weighted average recalculated using the price (correct)
- The receipt will now properly store the loss value in `total_amount`

## How It Works
1. User selects item → system auto-fills cost from product's avg_cost
2. User can override cost or leave it
3. On save: `total = qty × cost` is recorded as the loss/gain value
4. Receipt page shows the financial impact of each adjustment
5. Reports can now track waste/damage costs

## Files Changed
| File | Change |
|------|--------|
| `src/components/TableRow.tsx` | Add Cost input for adjustments |
| `src/components/TableHeader.tsx` | Add Cost column header |
| `src/hooks/useTableData.ts` | Use actual price instead of 0 for adjustments |
| `src/components/DataTable.tsx` | Show adjustment total in footer |
| `src/components/ItemSearchDropdown.tsx` | Return product price/avg_cost on selection |

