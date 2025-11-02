-- Add reason column to receipt_items table
ALTER TABLE receipt_items 
ADD COLUMN IF NOT EXISTS reason TEXT;