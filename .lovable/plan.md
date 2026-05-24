## Problem

Save fails on Sales with toast "Edge Function returned a non-2xx status code". Edge logs show the function is returning **HTTP 400** (validation rejection), but the client only shows the generic supabase-js message because `supabase.functions.invoke()` does not auto-parse the JSON error body for non-2xx responses.

The 400 most likely comes from one of these `manage-receipt` validations:
- `Insufficient stock for <item>` (sales/reduce with no inventory)
- `Paid amount cannot exceed total`
- Item name/qty/price = 0
- Missing `shop_id`

Without the real message, the user cannot tell which one.

## Fix

### 1. Surface the real edge error (`src/services/receiptService.ts`)

Wrap all four `supabase.functions.invoke('manage-receipt', …)` calls (create, update, delete, payDue) so that when `error` is a `FunctionsHttpError`, we read its response body and throw a new `Error` with the server's `error` field:

```ts
if (error) {
  let msg = error.message;
  try {
    const ctx: any = (error as any).context;
    if (ctx?.json) msg = (await ctx.json())?.error ?? msg;
    else if (ctx?.text) msg = (await ctx.text()) || msg;
  } catch {}
  throw new Error(msg);
}
```

This makes the existing toast in `usePOSData.handleSave` show the actual reason (e.g. "Insufficient stock for Rice. Available: 0, Requested: 5").

### 2. Verify root cause

After the message is visible, the user will see one of:
- **Insufficient stock** → expected behaviour when selling an item that hasn't been purchased yet. No code change needed; user should add a Purchase first or use Stock Adjustment > Increase.
- **Paid > total / other validation** → confirm clamp logic in `PaymentSection.tsx` already merged is working.
- **Anything else** → address case-by-case.

## Files touched

- `src/services/receiptService.ts` — extract real error message from `FunctionsHttpError.context` for all four invoke calls.

No DB / edge function changes required.