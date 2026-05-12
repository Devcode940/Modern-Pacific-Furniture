'use client'

import { useSyncExternalStore, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Eye } from 'lucide-react'
import { useStore } from '@/store/use-store'
import { formatCurrency } from '@/lib/utils'

interface RecentlyViewedItem {
  productId: string
  name: string
  price: number
  image: string
  viewedAt: number
}

interface RecentlyViewedProps {
  productId?: string
}

const STORAGE_KEY = 'mfp_recently_viewed'
const MAX_ITEMS = 8

// --- External store for recently-viewed items (backed by localStorage) ---
let cachedItems: RecentlyViewedItem[] | null = null
const storeListeners = new Set<() => void>()

function emitChange() {
  cachedItems = null
  storeListeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  storeListeners.add(listener)
  return () => {
    storeListeners.delete(listener)
  }
}

function getSnapshot(): RecentlyViewedItem[] {
  if (cachedItems === null) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      cachedItems = raw ? JSON.parse(raw) : []
    } catch {
      cachedItems = []
    }
  }
  return cachedItems
}

function getServerSnapshot(): RecentlyViewedItem[] {
  return []
}

function updateStoredItems(items: RecentlyViewedItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage full or unavailable
  }
  cachedItems = items
  emitChange()
}

// --- Hydration gate (false on server, true on client) ---
const noopUnsubscribe = () => () => {}

function useIsClient() {
  return useSyncExternalStore(noopUnsubscribe, () => true, () => false)
}

export function RecentlyViewed({ productId }: RecentlyViewedProps) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const isClient = useIsClient()
  const navigate = useStore((s) => s.navigate)
  const lastTrackedId = useRef('')

  // Track product view when productId changes (only on client)
  const trackProduct = useCallback(async (id: string) => {
    if (!id || id === lastTrackedId.current) return
    lastTrackedId.current = id

    const current = getSnapshot()
    if (current.length > 0 && current[0].productId === id) return

    try {
      const res = await fetch(`/api/products/${id}`)
      if (!res.ok) return
      const product = await res.json()

      const images: string[] = (() => {
        try {
          return JSON.parse(product.images)
        } catch {
          return []
        }
      })()

      const newItem: RecentlyViewedItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: images[0] || '',
        viewedAt: Date.now(),
      }

      const filtered = current.filter((item) => item.productId !== id)
      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS)

      updateStoredItems(updated)
    } catch {
      // Silently fail — fetch errors shouldn't break UI
    }
  }, [])

  useEffect(() => {
    if (isClient && productId) {
      trackProduct(productId)
    }
  }, [productId, isClient, trackProduct])

  if (!isClient || items.length === 0) return null

  return (
    <section className="py-8">
      {/* Section Heading */}
      <div className="mb-5 flex items-center gap-2">
        <Eye className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-bold tracking-tight">Recently Viewed</h2>
        <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {items.length}
        </span>
      </div>

      {/* Horizontal Scrollable Row */}
      <div className="relative">
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-none scroll-smooth snap-x snap-mandatory">
          {items.map((item, index) => (
            <motion.button
              key={`${item.productId}-${item.viewedAt}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => navigate('product', { productId: item.productId })}
              className="group snap-start shrink-0 cursor-pointer overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
              style={{ width: '160px' }}
            >
              {/* Image Thumbnail */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                    <span className="text-3xl text-muted-foreground/30">🪑</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="line-clamp-2 text-xs font-semibold leading-tight group-hover:text-amber-700 dark:group-hover:text-amber-500">
                  {item.name}
                </h3>
                <p className="mt-1.5 text-sm font-bold text-amber-700 dark:text-amber-500">
                  {formatCurrency(item.price)}
                </p>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Viewed recently</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Hide scrollbar across browsers */}
      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
