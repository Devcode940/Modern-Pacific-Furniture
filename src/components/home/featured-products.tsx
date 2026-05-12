'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Star, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { useStore } from '@/store/use-store'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

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

export function FeaturedProducts() {
  const { navigate, addToCartOptimistic, sessionId } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products?featured=true&limit=8')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
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

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Featured Collection
          </h2>
          <p className="mt-1 text-muted-foreground">
            Handpicked favorites loved by our customers
          </p>
        </div>
        <Button
          variant="ghost"
          className="hidden text-amber-700 hover:text-amber-800 dark:text-amber-500 sm:flex"
          onClick={() => navigate('shop')}
        >
          View All
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => {
            const images: string[] = (() => { try { return JSON.parse(product.images) } catch { return [] } })()
            const tags: string[] = product.tags ? (() => { try { return JSON.parse(product.tags) } catch { return [] } })() : []
            const discount = product.compareAtPrice
              ? Math.round((1 - product.price / product.compareAtPrice) * 100)
              : 0

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="group cursor-pointer"
                onClick={() => navigate('product', { productId: product.id })}
              >
                <div className="relative mb-3 overflow-hidden rounded-xl border bg-card shadow-sm">
                  <div className="relative aspect-square overflow-hidden">
                    {images[0] ? (
                      <img
                        src={images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20" />
                    )}

                    {/* Badges */}
                    <div className="absolute left-3 top-3 flex flex-col gap-1">
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
                    </div>

                    {/* Quick Add Overlay */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0">
                      <Button
                        className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-50"
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    {product.category.name}
                  </p>
                  <h3 className="font-semibold leading-tight group-hover:text-amber-700 dark:group-hover:text-amber-500">
                    {product.name}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {product.description}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">
                      ({product.reviewCount})
                    </span>
                  </div>
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
          })}
        </div>
      )}
    </section>
  )
}
