

# Fix: Qty Input Not Visible on Mobile

## Problem
On mobile (390px viewport), the bottom section uses `grid grid-cols-3` which gives each column ~120px. The Qty column contains two 40px buttons + an input in a flex row — that's 80px of buttons leaving only ~40px for the input, which gets crushed to near-zero width. The qty value becomes invisible.

## Fix — `src/components/sales/SalesRow.tsx`

Change the mobile layout from `grid-cols-3` with equal columns to a layout that gives Qty more space:

**Option**: Use `grid-cols-[1fr_auto_auto]` so Qty gets the flexible space while Price and Total get auto-sized columns. Additionally, reduce the stepper buttons from `h-10 w-10` to `h-8 w-8` on mobile to save horizontal space.

### Changes in the mobile section (lines 73-110):

1. **Line 73**: Change `grid grid-cols-3 gap-2` → `grid grid-cols-[2fr_1fr_1fr] gap-2` so Qty gets double the space
2. **Lines 77, 90**: Reduce stepper buttons from `h-10 w-10` to `h-8 w-8`
3. **Line 88**: Reduce qty input width with `min-w-0` to allow proper flex shrinking

This gives Qty ~50% of the row width (~180px on 390px screen), enough for both buttons + input.

