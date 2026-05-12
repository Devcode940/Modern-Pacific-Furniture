'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, X, GitCompareArrows, Star, Package, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/use-store'
import { cn, formatCurrency } from '@/lib/utils'

interface CompareProduct {
  id: string
  name: string
  price: number
  compareAtPrice: number | null
  images: string
  rating: number
  reviewCount: number
  stock: number
  material: string | null
  style: string | null
  dimensions: string | null
  weight: string | null
  category: { id: string; name: string; slug: string }
}

const compareRows = [
  { key: 'image', label: 'Image' },
  { key: 'name', label: 'Name' },
  { key: 'price', label: 'Price' },
  { key: 'rating', label: 'Rating' },
  { key: 'material', label: 'Material' },
  { key: 'style', label: 'Style' },
  { key: 'dimensions', label: 'Dimensions' },
  { key: 'weight', label: 'Weight' },
  { key: 'stock', label: 'Stock' },
]

function getCellValue(product: CompareProduct, key: string) {
  switch (key) {
    case 'image':
      return null
    case 'name':
      return product.name
    case 'price':
      return product.price
    case 'rating':
      return product.rating
    case 'material':
      return product.material || 'N/A'
    case 'style':
      return product.style || 'N/A'
    case 'dimensions':
      return product.dimensions || 'N/A'
    case 'weight':
      return product.weight || 'N/A'
    case 'stock':
      return product.stock
    default:
      return null
  }
}

function getImage(product: CompareProduct) {
  try {
    const images = JSON.parse(product.images) as string[]
    return images[0] || null
  } catch {
    return null
  }
}

