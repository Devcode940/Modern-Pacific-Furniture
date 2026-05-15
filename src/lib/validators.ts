import { z } from 'zod'

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// Register validation schema
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
})

// Product validation schema
export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().optional().nullable(),
  categoryId: z.string().cuid('Invalid category ID'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  images: z.string(), // JSON string of image URLs
  specs: z.string().optional(), // JSON string of specifications
  tags: z.string().optional(), // JSON string of tags
  material: z.string().optional(),
  style: z.string().optional(),
  colors: z.string().optional(), // JSON string of color array
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  featured: z.boolean().default(false),
})

// Order validation schema
export const orderSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  items: z.array(z.object({
    productId: z.string().cuid(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    name: z.string(),
  })),
  couponCode: z.string().optional(),
  pointsUsed: z.number().int().nonnegative().default(0),
})

// Review validation schema
export const reviewSchema = z.object({
  productId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, 'Review must be at least 10 characters').optional(),
  photos: z.string().optional(), // JSON string of photo URLs
})

// Cart item validation schema
export const cartItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).max(999),
})

// Address validation schema
export const addressSchema = z.object({
  label: z.string().optional().default('Home'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  county: z.string().min(2, 'County is required'),
  isDefault: z.boolean().default(false),
})

// Newsletter subscription schema
export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Coupon validation schema
export const couponSchema = z.object({
  code: z.string().min(3, 'Coupon code must be at least 3 characters'),
  type: z.enum(['percentage', 'fixed']).default('percentage'),
  value: z.number().positive(),
  minOrder: z.number().nonnegative().default(0),
  maxDiscount: z.number().positive().optional().nullable(),
  usesLimit: z.number().int().positive().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  active: z.boolean().default(true),
})

// Waitlist entry schema
export const waitlistSchema = z.object({
  productId: z.string().cuid(),
  email: z.string().email('Invalid email address'),
})

// Referral schema
export const referralSchema = z.object({
  referrerEmail: z.string().email('Invalid email address'),
  refereeEmail: z.string().email('Invalid email address'),
})

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Export type inference helpers
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProductInput = z.infer<typeof productSchema>
export type OrderInput = z.infer<typeof orderSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type CartItemInput = z.infer<typeof cartItemSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type NewsletterInput = z.infer<typeof newsletterSchema>
export type CouponInput = z.infer<typeof couponSchema>
export type WaitlistInput = z.infer<typeof waitlistSchema>
export type ReferralInput = z.infer<typeof referralSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
