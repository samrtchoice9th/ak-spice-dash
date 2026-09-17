# Accounts Menu and Day Book

## Overview
Add an **Accounts** navigation group containing **Customers**, **Suppliers**, and **Day Book**. Build a date-based Day Book for fast keyboard entry, with receipt totals automatically shown and additional account transactions saved for future use.

## Navigation
- Replace the separate Customers and Suppliers menu links with one expandable **Accounts** group.
- Add Customers, Suppliers, and Day Book as its child links.
- Keep Accounts expanded whenever one of its child pages is active.
- Support the same hierarchy in the desktop sidebar and mobile navigation, with active-page highlighting and accessible expand/collapse controls.
- Keep existing role access: Accounts and all three child pages require Admin or Super Admin access.

## Day Book
- Add a `/day-book` page with the date selector at the top, defaulting to today in Sri Lanka time.
- Reserve the first two rows for **Total Sales** and **Total Purchase**.
  - Total Sales is read-only and shown as a Credit.
  - Total Purchase is read-only and shown as a Debit.
  - Both come directly from saved receipts for the selected date, so the Report page remains accurate without duplicate values.
- Show additional editable rows with **Account**, **Description**, **Debit**, and **Credit** fields.
- Start with several blank rows and add another blank row automatically as the user reaches the last row.
- Let Account select an existing saved account or choose **Add New Account** without leaving the page.
- Save manual rows in their entered order for the selected date.
- Enforce one-sided entry: entering Debit clears Credit, and entering Credit clears Debit.
- Format displayed totals and saved amounts as Sri Lankan rupees, such as `Rs. 10,000.00`.
- Provide clear loading, empty, saving, saved, and validation states using the existing notification style.

## Keyboard and Mobile Use
- Pressing Enter advances through Account → Description → Debit → Credit → next row.
- Maintain minimum 44px touch targets.
- Use a standard table on larger screens and stacked transaction rows on small screens, without horizontal overflow.

## Data and Security
- Create an `accounts` table for reusable account names within the single shop.
- Create a `day_book_entries` table for date, account, description, debit, credit, and entry order.
- Grant authenticated access explicitly, enable row-level security, and restrict every operation to the signed-in user's shop (with existing Super Admin access).
- Add validation ensuring amounts are non-negative and exactly one of Debit or Credit is set for saved manual entries.
- Add indexes for fast selected-date loading and stable entry ordering.

## Report Integration
- Keep Sales and Purchase report calculations sourced from receipts, as they are now.
- The Day Book's first two rows reflect those same totals rather than inserting duplicate transactions.
- Manual Day Book entries remain separate accounting entries and do not alter inventory or receipt Sales/Purchase totals.

## Verification
- Verify Admin and Super Admin navigation on desktop and mobile.
- Verify account creation, date switching, entry ordering, Debit/Credit exclusivity, Enter-key movement, save/reload persistence, currency formatting, and responsive layout.
- Verify Day Book Sales/Purchase values match the Report totals for the same date.
