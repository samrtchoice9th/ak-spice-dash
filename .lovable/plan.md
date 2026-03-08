

# Add Shop Details to Signup and Receipts

## Overview
Update the signup flow to collect shop name, address, and phone number. Store these in the `shops` table and use them dynamically in receipt printing (instead of hardcoded "AK TRADING" details).

## Database Changes

**Add columns to `shops` table:**
- `address` (text, nullable) -- shop address
- `phone` (text, nullable) -- telephone number

**Update `handle_new_user_role` trigger** to accept shop name from signup metadata instead of auto-generating from email. The address and phone will be written to the shops table after signup.

## Frontend Changes

### 1. Auth page (`src/pages/Auth.tsx`)
- Add 3 new fields visible only in signup mode: **Shop Name**, **Address**, **Phone Number**
- Pass shop details as `user_metadata` in the `signUp` call via `options.data`
- Update validation schema

### 2. AuthContext (`src/contexts/AuthContext.tsx`)
- Update `signUp` to accept and pass metadata (shop name, address, phone)

### 3. Database trigger (`handle_new_user_role`)
- Read `NEW.raw_user_meta_data` to get shop name, address, phone
- Use provided shop name instead of `split_part(email, '@', 1) || '''s Shop'`
- Insert address and phone into the new shop columns

### 4. Receipt printing (`src/components/ReceiptPrintHandler.tsx`)
- Replace hardcoded "AK TRADING", phone, address with dynamic shop data
- Fetch shop details from context or pass them into the print handler
- Update all 3 print templates (mobile, desktop, ESC/POS) to use dynamic shop info

### 5. ShopContext updates
- Ensure shop address and phone are available in the shop context for receipt printing

## Execution Order
1. Migration: add `address` and `phone` columns to `shops`
2. Migration: update `handle_new_user_role` trigger to use metadata
3. Update Auth page with new signup fields
4. Update AuthContext to pass metadata
5. Update receipt printing to use dynamic shop details

