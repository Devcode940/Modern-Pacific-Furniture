'use client'

import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Award,
  Shield,
  Truck,
  RotateCcw,
  BadgeCheck,
  Package,
  Headphones,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useStore, type CartItemType } from '@/store/use-store'
import { useAuthStore } from '@/store/auth-store'
import { toast } from 'sonner'
import { CouponInput } from '@/components/checkout/coupon-input'
import { MpesaPayment } from '@/components/checkout/mpesa-payment'
import { DeliveryEstimator } from '@/components/checkout/delivery-estimator'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Please enter your full address'),
  city: z.string().min(1, 'City is required'),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

const trustBadges = [
  { icon: Shield, label: 'Secure Payment', desc: 'SSL encrypted' },
  { icon: BadgeCheck, label: 'Verified Seller', desc: 'Trusted since 2020' },
  { icon: RotateCcw, label: '30-Day Returns', desc: 'Hassle-free' },
  { icon: Package, label: 'Free Assembly', desc: 'On all furniture' },
  { icon: Headphones, label: '24/7 Support', desc: 'WhatsApp & phone' },
  { icon: Truck, label: 'Nationwide Delivery', desc: 'All 47 counties' },
]

export function CheckoutForm() {
  const {
    cart, cartTotal, navigate, clearCart, coupon, sessionId, setLastOrderNumber,
    deliveryCost, paymentMethod, setPaymentMethod, setDeliveryInfo,
  } = useStore()
  const [submitting, setSubmitting] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  // Generate stable order number once on mount for M-Pesa reference
  const [mpesaOrderNumber] = useState(() => {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `MFP-${timestamp}-${random}`
  })

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  // Calculate discount — API already returns the absolute discount value
  const discountAmount = coupon.valid ? coupon.discount : 0
  const subtotalAfterDiscount = Math.max(cartTotal - discountAmount, 0)
  const finalTotal = subtotalAfterDiscount + deliveryCost
  const loyaltyPointsToEarn = Math.floor(finalTotal)

  // Pre-fill from profile
  const { user } = useAuthStore()
  useEffect(() => {
    if (user) {
      const nameParts = user.name.split(' ')
      if (nameParts[0] && !getValues('firstName')) setValue('firstName', nameParts[0])
      if (nameParts.length > 1 && !getValues('lastName')) setValue('lastName', nameParts.slice(1).join(' '))
      if (user.email && !getValues('email')) setValue('email', user.email)
      if (user.phone && !getValues('phone')) setValue('phone', user.phone)
    }
  }, [user, setValue, getValues])

  // Fix: navigate on orderPlaced via useEffect instead of during render
  useEffect(() => {
    if (orderPlaced) {
      const timer = setTimeout(() => navigate('checkout-success'), 500)
      return () => clearTimeout(timer)
    }
  }, [orderPlaced, navigate])

  const handleDeliveryChange = useCallback((cost: number, county: string, days: string) => {
    setDeliveryInfo(cost, county, days)
  }, [setDeliveryInfo])

  const handlePaymentSuccess = () => {
    // M-Pesa payment was successful, validate and submit form
    handleSubmit(async (data) => {
      await submitOrder(data)
    })()
  }

  const submitOrder = async (data: CheckoutFormData) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
        body: JSON.stringify({
          ...data,
          couponCode: coupon.valid ? coupon.code : undefined,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        if (result.details) {
          result.details.forEach((err: { message: string }) => {
            toast.error(err.message)
          })
        } else {
          toast.error(result.error || 'Checkout failed')
        }
        return
      }

      clearCart()
      setLastOrderNumber(result.order?.orderNumber || null)
      setOrderPlaced(true)
      toast.success('Order placed successfully!')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const onSubmit = async (data: CheckoutFormData) => {
    await submitOrder(data)
  }

  if (orderPlaced) {
    return null
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Your cart is empty</p>
        <Button onClick={() => navigate('shop')} className="mt-4 bg-amber-700 hover:bg-amber-800">
          Continue Shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('cart')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Cart
      </Button>

      <h1 className="mb-8 text-2xl font-bold tracking-tight md:text-3xl">
        Checkout
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Shipping Information</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" id="checkout-form">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-500">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+254 7XX XXX XXX"
                  {...register('phone')}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  placeholder="123 Kenyatta Ave, House 4B"
                  {...register('address')}
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && (
                  <p className="text-xs text-red-500">{errors.address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City / Town *</Label>
                <Input
                  id="city"
                  placeholder="Nairobi"
                  {...register('city')}
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-xs text-red-500">{errors.city.message}</p>
                )}
              </div>
            </form>
          </div>

          {/* Delivery Estimator */}
          <div className="rounded-xl border bg-card p-6">
            <DeliveryEstimator subtotal={cartTotal} onDeliveryChange={handleDeliveryChange} />
          </div>

          {/* Payment Method */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Payment Method</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('mpesa')}
                className={cn(
                  'flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                  paymentMethod === 'mpesa'
                    ? 'border-emerald-600 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/20'
                    : 'border-transparent bg-muted/50 hover:border-muted-foreground/20'
                )}
              >
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  paymentMethod === 'mpesa' ? 'bg-emerald-600' : 'bg-muted'
                )}>
                  <span className={cn(
                    'text-sm font-bold',
                    paymentMethod === 'mpesa' ? 'text-white' : 'text-muted-foreground'
                  )}>M</span>
                </div>
                <div>
                  <p className={cn('text-sm font-semibold', paymentMethod === 'mpesa' ? 'text-emerald-800 dark:text-emerald-300' : '')}>M-Pesa</p>
                  <p className="text-xs text-muted-foreground">Lipa na M-Pesa</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={cn(
                  'flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                  paymentMethod === 'cod'
                    ? 'border-amber-700 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/20'
                    : 'border-transparent bg-muted/50 hover:border-muted-foreground/20'
                )}
              >
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  paymentMethod === 'cod' ? 'bg-amber-700' : 'bg-muted'
                )}>
                  <CreditCard className={cn('h-5 w-5', paymentMethod === 'cod' ? 'text-white' : 'text-muted-foreground')} />
                </div>
                <div>
                  <p className={cn('text-sm font-semibold', paymentMethod === 'cod' ? 'text-amber-800 dark:text-amber-300' : '')}>Cash on Delivery</p>
                  <p className="text-xs text-muted-foreground">Pay when delivered</p>
                </div>
              </button>
            </div>

            {/* M-Pesa Payment Section */}
            {paymentMethod === 'mpesa' && (
              <div className="mt-6">
                <MpesaPayment
                  amount={finalTotal}
                  orderNumber={mpesaOrderNumber}
                  onPaymentSuccess={handlePaymentSuccess}
                  disabled={submitting}
                />
              </div>
            )}
          </div>

          {/* Trust Badges */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Shop with Confidence</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <badge.icon className="h-5 w-5 text-amber-700 dark:text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{badge.label}</p>
                    <p className="text-[10px] text-muted-foreground">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Place Order Button (for COD) */}
          {paymentMethod === 'cod' && (
            <Button
              type="submit"
              form="checkout-form"
              className="w-full bg-amber-700 text-base hover:bg-amber-800"
              size="lg"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Place Order — {formatCurrency(finalTotal)}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="sticky top-20 rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>

            <div className="space-y-3">
              {cart.map((item) => {
                const images: string[] = (() => { try { return JSON.parse(item.product.images) } catch { return [] } })()
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {images[0] ? (
                        <img
                          src={images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground/30">🪑</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold shrink-0">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Coupon Input */}
            <div className="mt-4">
              <CouponInput />
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              {coupon.valid && discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Discount ({coupon.code})
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className={deliveryCost === 0 ? 'text-emerald-600 font-medium' : ''}>
                  {deliveryCost === 0 ? 'FREE' : formatCurrency(deliveryCost)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-amber-700 dark:text-amber-500">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>

            {/* Loyalty Points */}
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                  <Award className="h-4 w-4 text-amber-700 dark:text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                    Earn {loyaltyPointsToEarn.toLocaleString()} loyalty points
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    1 point per KSh 100 spent on this order
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
