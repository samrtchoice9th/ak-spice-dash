

# Fix Save Error + Receipt Reprint

## Two Issues

### Issue 1: "Edge Function returned a non-2xx status code" on Save (Critical)

**Root Cause**: The edge function (`manage-receipt/index.ts` line 66) calls `supabase.auth.getClaims()`, but it imports `@supabase/supabase-js@2.49.4` which **does not have this method** (it was added in `auth-js@2.69.0`, shipped with `supabase-js@2.50+`). This causes a runtime error intermittently (or always, depending on esm.sh caching).

**Fix**: Upgrade the import to a version that supports `getClaims`, e.g. `@supabase/supabase-js@2.50.0` or later. Alternatively, fall back to `getUser()` which works on all versions but is slightly slower.

**Recommended approach**: Upgrade to `@supabase/supabase-js@2.50.0` (or latest stable like `2.51.0`) in the import URL.

### Issue 2: Receipt Page Reprint

The receipt page already has print buttons (native Print and RawBT). The print handler uses `receipt.date` and `receipt.time` from the saved receipt, so reprints should show the original date/time correctly. This appears to already work. If there's a specific issue with the print button, please clarify.

However, I notice the print currently generates a **random invoice number** each time (`INVM-XX-XXXXX`). On reprint, it should ideally use a consistent number derived from the receipt ID.

## Changes

### File: `supabase/functions/manage-receipt/index.ts`
- Line 1: Change import from `@2.49.4` to `@2.51.0`
- This fixes the `getClaims` method not found error

### File: `src/components/ReceiptPrintHandler.tsx` (Optional improvement)
- Generate invoice number from receipt ID instead of random number, so reprints show consistent invoice numbers

| File | Change |
|------|--------|
| `supabase/functions/manage-receipt/index.ts` | Upgrade supabase-js import version |
| `src/components/ReceiptPrintHandler.tsx` | Use receipt ID for consistent invoice numbers on reprint |

