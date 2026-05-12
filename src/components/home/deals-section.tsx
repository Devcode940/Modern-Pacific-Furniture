'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame, Clock, ShoppingCart, Star, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
}

export function DealsSection() {
  const { navigate, addToCartOptimistic, sessionId } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 })

  useEffect(() => {
    fetch('/api/products?limit=4&sortBy=price-asc')
      .then((res) => res.json())
      .then((data) => {
        const saleProducts = (data.products || []).filter(
          (p: Product) => p.compareAtPrice !== null
        )
        setProducts(saleProducts.slice(0, 4))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) {
          seconds = 59
          minutes--
        }
        if (minutes < 0) {
          minutes = 59
          hours--
        }
        if (hours < 0) {
          hours = 23
          minutes = 59
          seconds = 59
        }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
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
    <section className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-500" />
              <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
                Hot Deals
              </Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Up to 40% Off Selected Items
            </h2>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Ends in:</span>
            <div className="flex gap-1">
              {[
                { value: timeLeft.hours, label: 'h' },
                { value: timeLeft.minutes, label: 'm' },
                { value: timeLeft.seconds, label: 's' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-0.5 rounded bg-amber-700 px-2 py-1 text-sm font-bold text-white"
                >
                  <span>{String(item.value).padStart(2, '0')}</span>
                  <span className="text-xs font-normal text-amber-200">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => {
              const images: string[] = (() => { try { return JSON.parse(product.images) } catch { return [] } })()
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
                  <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="relative aspect-square overflow-hidden">
                      {images[0] ? (
                        <img
                          src={images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-amber-50 to-orange-50" />
                      )}
                      <Badge className="absolute left-3 top-3 bg-red-500 text-white hover:bg-red-600">
                        -{discount}%
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="font-semibold group-hover:text-amber-700 dark:group-hover:text-amber-500">
                      {product.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm">{product.rating}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-500">
                          {formatCurrency(product.price)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatCurrency(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-amber-700 text-amber-700 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-400 disabled:opacity-50"
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => navigate('shop')}
            className="border-amber-700/30 text-amber-700 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-400"
          >
            View All Deals
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
