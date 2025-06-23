
-- Create receipts table to store all purchase and sales transactions
CREATE TABLE public.receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'sales')),
  total_amount DECIMAL(10,2) NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create receipt_items table to store individual items in each receipt
CREATE TABLE public.receipt_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_id UUID REFERENCES public.receipts(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  qty DECIMAL(10,2) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (we'll make it open for now since no auth is implemented)
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since no authentication is implemented)
CREATE POLICY "Allow all operations on receipts" ON public.receipts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on receipt_items" ON public.receipt_items FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_receipts_type ON public.receipts(type);
CREATE INDEX idx_receipts_date ON public.receipts(date);
CREATE INDEX idx_receipt_items_receipt_id ON public.receipt_items(receipt_id);
CREATE INDEX idx_receipt_items_item_name ON public.receipt_items(item_name);
