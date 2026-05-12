'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  ShoppingCart,
  Heart,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Play,
  Pause,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrency } from '@/lib/utils'
import { useStore } from '@/store/use-store'
import { toast } from 'sonner'

interface ProductViewer360Props {
  productId?: string
}

interface ProductData {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice: number | null
  images: string
  specs: string | null
  rating: number
  reviewCount: number
  stock: number
  material: string | null
  style: string | null
  dimensions: string | null
  category: { id: string; name: string; slug: string }
  tags: string | null
}

export function ProductViewer360({ productId: propProductId }: ProductViewer360Props) {
  const { selectedProductId, navigate, addToCartOptimistic, toggleWishlistItem, isInWishlist, sessionId } = useStore()
  const productId = propProductId || selectedProductId

  const [product, setProduct] = useState<ProductData | null>(null)
  const [fetchingId, setFetchingId] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [isAutoRotating, setIsAutoRotating] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartIndex, setDragStartIndex] = useState(0)

  const autoRotateRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  // Derive loading: true when we are fetching and haven't gotten the result yet
  const loading = fetchingId !== null && fetchingId !== product?.id

  const images: string[] = (() => { try { return product ? JSON.parse(product.images) : [] } catch { return [] } })()
  const tags: string[] = (() => { try { return product?.tags ? JSON.parse(product.tags) : [] } catch { return [] } })()
  const discount = product?.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0

  useEffect(() => {
    if (!productId) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFetchingId(productId)

    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setProduct(data.product)
          setCurrentImageIndex(0)
          setIsZoomed(false)
          setFetchingId(null)
        }
      })
      .catch(() => {
        if (!cancelled) setFetchingId(null)
      })
    return () => { cancelled = true }
  }, [productId])

  // Auto-rotate logic
  useEffect(() => {
    if (isAutoRotating && images.length > 1) {
      autoRotateRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
      }, 1500)
    }
    return () => {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current)
    }
  }, [isAutoRotating, images.length])

  const handleAddToCart = async () => {
    if (!product) return
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

  const handleToggleWishlist = () => {
    if (!product) return
    toggleWishlistItem(product.id)
    if (isInWishlist(product.id)) {
      toast.success('Removed from wishlist')
    } else {
      toast.success('Added to wishlist!')
    }
  }

  const handleZoomClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isZoomed) {
        setIsZoomed(false)
        return
      }
      if (images.length <= 1) {
        setIsZoomed(true)
        return
      }
      if (isAutoRotating) return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setZoomPosition({ x, y })
      setIsZoomed(true)
    },
    [isZoomed, images.length, isAutoRotating]
  )

  const handleZoomMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isZoomed || !imageContainerRef.current) return
      const rect = imageContainerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
    },
    [isZoomed]
  )

  // Drag-to-rotate handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (images.length <= 1 || isZoomed) return
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setDragStartX(clientX)
    setDragStartIndex(currentImageIndex)
  }

  const handleDragMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging || images.length <= 1) return
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const diff = clientX - dragStartX
      const threshold = imageContainerRef.current
        ? imageContainerRef.current.offsetWidth / (images.length * 1.5)
        : 80
      const indexDelta = Math.round(diff / threshold)
      const newIndex =
        ((dragStartIndex - indexDelta) % images.length + images.length) % images.length
      setCurrentImageIndex(newIndex)
    },
    [isDragging, dragStartX, dragStartIndex, images.length]
  )

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (!isDragging) return
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => handleDragMove(e as never)
    const handleGlobalEnd = () => handleDragEnd()
    window.addEventListener('mousemove', handleGlobalMove)
    window.addEventListener('mouseup', handleGlobalEnd)
    window.addEventListener('touchmove', handleGlobalMove)
    window.addEventListener('touchend', handleGlobalEnd)
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove)
      window.removeEventListener('mouseup', handleGlobalEnd)
      window.removeEventListener('touchmove', handleGlobalMove)
      window.removeEventListener('touchend', handleGlobalEnd)
    }
  }, [isDragging, handleDragMove])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Product not found</p>
        <Button onClick={() => navigate('shop')} className="mt-4">
          Back to Shop
        </Button>
      </div>
    )
  }

  return (
    <section className="min-h-screen bg-white dark:bg-stone-950">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Image Viewer */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div
              ref={imageContainerRef}
              className={cn(
                'relative cursor-pointer overflow-hidden rounded-2xl border bg-card',
                isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in',
                isDragging && 'cursor-grabbing'
              )}
              onClick={handleZoomClick}
              onMouseMove={handleZoomMouseMove}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              role="button"
              tabIndex={0}
              aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
            >
              <div className="relative aspect-square overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={images[currentImageIndex] || ''}
                    alt={`${product.name} - View ${currentImageIndex + 1}`}
                    className="h-full w-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    draggable={false}
                    style={
                      isZoomed
                        ? {
                            transform: 'scale(2)',
                            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          }
                        : undefined
                    }
                  />
                </AnimatePresence>

                {!images[currentImageIndex] && (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                    <span className="text-6xl text-muted-foreground/30">🪑</span>
                  </div>
                )}

                {/* Discount Badge */}
                {discount > 0 && (
                  <Badge className="absolute left-4 top-4 bg-red-500 text-white hover:bg-red-600 z-10">
                    -{discount}% OFF
                  </Badge>
                )}

                {/* 360 Badge */}
                {images.length > 1 && (
                  <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 backdrop-blur-sm">
                    <RotateCw className="h-3.5 w-3.5 text-white/90" />
                    <span className="text-xs font-medium text-white/90">360°</span>
                  </div>
                )}

                {/* Zoom Controls Overlay */}
                {isZoomed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2"
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-1.5 bg-white/90 backdrop-blur-sm shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsZoomed(false)
                      }}
                    >
                      <ZoomOut className="h-4 w-4" />
                      Zoom Out
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCurrentImageIndex(i)
                      setIsZoomed(false)
                    }}
                    className={cn(
                      'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                      i === currentImageIndex
                        ? 'border-amber-700 shadow-md dark:border-amber-500'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${i + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </motion.button>
                ))}
              </div>
            )}

            {/* Rotation Controls */}
            {images.length > 1 && (
              <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {currentImageIndex + 1} / {images.length}
                  </span>
                </div>

                {/* Rotation Indicator Dots */}
                <div className="flex items-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentImageIndex(i)
                        setIsZoomed(false)
                      }}
                      className={cn(
                        'h-2 rounded-full transition-all',
                        i === currentImageIndex
                          ? 'w-6 bg-amber-700 dark:bg-amber-500'
                          : 'w-2 bg-stone-300 hover:bg-stone-400 dark:bg-stone-600'
                      )}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className={cn(
                    'gap-1.5 text-xs',
                    isAutoRotating && 'text-amber-700 dark:text-amber-500'
                  )}
                >
                  {isAutoRotating ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      Auto
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Zoom Button (for single image) */}
            {images.length <= 1 && !isZoomed && (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setIsZoomed(true)}
              >
                <ZoomIn className="h-4 w-4" />
                Zoom In
              </Button>
            )}
          </motion.div>

          {/* Right: Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-5"
          >
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs capitalize">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Name */}
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
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
                ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-amber-700 dark:text-amber-500">
                {formatCurrency(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
              {discount > 0 && (
                <Badge className="bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  Save {formatCurrency(product.compareAtPrice! - product.price)}
                </Badge>
              )}
            </div>

            {/* Badges: Material & Style */}
            <div className="flex flex-wrap gap-2">
              {product.material && (
                <Badge
                  variant="outline"
                  className="rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                >
                  🪵 {product.material}
                </Badge>
              )}
              {product.style && (
                <Badge
                  variant="outline"
                  className="rounded-full border-stone-200 bg-stone-50 px-3 py-1 text-stone-700 dark:border-stone-700 dark:bg-stone-900/50 dark:text-stone-300"
                >
                  ✨ {product.style}
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="leading-relaxed text-muted-foreground">{product.description}</p>

            {/* Dimensions */}
            {product.dimensions && (
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Dimensions
                </p>
                <p className="text-sm font-medium">{product.dimensions}</p>
              </div>
            )}

            {/* Add to Cart & Wishlist */}
            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1 bg-amber-700 text-base hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleToggleWishlist}
                className={cn(
                  'gap-2',
                  isInWishlist(product.id) &&
                    'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'
                )}
              >
                <Heart
                  className={cn(
                    'h-5 w-5',
                    isInWishlist(product.id) && 'fill-current'
                  )}
                />
              </Button>
            </div>

            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-sm text-orange-600">
                Only {product.stock} left in stock — order soon
              </p>
            )}

            {/* Stock Status */}
            {product.stock > 5 && (
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                In stock — ships within 2-3 days
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
