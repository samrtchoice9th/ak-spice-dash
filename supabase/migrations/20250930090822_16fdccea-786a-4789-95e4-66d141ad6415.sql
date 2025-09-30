-- Update existing data to have user_id for the first authenticated user
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get the first user ID from auth.users if any exists
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Update existing receipts without user_id
        UPDATE public.receipts 
        SET user_id = first_user_id 
        WHERE user_id IS NULL;
        
        -- Update existing products without user_id
        UPDATE public.products 
        SET user_id = first_user_id 
        WHERE user_id IS NULL;
    END IF;
END $$;