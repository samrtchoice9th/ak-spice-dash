-- Add note column to receipts table to store adjustment reasons
ALTER TABLE public.receipts 
ADD COLUMN note text;

-- Add comment to document the receipt types
COMMENT ON COLUMN public.receipts.type IS 'Receipt type: purchase, sales, or adjustment';
COMMENT ON COLUMN public.receipts.note IS 'Optional note for adjustments (e.g., damaged goods, expired items, quality control rejection)';