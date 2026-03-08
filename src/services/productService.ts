
import { supabase } from '@/integrations/supabase/client';
import { productSchema, productUpdateSchema, stockUpdateSchema } from '@/lib/validations';

export interface Product {
  id: string;
  name: string;
  current_stock: number;
  price: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  shop_id?: string;
}

export const productService = {
  async getAllProducts(shopId?: string): Promise<Product[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase.from('products').select('*').order('name');

    if (shopId) {
      query = query.eq('shop_id', shopId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    return data || [];
  },

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'shop_id'>, shopId?: string): Promise<Product> {
    const validatedData = productSchema.parse(product);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User must be authenticated to create products');

    // Use provided shopId or fall back to user's shop membership
    let resolvedShopId = shopId;
    if (!resolvedShopId) {
      const { data } = await supabase
        .from('shop_members')
        .select('shop_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();
      if (!data) throw new Error('User not assigned to a shop');
      resolvedShopId = data.shop_id;
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: validatedData.name,
        current_stock: validatedData.current_stock,
        price: validatedData.price,
        user_id: user.id,
        shop_id: resolvedShopId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }

    return data;
  },

  async updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<void> {
    const validatedData = productUpdateSchema.parse(updates);
    
    const { error } = await supabase
      .from('products')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  async updateStock(productName: string, quantityChange: number, type: 'purchase' | 'sales' | 'adjustment' | 'increase' | 'reduce', shopId?: string): Promise<void> {
    const validatedData = stockUpdateSchema.parse({ productName, quantityChange, type });
    
    let query = supabase.from('products').select('*').eq('name', validatedData.productName);
    if (shopId) query = query.eq('shop_id', shopId);
    
    const { data: product, error: fetchError } = await query.maybeSingle();

    if (fetchError) {
      console.error('Error fetching product for stock update:', fetchError);
      throw fetchError;
    }

    if (!product) {
      let initialStock = 0;
      if (validatedData.type === 'purchase' || validatedData.type === 'increase') {
        initialStock = Math.abs(validatedData.quantityChange);
      } else if (validatedData.type === 'adjustment' && validatedData.quantityChange > 0) {
        initialStock = validatedData.quantityChange;
      }
      
      await this.createProduct({
        name: validatedData.productName,
        current_stock: initialStock,
        price: 0
      }, shopId);
    } else {
      let newStock = product.current_stock;
      
      if (validatedData.type === 'purchase' || validatedData.type === 'increase') {
        newStock += Math.abs(validatedData.quantityChange);
      } else if (validatedData.type === 'sales' || validatedData.type === 'reduce') {
        newStock -= Math.abs(validatedData.quantityChange);
      }

      await this.updateProduct(product.id, {
        current_stock: Math.max(0, newStock)
      });
    }
  }
};
