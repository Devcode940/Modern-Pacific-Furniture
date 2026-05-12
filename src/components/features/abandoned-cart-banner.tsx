'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, ShoppingCart, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/use-store'
import { formatCurrency } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const ABANDONED_KEY = 'mfp_cart_abandoned'
const ABANDON_THRESHOLD_MS = 30 * 60 * 1000 // 30 minutes

interface AbandonedCartData {
  items: Array<{
    productId: string
    quantity: number
    product: {
      name: string
      price: number
      images: string
    }
  }>
  count: number
  total: number
  timestamp: number
}

function readAbandonedData(): AbandonedCartData | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(ABANDONED_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function AbandonedCartBanner() {
  const { cart, cartCount, cartTotal, setCartOpen } = useStore()
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [abandonedData, setAbandonedData] = useState<AbandonedCartData | null>(null)
  const checkedRef = useRef(false)

  // Save cart state to localStorage when items exist (for abandonment tracking)
  const saveCartForRecovery = useCallback(() => {
    if (cartCount > 0) {
      const data: AbandonedCartData = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          product: {
            name: item.product.name,
            price: item.product.price,
            images: item.product.images,
          },
        })),
        count: cartCount,
        total: cartTotal,
        timestamp: Date.now(),
      }
      localStorage.setItem(ABANDONED_KEY, JSON.stringify(data))
    } else {
      localStorage.removeItem(ABANDONED_KEY)
    }
  }, [cart, cartCount, cartTotal])

  // Track cart for abandonment on page unload / visibility change
  useEffect(() => {
    saveCartForRecovery()
  }, [saveCartForRecovery])

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (cartCount > 0) {
        saveCartForRecovery()
        // Also fire-and-forget POST to API
        if (navigator.sendBeacon) {
          try {
            navigator.sendBeacon(
              '/api/abandoned-cart',
              JSON.stringify({
                sessionId: localStorage.getItem('mfp_session') || '',
                itemCount: cartCount,
                total: cartTotal,
              })
            )
          } catch {
            // ignore
          }
        }
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && cartCount > 0) {
        saveCartForRecovery()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [cartCount, cartTotal, saveCartForRecovery])

  // Check for abandoned cart on mount (using ref to prevent re-checking)
  useEffect(() => {
    if (checkedRef.current) return
    checkedRef.current = true

    if (dismissed || cartCount > 0) return

    const data = readAbandonedData()
    if (!data) return

    const elapsed = Date.now() - data.timestamp
    if (elapsed >= ABANDON_THRESHOLD_MS) {
      queueMicrotask(() => {
        setAbandonedData(data)
        setVisible(true)
      })
    }
  }, [cartCount, dismissed])

  const handleDismiss = () => {
    setVisible(false)
    setDismissed(true)
    localStorage.removeItem(ABANDONED_KEY)
  }

  const handleResume = () => {
    setVisible(false)
    setDismissed(true)
    localStorage.removeItem(ABANDONED_KEY)
    setCartOpen(true)
  }

  return (
    <AnimatePresence>
      {visible && abandonedData && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-x-0 top-0 z-[100]"
        >
          <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 dark:from-amber-900 dark:via-amber-800 dark:to-amber-900">
            <div className="container mx-auto flex items-center justify-between px-4 py-3">
              <div className="flex flex-1 items-center gap-3 pr-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <ShoppingCart className="h-4.5 w-4.5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    You left items in your cart!
                  </p>
                  <p className="text-xs text-amber-100/80 truncate">
                    {abandonedData.count} item{abandonedData.count !== 1 ? 's' : ''} totaling{' '}
                    {formatCurrency(abandonedData.total)}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {/* Discount code hint */}
                <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
                  <Tag className="h-3.5 w-3.5 text-amber-200" />
                  <span className="text-xs font-medium text-white">
                    5% off with <span className="font-bold">COMEBACK5</span>
                  </span>
                </div>

                <Button
                  size="sm"
                  className="h-8 bg-white text-amber-700 hover:bg-amber-50 text-xs font-semibold px-4"
                  onClick={handleResume}
                >
                  Resume Shopping
                </Button>

                <button
                  onClick={handleDismiss}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-amber-200 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mobile discount code hint */}
            <div className="sm:hidden border-t border-white/10 px-4 py-2">
              <div className="flex items-center gap-1.5">
                <Tag className="h-3 w-3 text-amber-200" />
                <span className="text-[11px] text-amber-100/90">
                  Complete your order and get <span className="font-bold text-white">5% off</span> with code{' '}
                  <span className="font-mono font-bold text-white">COMEBACK5</span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
