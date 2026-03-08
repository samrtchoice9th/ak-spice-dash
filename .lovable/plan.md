

# Fix: Super Admin Panel Header and Navigation

## Problem
The super admin has no shop membership, so `shop` is `null`. Both the DesktopSidebar and TopNavigation fall back to showing "Ak Spice" as the header, making it look like the super admin is inside the Ak Spice shop.

## Changes

### 1. DesktopSidebar (`src/components/DesktopSidebar.tsx`)
- Change the fallback from `'Ak Spice'` to `'Admin Panel'`
- Or better: accept a flag/check if super admin and show appropriate title

### 2. TopNavigation (`src/components/TopNavigation.tsx`)
- Same fix: change fallback from `'Ak Spice'` to `'Admin Panel'`
- For super admin, show "Super Admin Panel" instead of shop name

### 3. Approach
- Pass `isSuperAdmin` context into both navigation components
- If super admin: show "Super Admin Panel" as header
- If regular user: show `shop?.name || 'My Shop'` (remove hardcoded "Ak Spice")

