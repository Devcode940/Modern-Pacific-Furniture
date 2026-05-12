'use client'

import { useRef, useState } from 'react'
import { ShoppingCart, Star, Heart, GitCompareArrows, CheckCircle2, AlertCircle, PackageCheck, Eye, Truck, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
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
}

interface ProductCardProps {
  product: Product
  index?: number
  onQuickView?: (product: Product) => void
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
        <PackageCheck className="h-3 w-3" />
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

export function ProductCard({ product, index = 0, onQuickView }: ProductCardProps) {
  const {
    navigate,
    addToCartOptimistic,
    toggleWishlistItem,
    isInWishlist,
    toggleCompare,
    isInCompare,
    compareIds,
    sessionId,
  } = useStore()

  const cardRef = useRef<HTMLDivElement>(null)
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({})

  const images: string[] = (() => { try { return JSON.parse(product.images) } catch { return [] } })()
  const tags: string[] = product.tags ? (() => { try { return JSON.parse(product.tags) } catch { return [] } })() : []
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0

  const wishlisted = isInWishlist(product.id)
  const compared = isInCompare(product.id)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (product.stock === 0) {
      toast.error('This product is out of stock')
      return
    }
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      })
      const item = await res.json()
      addToCartOptimistic(item)
      toast.success(`${product.name} added to cart!`)
    } catch {
      toast.error('Failed to add to cart')
    }
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleWishlistItem(product.id)
    if (!wishlisted) {
      toast.success(`${product.name} added to wishlist!`)
    }
  }

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (compareIds.length >= 4 && !compared) {
      toast.error('You can compare up to 4 products')
      return
    }
    toggleCompare(product.id)
    if (!compared) {
      toast.success(`${product.name} added to comparison`)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -8
    const rotateY = ((x - centerX) / centerX) * 8
    setTiltStyle({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out',
    })
  }

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.4s ease-out',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="group cursor-pointer"
      onClick={() => navigate('product', { productId: product.id })}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative mb-3 overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-amber-900/10"
        style={tiltStyle}
      >
        <div className="relative aspect-square overflow-hidden">
          {images[0] ? (
            <img
              src={images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
              <span className="text-4xl text-muted-foreground/30">🪑</span>
            </div>
          )}

          {/* Shimmer/Shine Animation Overlay */}
          <div className="absolute inset-0 z-10 overflow-hidden">
            <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] transition-transform duration-700 group-hover:translate-x-[200%]" />
          </div>

          {/* Badges - Top Left */}
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
            {discount > 0 && (
              <Badge className="bg-red-500 text-white hover:bg-red-600">
                -{discount}%
              </Badge>
            )}
            {tags.includes('new') && (
              <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">
                New
              </Badge>
            )}
            {tags.includes('eco-friendly') && (
              <Badge className="bg-teal-500 text-white hover:bg-teal-600">
                Eco
              </Badge>
            )}
          </div>

          {/* Stock Badge - Bottom Left */}
          <div className="absolute bottom-3 left-3 z-10">
            {getStockBadge(product.stock)}
          </div>

          {/* Wishlist & Compare Buttons - Top Right */}
          <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={(e) => {
                e.stopPropagation()
                onQuickView?.(product)
              }}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all hover:scale-110 dark:bg-black/60'
              )}
              title="Quick View"
            >
              <Eye className="h-4 w-4 text-stone-600 dark:text-stone-300" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleToggleWishlist}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all hover:scale-110 dark:bg-black/60',
                wishlisted && 'bg-red-50 dark:bg-red-950/40'
              )}
              title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                className={cn(
                  'h-4 w-4 transition-colors',
                  wishlisted
                    ? 'fill-red-500 text-red-500'
                    : 'text-stone-600 hover:text-red-500 dark:text-stone-300'
                )}
              />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleToggleCompare}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all hover:scale-110 dark:bg-black/60',
                compared && 'bg-amber-50 dark:bg-amber-950/40'
              )}
              title={compared ? 'Remove from comparison' : 'Add to comparison'}
            >
              <GitCompareArrows
                className={cn(
                  'h-4 w-4 transition-colors',
                  compared
                    ? 'text-amber-700 dark:text-amber-500'
                    : 'text-stone-600 hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-500'
                )}
              />
            </motion.button>
          </div>

          {/* Quick Add Overlay */}
          <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-gradient-to-t from-black/60 to-transparent p-4 pt-12 transition-transform duration-300 group-hover:translate-y-0">
            <Button
              className="w-full bg-white text-stone-900 hover:bg-white/90 disabled:opacity-50"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {product.stock === 0 ? 'Out of Stock' : 'Quick Add'}
            </Button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="px-1">
        <p className="mb-0.5 text-xs text-muted-foreground">
          {product.category.name}
        </p>
        <h3 className="font-semibold leading-tight group-hover:text-amber-700 dark:group-hover:text-amber-500">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-2 flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>
        {product.stock > 0 && product.price >= 30000 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
              <Truck className="h-3 w-3" /> Free Delivery
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 dark:text-blue-400">
              <Shield className="h-3 w-3" /> Warranty
            </span>
          </div>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-amber-700 dark:text-amber-500">
            {formatCurrency(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
