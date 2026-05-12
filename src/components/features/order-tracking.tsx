'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  MapPin,
  CreditCard,
  Box,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type StepStatus = 'completed' | 'current' | 'pending'

interface TimelineStep {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  status: StepStatus
  date?: string
}

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  image: string
}

interface OrderData {
  orderNumber: string
  date: string
  status: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  shippingAddress: string
  paymentMethod: string
  estimatedDelivery: string
  currentStep: number
}

/* ------------------------------------------------------------------ */
/*  Sample order data (used for demo)                                  */
/* ------------------------------------------------------------------ */

const SAMPLE_ORDER: OrderData = {
  orderNumber: 'MFP-247891',
  date: '2025-06-10',
  status: 'In Quality Check',
  items: [
    {
      id: 'item-1',
      name: 'Modena Sofa Set (7-Seater)',
      quantity: 1,
      price: 185000,
      image: '/images/products/modena-sofa.png',
    },
    {
      id: 'item-2',
      name: 'Coffee Table Walnut',
      quantity: 1,
      price: 35000,
      image: '/images/products/coffee-table-walnut.png',
    },
  ],
  subtotal: 220000,
  shipping: 0,
  total: 220000,
  shippingAddress: '42 Karen Gardens, Karen, Nairobi 00502, Kenya',
  paymentMethod: 'M-Pesa',
  estimatedDelivery: '2025-06-18',
  currentStep: 2, // 0-indexed: Quality Check (3rd step)
}

/* ------------------------------------------------------------------ */
/*  Timeline step definitions                                          */
/* ------------------------------------------------------------------ */

