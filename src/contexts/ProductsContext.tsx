
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { productService, Product } from '@/services/productService';
import { useShop } from './ShopContext';

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
  updateStock: (productName: string, quantityChange: number, type: 'purchase' | 'sales' | 'adjustment' | 'increase' | 'reduce') => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};

interface ProductsProviderProps {
  children: ReactNode;
}

export const ProductsProvider: React.FC<ProductsProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { shop } = useShop();

  const shopId = shop?.id;

  const refreshProducts = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedProducts = await productService.getAllProducts(shopId);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      const newProduct = await productService.createProduct(productData, shopId);
      setProducts(prev => [newProduct, ...prev]);
    } catch (error) {
      console.error('Failed to add product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) => {
    try {
      await productService.updateProduct(id, updates);
      setProducts(prev => prev.map(product => 
        product.id === id 
          ? { ...product, ...updates, updated_at: new Date().toISOString() }
          : product
      ));
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  };

  const updateStock = async (productName: string, quantityChange: number, type: 'purchase' | 'sales' | 'adjustment' | 'increase' | 'reduce') => {
    try {
      await productService.updateStock(productName, quantityChange, type, shopId);
      await refreshProducts();
    } catch (error) {
      console.error('Failed to update stock:', error);
      throw error;
    }
  };

  return (
    <ProductsContext.Provider value={{ 
      products, 
      loading, 
      addProduct, 
      updateProduct, 
      deleteProduct,
      refreshProducts,
      updateStock
    }}>
      {children}
    </ProductsContext.Provider>
  );
};
