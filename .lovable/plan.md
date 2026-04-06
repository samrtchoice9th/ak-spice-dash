

# Remove Print Button from Receipt Page

## Change
Remove the native "Print" button from the ReceiptsTable component, keeping only Edit, RawBT, and Delete buttons.

## File Changed
| File | Change |
|------|--------|
| `src/components/ReceiptsTable.tsx` | Remove the Print button from both mobile card view and desktop table view |

### Details
- Remove the `<Button>` with `<Printer>` icon and "Print" label from the desktop table row (around line 175-178)
- Remove the `<Button>` with `<Printer>` icon from the mobile card view (around line 135-137)
- Remove `Printer` from the lucide-react import
- Keep `onPrint` prop in the interface (used internally by other callers) but simply don't render the button

