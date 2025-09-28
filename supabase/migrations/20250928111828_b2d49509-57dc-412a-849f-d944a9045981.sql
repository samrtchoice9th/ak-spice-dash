-- CRITICAL SECURITY FIX: Replace public RLS policies with authentication-based access control

-- Drop existing policies (handle if they exist)
DROP POLICY IF EXISTS "Allow all operations on receipts" ON public.receipts;
DROP POLICY IF EXISTS "Allow all operations on products" ON public.products; 
DROP POLICY IF EXISTS "Allow all operations on receipt_items" ON public.receipt_items;
DROP POLICY IF EXISTS "Users can view their own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can create their own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can update their own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can view their own products" ON public.products;
DROP POLICY IF EXISTS "Users can create their own products" ON public.products;
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;
DROP POLICY IF EXISTS "Users can view receipt items for their receipts" ON public.receipt_items;
DROP POLICY IF EXISTS "Users can create receipt items for their receipts" ON public.receipt_items;
DROP POLICY IF EXISTS "Users can update receipt items for their receipts" ON public.receipt_items;
DROP POLICY IF EXISTS "Users can delete receipt items for their receipts" ON public.receipt_items;

-- Add user_id column to track ownership
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create secure RLS policies for receipts
CREATE POLICY "authenticated_users_receipts_select" 
ON public.receipts 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "authenticated_users_receipts_insert" 
ON public.receipts 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_users_receipts_update" 
ON public.receipts 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_users_receipts_delete" 
ON public.receipts 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Create secure RLS policies for products
CREATE POLICY "authenticated_users_products_select" 
ON public.products 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "authenticated_users_products_insert" 
ON public.products 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_users_products_update" 
ON public.products 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_users_products_delete" 
ON public.products 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Create secure RLS policies for receipt_items
CREATE POLICY "authenticated_users_receipt_items_select" 
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

CREATE POLICY "authenticated_users_receipt_items_insert" 
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

CREATE POLICY "authenticated_users_receipt_items_update" 
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

CREATE POLICY "authenticated_users_receipt_items_delete" 
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