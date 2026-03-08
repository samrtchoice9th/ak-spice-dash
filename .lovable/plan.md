

# Reset Password for ak7live1140@gmail.com

## Problem
You can't access the Supabase dashboard directly, so I'll reset the password through an edge function using the admin API.

## Solution
Create a temporary edge function that uses the Supabase Admin API (service role key) to update the user's password. The user exists with ID `287bbc16-1592-4e5d-8c58-f0aa1783d6cc`.

### Steps
1. **Create edge function** `reset-password` that uses `supabase.auth.admin.updateUserById()` to set the new password
2. **Call it** to reset the password to `ak773962001`
3. **Delete the edge function** immediately after — it's only needed once

This is a one-time operation. No frontend changes needed.

