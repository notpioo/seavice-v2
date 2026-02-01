import { z } from "zod";

// User roles
export const userRoleSchema = z.enum(["user", "admin"]);
export type UserRole = z.infer<typeof userRoleSchema>;

// User schema
export const userSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().nullable().optional(),
  photoURL: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  points: z.number().default(0),
  role: userRoleSchema.default("user"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createUserSchema = userSchema.omit({ createdAt: true, updatedAt: true });

export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;

// Product schema
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  image: z.string(),
  category: z.string(),
  rating: z.string().optional().default("4.5"),
});

export const insertProductSchema = productSchema.omit({ id: true });

// Service schema
export const serviceSchema = z.object({
  id: z.number(),
  name: z.string(),
  icon: z.string(),
  slug: z.string(),
});

export const insertServiceSchema = serviceSchema.omit({ id: true });

// Types
export type Product = z.infer<typeof productSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;

// ============ PPOB Schemas ============

// PPOB Service types
export const ppobTypeSchema = z.enum(["pulsa", "kuota", "pln", "lainnya"]);
export type PPOBType = z.infer<typeof ppobTypeSchema>;

// Provider schema (Telkomsel, Indosat, XL, etc)
export const providerSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(), // e.g., "TELKOMSEL", "INDOSAT"
  image: z.string(),
  type: ppobTypeSchema,
  prefixes: z.array(z.string()).optional(), // Phone prefixes like "0811", "0812"
});

export type Provider = z.infer<typeof providerSchema>;

// PPOB Product schema (Pulsa 5K, 10K, Kuota 1GB, etc)
export const ppobProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(), // Harga jual
  basePrice: z.number(), // Harga modal (untuk admin)
  providerId: z.string(),
  type: ppobTypeSchema,
  category: z.string().optional(), // e.g., "reguler", "promo", "flash"
  isActive: z.boolean().default(true),
});

export type PPOBProduct = z.infer<typeof ppobProductSchema>;

// Transaction status
export const transactionStatusSchema = z.enum([
  "pending",
  "processing",
  "success",
  "failed",
  "refunded",
]);
export type TransactionStatus = z.infer<typeof transactionStatusSchema>;

// Transaction schema
export const transactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  productName: z.string(),
  providerId: z.string(),
  providerName: z.string(),
  type: ppobTypeSchema,
  target: z.string(), // Phone number, customer ID, etc
  price: z.number(),
  status: transactionStatusSchema,
  serialNumber: z.string().optional(), // SN for successful transactions
  // Payment fields (Midtrans)
  midtransOrderId: z.string().optional(),
  snapToken: z.string().optional(),
  paymentStatus: z.enum(["unpaid", "paid", "expired", "cancelled"]).default("unpaid"),
  paymentMethod: z.string().optional(),
  paidAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createTransactionSchema = transactionSchema.omit({
  id: true,
  status: true,
  serialNumber: true,
  createdAt: true,
  updatedAt: true,
});

export type Transaction = z.infer<typeof transactionSchema>;
export type CreateTransaction = z.infer<typeof createTransactionSchema>;
