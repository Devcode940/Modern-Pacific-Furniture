'use client'

import { useState } from 'react'
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Ruler,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStore } from '@/store/use-store'
import { toast } from 'sonner'
import { cn, formatCurrency } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice: number | null
  images: string
  rating: number
  reviewCount: number
  stock: number
  category: { id: string; name: string; slug: string }
  tags: string | null
  dimensions: string | null
}

interface QuickViewModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getStockBadge(stock: number) {
  if (stock === 0) {
    return (
      <Badge className="bg-red-500 text-white hover:bg-red-600 gap-1">
        <AlertCircle className="h-3 w-3" />
        Out of Stock
      </Badge>
    )
  }
  if (stock <= 3) {
    return (
      <Badge className="bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800 gap-1">
        <AlertCircle className="h-3 w-3" />
        Only {stock} Left
      </Badge>
    )
  }
  if (stock <= 7) {
    return (
      <Badge className="bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800 gap-1">
        <AlertCircle className="h-3 w-3" />
        Low Stock
      </Badge>
    )
  }
  return (
    <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 gap-1">
      <CheckCircle2 className="h-3 w-3" />
      In Stock
    </Badge>
  )
}

export function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  const { navigate, addToCartOptimistic, sessionId } = useStore()
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setQuantity(1)
      setAdding(false)
    }
    onOpenChange(newOpen)
  }

  if (!product) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Product Quick View</DialogTitle>
            <DialogDescription>No product selected</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            No product selected
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const images: string[] = (() => {
    try {
      return JSON.parse(product.images)
    } catch {
      return []
    }
  })()

  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0

  const isOutOfStock = product.stock === 0
  const maxQuantity = product.stock

  const handleAddToCart = async () => {
    if (isOutOfStock || adding) return

    setAdding(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({ productId: product.id, quantity }),
      })
      const item = await res.json()
      addToCartOptimistic(item)
      toast.success(`${quantity}x ${product.name} added to cart!`)
      handleOpenChange(false)
    } catch {
      toast.error('Failed to add to cart. Please try again.')
    } finally {
      setAdding(false)
    }
  }

  const handleViewFullDetails = () => {
    handleOpenChange(false)
    navigate('product', { productId: product.id })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      key={product.id}
    >
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
        {/* Hidden accessible title / description */}
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* ── Left: Product Image ── */}
          <div className="relative flex items-center justify-center bg-muted/40 p-6 md:p-8">
            <div className="relative aspect-square w-full max-w-[400px] overflow-hidden rounded-xl border bg-card shadow-sm">
              {images[0] ? (
                <img
                  src={images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                  <span className="text-6xl text-muted-foreground/30">🪑</span>
                </div>
              )}

              {/* Discount badge overlay */}
              {discount > 0 && (
                <Badge className="absolute left-3 top-3 bg-red-500 text-white hover:bg-red-600">
                  -{discount}%
                </Badge>
              )}
            </div>
          </div>

          {/* ── Right: Product Info (scrollable) ── */}
          <ScrollArea className="max-h-[80vh]">
            <div className="flex flex-col gap-4 p-6 md:p-8">
              {/* Category Badge */}
              <Badge
                variant="secondary"
                className="w-fit text-xs font-medium"
              >
                {product.category.name}
              </Badge>

              {/* Product Name */}
              <h2 className="text-xl font-bold tracking-tight leading-tight md:text-2xl">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < Math.round(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})
                </span>
              </div>

              {/* Price */}
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-700 dark:text-amber-500">
                  {formatCurrency(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatCurrency(product.compareAtPrice)}
                  </span>
                )}
                {discount > 0 && (
                  <Badge className="bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                    Save {formatCurrency(product.compareAtPrice! - product.price)}
                  </Badge>
                )}
              </div>

              {/* Stock Status */}
              <div>{getStockBadge(product.stock)}</div>

              <Separator />

              {/* Description */}
              <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>

              {/* Dimensions */}
              {product.dimensions && (
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <Ruler className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm font-medium">Dimensions:</span>
                  <span className="text-sm text-muted-foreground">
                    {product.dimensions}
                  </span>
                </div>
              )}

              <Separator />

              {/* Quantity Selector */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center rounded-lg border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-r-none"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="flex h-10 w-12 items-center justify-center text-sm font-medium tabular-nums">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-l-none"
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={quantity >= maxQuantity || isOutOfStock}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  className="flex-1 bg-amber-700 hover:bg-amber-800 text-white"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || adding}
                >
                  {adding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </>
                  )}
                </Button>
              </div>

              {/* Low stock hint */}
              {product.stock > 0 && product.stock <= 3 && (
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Only {product.stock} left in stock — order soon
                </p>
              )}

              {/* View Full Details */}
              <Button
                variant="ghost"
                className="mt-1 w-full text-amber-700 hover:text-amber-800 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-950/30"
                onClick={handleViewFullDetails}
              >
                View Full Details
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
