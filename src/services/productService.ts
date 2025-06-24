
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  current_stock: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    return data || [];
  },

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        current_stock: product.current_stock,
        price: product.price
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }

    return data;
  },

  async updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  async updateStock(productName: string, quantityChange: number, type: 'purchase' | 'sales'): Promise<void> {
    // Get current product
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('name', productName)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching product for stock update:', fetchError);
      throw fetchError;
    }

    if (!product) {
      // Create new product if it doesn't exist
      await this.createProduct({
        name: productName,
        current_stock: type === 'purchase' ? quantityChange : -quantityChange,
        price: 0 // Will be updated when price information is available
      });
    } else {
      // Update existing product stock
      const newStock = type === 'purchase' 
        ? product.current_stock + quantityChange
        : product.current_stock - quantityChange;

      await this.updateProduct(product.id, {
        current_stock: Math.max(0, newStock) // Prevent negative stock
      });
    }
  }
};
