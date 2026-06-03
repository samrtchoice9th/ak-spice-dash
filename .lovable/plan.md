# Fix: Edit Receipt dialog — dropdown selection doesn't fill item name

## Problem
In the Edit Receipt popup, when adding a new item and picking a name from the dropdown, the item name field stays empty. Only typing letters works (and even that shows the search list but selection appears to do nothing).

## Root cause
`EditReceiptDialog.updateItem` always builds its next state from the `items` value captured in its closure:

```ts
const updatedItems = [...items];
updatedItems[index] = { ...updatedItems[index], [field]: value };
setItems(updatedItems);
```

When the user picks a product in the dropdown, `EditReceiptItemRow` fires three updates back-to-back in the same tick:
1. `onUpdate(index, 'itemName', selectedName)` (from `ItemSearchDropdown.onChange`)
2. `onUpdate(index, 'itemName', selectedName)` (from `handleItemSelect`)
3. `onUpdate(index, 'price', selectedProduct.price)` (from `handleItemSelect`)

Each call reads the same stale `items`, so call #3 overwrites #1/#2 and the itemName is lost. End result: name field blank, price filled.

## Fix
Two small, surgical changes — frontend only, no logic/business changes.

### 1. `src/components/EditReceiptDialog.tsx`
Make `updateItem` use the functional form of `setItems` so consecutive updates compose correctly, and recompute `total` from the merged row:

```ts
const updateItem = (index: number, field: keyof ReceiptItem, value: string | number) => {
  setItems(prev => {
    const next = [...prev];
    const merged = { ...next[index], [field]: value };
    if (field === 'qty' || field === 'price') {
      merged.total = Number(merged.qty) * Number(merged.price);
    }
    next[index] = merged;
    return next;
  });
};
```

### 2. `src/components/EditReceiptItemRow.tsx`
Stop calling `onUpdate` twice for the name. The `ItemSearchDropdown` already forwards the chosen name through `onChange`, so `handleItemSelect` only needs to set the price:

```ts
const handleItemSelect = (itemName: string) => {
  const selectedProduct = products.find(p => p.name === itemName);
  if (selectedProduct) {
    onUpdate(index, 'price', selectedProduct.price);
  }
};
```

`onChange` keeps doing `onUpdate(index, 'itemName', value)` then `handleItemSelect(value)`. With the functional setter from change #1, both updates compose and the row ends up with the correct name, price, and total.

## Out of scope
- No changes to `useItemDropdown`, `ItemSearchDropdown`, stock-adjustment flow, or any DB/edge logic.
- Sales/Purchase pages use a different component (`sales/ItemSearch`) and are unaffected.

## Files changed
- `src/components/EditReceiptDialog.tsx`
- `src/components/EditReceiptItemRow.tsx`
