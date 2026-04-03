

# Fix Receipt Time to Sri Lankan Timezone

## Problem
In `supabase/functions/manage-receipt/index.ts` (line 245), the time is generated using `now.toLocaleTimeString()` which uses the server's default locale/timezone (UTC in Deno edge functions). Sri Lankan time is UTC+5:30.

## Fix — `supabase/functions/manage-receipt/index.ts`

Change line 245 from:
```typescript
const time = now.toLocaleTimeString();
```
to:
```typescript
const time = now.toLocaleTimeString("en-US", { timeZone: "Asia/Colombo", hour12: true });
```

Also update the date (line 244) to use Sri Lankan date to avoid date mismatch near midnight:
```typescript
const date = now.toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" }); // YYYY-MM-DD format
```

One file changed, two lines modified.