export function ProductComparison() {
  const { compareIds, toggleCompare, clearCompare, navigate, currentView } = useStore()
  const [products, setProducts] = useState<CompareProduct[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (compareIds.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProducts([])
      return
    }
    let cancelled = false
    setLoading(true)
    fetch(`/api/compare?ids=${compareIds.join(',')}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setProducts(data || [])
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([])
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [compareIds])

  // Sticky bottom bar when items selected but not on compare view
  if (currentView !== 'compare' && compareIds.length > 0) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur-sm dark:border-stone-700 dark:bg-stone-900/95"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <GitCompareArrows className="h-5 w-5 text-amber-700 dark:text-amber-500" />
            <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
              {compareIds.length} product{compareIds.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearCompare}
              className="text-stone-600 dark:text-stone-400"
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('compare')}
              className="bg-amber-700 hover:bg-amber-800 text-white"
            >
              Compare Now
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  if (currentView !== 'compare') return null

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('shop')}
              className="text-stone-600 hover:text-amber-700 dark:text-stone-400 dark:hover:text-amber-500"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                Product Comparison
              </h1>
              <p className="text-sm text-muted-foreground">
                Compare up to 4 products side by side
              </p>
            </div>
          </div>
          {compareIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearCompare}
              className="text-stone-600 dark:text-stone-400"
            >
              <X className="mr-1.5 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {compareIds.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-4 py-20 text-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30">
              <GitCompareArrows className="h-10 w-10 text-amber-700 dark:text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                Select products to compare
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Browse our collection and click the compare button on products to add them here for a detailed comparison.
              </p>
            </div>
            <Button
              onClick={() => navigate('shop')}
              className="mt-2 bg-amber-700 hover:bg-amber-800 text-white"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse Products
            </Button>
          </motion.div>
        ) : loading ? (
          /* Loading State */
          <div className="space-y-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${compareIds.length}, 1fr)` }}>
              {[...Array(compareRows.length)].map((_, i) => (
                <div key={i} className="contents">
                  <Skeleton className="h-12" />
                  {[...Array(compareIds.length)].map((_, j) => (
                    <Skeleton key={j} className="h-12" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Comparison Table */
          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-700">
            <div className="min-w-[640px]">
              {/* Grid layout: label column + product columns */}
              <div
                className="grid"
                style={{ gridTemplateColumns: `180px repeat(${products.length}, minmax(200px, 1fr))` }}
              >
                {/* Header Row */}
                <div className="border-b border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/50">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Products
                  </span>
                </div>
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="relative border-b border-stone-200 p-4 dark:border-stone-700"
                  >
                    <button
                      onClick={() => toggleCompare(product.id)}
                      className="absolute right-3 top-3 rounded-full p-1 text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors dark:hover:bg-red-950/30"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="aspect-square overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800 mb-3">
                      {(() => {
                        const img = getImage(product)
                        return img ? (
                          <img
                            src={img}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-3xl text-muted-foreground/30">
                            🪑
                          </div>
                        )
                      })()}
                    </div>
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 pr-6">
                      {product.name}
                    </p>
                  </div>
                ))}

                {/* Data Rows */}
                {compareRows.slice(1).map((row, rowIdx) => (
                  <>
                    <div
                      key={`label-${row.key}`}
                      className={cn(
                        'border-b border-stone-200 bg-stone-50 p-4 text-sm font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-800/50 dark:text-stone-400',
                        rowIdx === compareRows.length - 2 && 'border-b-0'
                      )}
                    >
                      {row.label}
                    </div>
                    {products.map((product) => {
                      const value = getCellValue(product, row.key)
                      return (
                        <div
                          key={`${product.id}-${row.key}`}
                          className={cn(
                            'border-b border-stone-200 p-4 text-sm dark:border-stone-700',
                            rowIdx === compareRows.length - 2 && 'border-b-0'
                          )}
                        >
                          {row.key === 'price' && (
                            <div className="flex flex-col">
                              <span className="text-lg font-bold text-amber-700 dark:text-amber-500">
                                {formatCurrency(product.price)}
                              </span>
                              {product.compareAtPrice && (
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatCurrency(product.compareAtPrice)}
                                </span>
                              )}
                            </div>
                          )}
                          {row.key === 'rating' && (
                            <div className="flex items-center gap-1.5">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={cn(
                                      'h-4 w-4',
                                      star <= Math.round(product.rating)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-muted-foreground/20'
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">
                                {product.rating}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({product.reviewCount})
                              </span>
                            </div>
                          )}
                          {row.key === 'stock' && (
                            <div>
                              {product.stock > 0 ? (
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">
                                  <Package className="mr-1 h-3 w-3" />
                                  In Stock ({product.stock})
                                </Badge>
                              ) : (
                                <Badge variant="destructive">Out of Stock</Badge>
                              )}
                            </div>
                          )}
                          {row.key === 'name' && (
                            <span className="font-medium text-stone-900 dark:text-stone-100">
                              {String(value)}
                            </span>
                          )}
                          {row.key === 'material' && (
                            <span className="text-stone-700 dark:text-stone-300 capitalize">
                              {String(value)}
                            </span>
                          )}
                          {row.key === 'style' && (
                            <span className="text-stone-700 dark:text-stone-300 capitalize">
                              {String(value)}
                            </span>
                          )}
                          {row.key === 'dimensions' && (
                            <span className="text-stone-700 dark:text-stone-300">
                              {String(value)}
                            </span>
                          )}
                          {row.key === 'weight' && (
                            <span className="text-stone-700 dark:text-stone-300">
                              {String(value)}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compare bar at bottom when products selected */}
      <AnimatePresence>
        {currentView === 'compare' && compareIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur-sm dark:border-stone-700 dark:bg-stone-900/95"
          >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-3 overflow-hidden">
                <GitCompareArrows className="h-5 w-5 shrink-0 text-amber-700 dark:text-amber-500" />
                <div className="flex items-center gap-2 overflow-hidden">
                  {products.slice(0, 3).map((p) => (
                    <span key={p.id} className="shrink-0 text-sm text-stone-600 dark:text-stone-400">
                      {p.name}
                      <span className="mx-1.5 text-muted-foreground">·</span>
                    </span>
                  ))}
                  {products.length > 3 && (
                    <Badge variant="secondary" className="shrink-0">
                      +{products.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCompare}
                  className="text-stone-600 dark:text-stone-400"
                >
                  Clear
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
