import { z } from 'zod';

// Product validation schemas
export const productSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Product name is required" })
    .max(100, { message: "Product name must be less than 100 characters" }),
  current_stock: z.number()
    .min(0, { message: "Stock cannot be negative" })
    .max(999999, { message: "Stock value too large" }),
  price: z.number()
    .min(0, { message: "Price cannot be negative" })
    .max(999999, { message: "Price value too large" })
});

export const productUpdateSchema = productSchema.partial();

// Receipt item validation schema
export const receiptItemSchema = z.object({
  itemName: z.string()
    .trim()
    .min(1, { message: "Item name is required" })
    .max(100, { message: "Item name must be less than 100 characters" }),
  qty: z.number()
    .min(0.01, { message: "Quantity must be greater than 0" })
    .max(9999, { message: "Quantity too large" }),
  price: z.number()
    .min(0, { message: "Price cannot be negative" })
    .max(999999, { message: "Price value too large" }),
  total: z.number()
    .min(0, { message: "Total cannot be negative" })
});

// Receipt validation schema
export const receiptSchema = z.object({
  type: z.literal('purchase').or(z.literal('sales')),
  totalAmount: z.number()
    .min(0, { message: "Total amount cannot be negative" })
    .max(9999999, { message: "Total amount too large" }),
  items: z.array(receiptItemSchema)
    .min(1, { message: "At least one item is required" })
    .max(100, { message: "Too many items" })
});

// Auth validation schemas
export const emailSchema = z.string()
  .trim()
  .email({ message: "Invalid email address" })
  .max(255, { message: "Email must be less than 255 characters" });

export const passwordSchema = z.string()
  .min(6, { message: "Password must be at least 6 characters" })
  .max(128, { message: "Password must be less than 128 characters" });

export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

// Stock update validation
export const stockUpdateSchema = z.object({
  productName: z.string()
    .trim()
    .min(1, { message: "Product name is required" })
    .max(100, { message: "Product name must be less than 100 characters" }),
  quantityChange: z.number()
    .min(0.01, { message: "Quantity change must be greater than 0" })
    .max(9999, { message: "Quantity change too large" }),
  type: z.literal('purchase').or(z.literal('sales'))
});