'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart } from 'lucide-react'
import { useStore } from '@/store/use-store'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SocialProofNotification {
  id: string
  buyerName: string
  city: string
  productName: string
  productImage: string
  minutesAgo: number
}

// ---------------------------------------------------------------------------
// Notification pool
// ---------------------------------------------------------------------------

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  'Modena Sofa Set': '/images/products/modena-sofa.png',
  'King Mahogany Bed': '/images/products/king-mahogany-bed.png',
  'Coffee Table Walnut': '/images/products/coffee-table-walnut.png',
  'Dining Set 6-Seater': '/images/products/dining-set-6seater.png',
  'Cuddle Recliner Sofa': '/images/products/cuddle-recliner-sofa.png',
  'TV Stand Walnut': '/images/products/tv-stand-walnut.png',
  'Copenhagen Corduroy Sofa': '/images/products/copenhagen-corduroy-sofa.png',
  'Nightstand Walnut': '/images/products/nightstand-walnut.png',
  'Pocket Spring Mattress': '/images/products/pocket-spring-mattress.png',
  'Benin Sofa': '/images/products/benin-sofa.png',
}

interface RawNotification {
  buyerName: string
  city: string
  productName: string
}

const NOTIFICATION_POOL: RawNotification[] = [
  { buyerName: 'John', city: 'Nairobi', productName: 'Modena Sofa Set' },
  { buyerName: 'Mary', city: 'Mombasa', productName: 'King Mahogany Bed' },
  { buyerName: 'Peter', city: 'Kisumu', productName: 'Coffee Table Walnut' },
  { buyerName: 'Grace', city: 'Nakuru', productName: 'Dining Set 6-Seater' },
  { buyerName: 'David', city: 'Eldoret', productName: 'Cuddle Recliner Sofa' },
  { buyerName: 'Sarah', city: 'Thika', productName: 'TV Stand Walnut' },
  { buyerName: 'James', city: 'Malindi', productName: 'Copenhagen Corduroy Sofa' },
  { buyerName: 'Lucy', city: 'Nyeri', productName: 'Nightstand Walnut' },
  { buyerName: 'Ahmed', city: 'Garissa', productName: 'Pocket Spring Mattress' },
  { buyerName: 'Faith', city: 'Kitale', productName: 'Benin Sofa' },
]

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIN_INTERVAL = 15_000 // 15 seconds
const MAX_INTERVAL = 25_000 // 25 seconds
const AUTO_DISMISS = 4_000 // 4 seconds
const ADMIN_VIEWS = ['admin', 'admin-products', 'admin-orders', 'admin-analytics']

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickRandomNotification(excludeId?: string): SocialProofNotification {
  let index: number
  do {
    index = getRandomInt(0, NOTIFICATION_POOL.length - 1)
  } while (
    excludeId &&
    `${NOTIFICATION_POOL[index].buyerName}-${NOTIFICATION_POOL[index].productName}` === excludeId
  )

  const raw = NOTIFICATION_POOL[index]

  return {
    id: `${raw.buyerName}-${raw.productName}-${Date.now()}`,
    buyerName: raw.buyerName,
    city: raw.city,
    productName: raw.productName,
    productImage: PRODUCT_IMAGE_MAP[raw.productName] ?? '/images/products/modena-sofa.png',
    minutesAgo: getRandomInt(1, 18),
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SocialProof() {
  const currentView = useStore((s) => s.currentView)

  const [notification, setNotification] = useState<SocialProofNotification | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastKeyRef = useRef<string | undefined>(undefined)
  const mountedRef = useRef(true)
  const scheduleNextRef = useRef<() => void>(() => {})

  const isAdmin = ADMIN_VIEWS.includes(currentView)

  // Keep a ref so callbacks can check current admin state without re-subscribing
  const isAdminRef = useRef(isAdmin)
  useEffect(() => {
    isAdminRef.current = isAdmin
  }, [isAdmin])

  // -- Dismiss ---------------------------------------------------------------

  const dismiss = useCallback(() => {
    if (!mountedRef.current) return
    setIsVisible(false)
    // Clear pending dismiss timer
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current)
      dismissTimerRef.current = null
    }
  }, [])

  // -- Show next notification -------------------------------------------------

  const showNext = useCallback(() => {
    if (!mountedRef.current) return

    // Dismiss current if visible
    setIsVisible(false)

    const next = pickRandomNotification(lastKeyRef.current)
    lastKeyRef.current = `${next.buyerName}-${next.productName}`

    // Small delay so exit animation plays before enter
    setTimeout(() => {
      if (!mountedRef.current) return
      setNotification(next)
      setIsVisible(true)

      // Auto-dismiss after AUTO_DISMISS
      dismissTimerRef.current = setTimeout(() => {
        dismiss()
      }, AUTO_DISMISS)
    }, 400)
  }, [dismiss])

  // -- Schedule next show (stored in ref to avoid circular deps) -------------

  const scheduleNext = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current)
    }

    const delay = getRandomInt(MIN_INTERVAL, MAX_INTERVAL)
    intervalRef.current = setTimeout(() => {
      showNext()
      // Schedule the one after that via ref to break circular dependency
      scheduleNextRef.current()
    }, delay)
  }, [showNext])

  // Keep ref in sync
  useEffect(() => {
    scheduleNextRef.current = scheduleNext
  }, [scheduleNext])

  // -- Lifecycle: mount / unmount / view change ------------------------------

  useEffect(() => {
    mountedRef.current = true

    // Start the first notification after a short delay (3-8 seconds)
    const initialDelay = getRandomInt(3_000, 8_000)
    const initialTimer = setTimeout(() => {
      showNext()
      scheduleNext()
    }, initialDelay)

    return () => {
      mountedRef.current = false
      clearTimeout(initialTimer)
      if (intervalRef.current) clearTimeout(intervalRef.current)
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    }
  }, [showNext, scheduleNext])

  // -- Render ----------------------------------------------------------------

  // Don't render the container on admin pages
  if (isAdmin || !isVisible || !notification) return null

  return (
    <div
      className="fixed bottom-20 left-4 z-40 md:bottom-6"
      aria-live="polite"
      aria-label="Recent purchase notifications"
    >
      <AnimatePresence>
        {isVisible && notification && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -120, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -120, scale: 0.95 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
            className="w-[320px] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
          >
            {/* Card content */}
            <div className="flex items-start gap-3 p-3.5">
              {/* Product thumbnail */}
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <Image
                  src={notification.productImage}
                  alt={notification.productName}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>

              {/* Text content */}
              <div className="min-w-0 flex-1">
                {/* Close button */}
                <button
                  onClick={dismiss}
                  className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                  aria-label="Dismiss notification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                <div className="flex items-center gap-1.5">
                  <ShoppingCart className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                    Recent Purchase
                  </span>
                </div>

                <p className="mt-1 text-sm font-semibold leading-snug text-neutral-800 dark:text-neutral-100">
                  {notification.buyerName} from{' '}
                  <span className="text-amber-700 dark:text-amber-500">
                    {notification.city}
                  </span>
                </p>

                <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
                  purchased {notification.productName}
                </p>

                <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                  {notification.minutesAgo} min ago
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
