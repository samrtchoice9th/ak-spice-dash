-- CRITICAL SECURITY FIX: Replace public RLS policies with authentication-based access control

-- Drop existing dangerous public policies
DROP POLICY IF EXISTS "Allow all operations on receipts" ON public.receipts;
DROP POLICY IF EXISTS "Allow all operations on products" ON public.products;
DROP POLICY IF EXISTS "Allow all operations on receipt_items" ON public.receipt_items;

-- Add user_id column to track ownership (assuming single-user or user-specific data)
-- Skip if you want system-wide admin access instead
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create secure RLS policies for receipts
CREATE POLICY "Users can view their own receipts" 
ON public.receipts 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own receipts" 
ON public.receipts 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receipts" 
ON public.receipts 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receipts" 
ON public.receipts 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Create secure RLS policies for products
CREATE POLICY "Users can view their own products" 
ON public.products 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own products" 
ON public.products 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" 
ON public.products 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" 
ON public.products 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Create secure RLS policies for receipt_items (linked to user through receipt)
CREATE POLICY "Users can view receipt items for their receipts" 
ON public.receipt_items 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.receipts 
    WHERE receipts.id = receipt_items.receipt_id 
    AND receipts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create receipt items for their receipts" 
ON public.receipt_items 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.receipts 
    WHERE receipts.id = receipt_items.receipt_id 
    AND receipts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update receipt items for their receipts" 
ON public.receipt_items 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.receipts 
    WHERE receipts.id = receipt_items.receipt_id 
    AND receipts.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.receipts 
    WHERE receipts.id = receipt_items.receipt_id 
    AND receipts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete receipt items for their receipts" 
ON public.receipt_items 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.receipts 
    WHERE receipts.id = receipt_items.receipt_id 
    AND receipts.user_id = auth.uid()
  )
);

-- Update existing data to set user_id for current records (if any exist)
-- This assumes a single user system - adjust as needed
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get the first user ID from auth.users if any exists
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Update existing receipts and products with this user_id
        UPDATE public.receipts SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE public.products SET user_id = first_user_id WHERE user_id IS NULL;
    END IF;
END $$;