const TIMELINE_STEPS_CONFIG = [
  {
    id: 'placed',
    label: 'Order Placed',
    description: 'Your order has been confirmed',
    icon: <Package className="h-4 w-4" />,
  },
  {
    id: 'processing',
    label: 'Processing',
    description: 'Preparing your furniture',
    icon: <Box className="h-4 w-4" />,
  },
  {
    id: 'quality-check',
    label: 'Quality Check',
    description: 'Inspecting for quality assurance',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  {
    id: 'shipped',
    label: 'Shipped',
    description: 'On the way to your location',
    icon: <Truck className="h-4 w-4" />,
  },
  {
    id: 'delivered',
    label: 'Delivered',
    description: 'Successfully delivered',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
]

const STEP_DATES = [
  'Jun 10, 2025 — 2:34 PM',
  'Jun 11, 2025 — 9:15 AM',
  'Jun 12, 2025 — 11:42 AM',
  undefined,
  undefined,
]

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
}

const containerStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

/* ------------------------------------------------------------------ */
/*  Helper: format currency                                            */
/* ------------------------------------------------------------------ */

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/* ------------------------------------------------------------------ */
/*  Status badge helper                                                */
/* ------------------------------------------------------------------ */

function getStatusBadge(status: string) {
  if (status.includes('Quality')) {
    return (
      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-200 dark:border-amber-700 gap-1">
        <Clock className="h-3 w-3 animate-pulse" />
        {status}
      </Badge>
    )
  }
  if (status.includes('Delivered')) {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 gap-1">
        <CheckCircle2 className="h-3 w-3" />
        {status}
      </Badge>
    )
  }
  if (status.includes('Shipped')) {
    return (
      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border-blue-200 dark:border-blue-700 gap-1">
        <Truck className="h-3 w-3" />
        {status}
      </Badge>
    )
  }
  return (
    <Badge className="bg-muted text-muted-foreground border-border gap-1">
      <Package className="h-3 w-3" />
      {status}
    </Badge>
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function OrderTracking() {
  const [searchInput, setSearchInput] = useState('')
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  /* Build timeline from order */
  const buildTimeline = useCallback(
    (order: OrderData): TimelineStep[] => {
      return TIMELINE_STEPS_CONFIG.map((step, idx) => ({
        ...step,
        status:
          idx < order.currentStep
            ? ('completed' as const)
            : idx === order.currentStep
              ? ('current' as const)
              : ('pending' as const),
        date: STEP_DATES[idx],
      }))
    },
    [],
  )

  /* Handle search */
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setSearched(true)

      // Simulate API call with setTimeout
      setTimeout(() => {
        // If a valid-looking order number or empty, show sample order
        if (
          !searchInput.trim() ||
          !searchInput.trim().toUpperCase().startsWith('MFP-')
        ) {
          // Show sample order for demo
          setOrderData(SAMPLE_ORDER)
        } else {
          // Simulate: treat any MFP-XXXXXX as found
          setOrderData({
            ...SAMPLE_ORDER,
            orderNumber: searchInput.trim().toUpperCase(),
          })
        }
        setLoading(false)
      }, 1500)
    },
    [searchInput],
  )

  /* Load sample on mount for demo */
  useEffect(() => {
    const timer = setTimeout(() => {
      setOrderData(SAMPLE_ORDER)
      setSearchInput(SAMPLE_ORDER.orderNumber)
      setSearched(true)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const timeline = orderData ? buildTimeline(orderData) : []

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */

  return (
    <section className="space-y-6" aria-label="Order Tracking">
      {/* ─── Page Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
          <Truck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Track Your Order</h2>
          <p className="text-sm text-muted-foreground">
            Enter your order number to see real-time status updates
          </p>
        </div>
      </motion.div>

      {/* ─── Search Form ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Enter order number (e.g., MFP-247891)"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-10 pl-9"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Tracking...
                  </span>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Track Order
                  </>
                )}
              </Button>
            </form>
            {!searched && (
              <p className="mt-2 text-xs text-muted-foreground">
                For demo purposes, a sample order will appear automatically.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Loading State ─── */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
                <div className="relative">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600 dark:border-emerald-800 dark:border-t-emerald-400" />
                  <Truck className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Looking up your order...
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Order Details ─── */}
        {!loading && orderData && (
          <motion.div
            key="results"
            initial="hidden"
            animate="visible"
            variants={containerStagger}
            className="space-y-6"
          >
            {/* ─── Order Summary Bar ─── */}
            <motion.div custom={0} variants={fadeInUp}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                        <Package className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          Order{' '}
                          <span className="font-mono text-emerald-700 dark:text-emerald-400">
                            {orderData.orderNumber}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Placed on {formatDate(orderData.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(orderData.status)}
                      <Badge variant="outline" className="text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        Est. {formatDate(orderData.estimatedDelivery)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ─── Timeline + Details Grid ─── */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* ─── Visual Timeline (2 cols) ─── */}
              <motion.div custom={1} variants={fadeInUp} className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <CardTitle className="text-lg">Order Timeline</CardTitle>
                    </div>
                    <CardDescription>
                      Real-time tracking of your order status
                    </CardDescription>
                  </CardHeader>
                  <Separator />
                  <CardContent className="p-6">
                    <div className="relative">
                      {/* Vertical line */}
                      <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />

                      {/* Completed portion overlay */}
                      {orderData.currentStep > 0 && (
                        <motion.div
                          className="absolute left-[18px] top-2 w-0.5 bg-emerald-500 dark:bg-emerald-400"
                          initial={{ height: 0 }}
                          animate={{
                            height: `${(orderData.currentStep / (TIMELINE_STEPS_CONFIG.length - 1)) * 100}%`,
                          }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                          style={{
                            maxHeight: 'calc(100% - 16px)',
                          }}
                        />
                      )}

                      <div className="space-y-0">
                        {timeline.map((step, idx) => {
                          const isCompleted = step.status === 'completed'
                          const isCurrent = step.status === 'current'

                          return (
                            <motion.div
                              key={step.id}
                              custom={idx}
                              variants={fadeInUp}
                              initial="hidden"
                              animate="visible"
                              className="relative flex gap-4 pb-8 last:pb-0"
                            >
                              {/* Step circle */}
                              <div className="relative z-10 flex shrink-0">
                                <div
                                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
                                    isCompleted
                                      ? 'border-emerald-500 bg-emerald-500 text-white dark:border-emerald-400 dark:bg-emerald-400'
                                      : isCurrent
                                        ? 'border-amber-400 bg-amber-50 text-amber-600 dark:border-amber-500 dark:bg-amber-900/40 dark:text-amber-400'
                                        : 'border-gray-300 bg-gray-100 text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500'
                                  }`}
                                >
                                  {isCurrent && (
                                    <span className="absolute -inset-1 animate-ping rounded-full bg-amber-400/30 dark:bg-amber-500/20" />
                                  )}
                                  {step.icon}
                                </div>
                              </div>

                              {/* Step content */}
                              <div className="min-w-0 flex-1 pt-0.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4
                                    className={`text-sm font-semibold ${
                                      isCompleted
                                        ? 'text-emerald-700 dark:text-emerald-400'
                                        : isCurrent
                                          ? 'text-amber-700 dark:text-amber-400'
                                          : 'text-muted-foreground'
                                    }`}
                                  >
                                    {step.label}
                                  </h4>
                                  {isCompleted && (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                  )}
                                  {isCurrent && (
                                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 border-amber-200 dark:border-amber-700 text-[10px] px-1.5 py-0 gap-1">
                                      <Clock className="h-2.5 w-2.5 animate-pulse" />
                                      In Progress
                                    </Badge>
                                  )}
                                </div>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {step.description}
                                </p>
                                {step.date && (
                                  <p className="mt-1 text-[11px] text-muted-foreground/70">
                                    {step.date}
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ─── Order Details Sidebar (1 col) ─── */}
              <motion.div custom={2} variants={fadeInUp} className="space-y-6">
                {/* Items */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Box className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <CardTitle className="text-lg">Order Items</CardTitle>
                    </div>
                    <CardDescription>
                      {orderData.items.length} item
                      {orderData.items.length !== 1 ? 's' : ''} in this order
                    </CardDescription>
                  </CardHeader>
                  <Separator />
                  <CardContent className="p-4 space-y-3">
                    {orderData.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg bg-muted/40 p-2.5"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/30">
                          <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-tight truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-semibold shrink-0">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    ))}

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{formatCurrency(orderData.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Shipping</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {orderData.shipping === 0 ? 'FREE' : formatCurrency(orderData.shipping)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-emerald-700 dark:text-emerald-400">
                          {formatCurrency(orderData.total)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping & Payment */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <CardTitle className="text-lg">Delivery Info</CardTitle>
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="p-4 space-y-4">
                    {/* Shipping address */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Shipping Address
                      </p>
                      <p className="text-sm leading-relaxed">
                        {orderData.shippingAddress}
                      </p>
                    </div>

                    <Separator />

                    {/* Payment method */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Payment Method
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-900/40">
                          <CreditCard className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                        </div>
                        <span className="text-sm font-medium">
                          {orderData.paymentMethod}
                        </span>
                        <Badge
                          variant="outline"
                          className="ml-auto bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700 text-[10px]"
                        >
                          <CheckCircle2 className="mr-1 h-2.5 w-2.5" />
                          Paid
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Not Found State ─── */}
      {searched && !loading && !orderData && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Package className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">Order Not Found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  We couldn&apos;t find an order with that number. Please check
                  and try again.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOrderData(SAMPLE_ORDER)
                  setSearchInput(SAMPLE_ORDER.orderNumber)
                }}
                className="text-amber-700 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950/30"
              >
                View Sample Order
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </section>
  )
}
