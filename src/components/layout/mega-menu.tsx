'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ChevronRight,
  Sparkles,
  Tag,
  Gift,
  LayoutGrid,
  ScanEye,
  Star,
  Loader2,
} from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/use-store'
import { cn, formatCurrency } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
  image: string | null
  _count: { products: number }
}

interface FeaturedProduct {
  id: string
  name: string
  price: number
  compareAtPrice: number | null
  images: string
  rating: number
}

const quickLinks = [
  { label: 'New Arrivals', icon: Sparkles, action: 'new' },
  { label: 'On Sale', icon: Tag, action: 'sale' },
  { label: 'Gift Cards', icon: Gift, action: 'gift' },
  { label: 'Design Quiz', icon: LayoutGrid, action: 'quiz' },
  { label: 'Room Visualizer', icon: ScanEye, action: 'visualizer' },
]

export function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [featured, setFeatured] = useState<FeaturedProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { navigate, setFilter } = useStore()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isOpen && (categories.length === 0 || featured.length === 0)) {
      let cancelled = false
      const controller = new AbortController()
      Promise.all([
        fetch('/api/categories', { signal: controller.signal }).then((r) => r.json()),
        fetch('/api/products?featured=true&limit=2', { signal: controller.signal }).then((r) => r.json()),
      ])
        .then(([cats, prods]) => {
          if (!cancelled) {
            setCategories(cats || [])
            setFeatured(prods.products || [])
            setLoading(false)
          }
        })
        .catch(() => {
          if (!cancelled) setLoading(false)
        })
      return () => {
        cancelled = true
        controller.abort()
      }
    }
  }, [isOpen, categories.length, featured.length])

  const handleMouseEnter = () => {
    if (isMobile) return
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => setIsOpen(true), 200)
  }

  const handleMouseLeave = () => {
    if (isMobile) return
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    closeTimeoutRef.current = setTimeout(() => setIsOpen(false), 150)
  }

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  const handleCategoryClick = (slug: string) => {
    setIsOpen(false)
    navigate('shop', { category: slug })
  }

  const handleQuickLink = (action: string) => {
    setIsOpen(false)
    switch (action) {
      case 'new':
        setFilter({ sortBy: 'newest' })
        navigate('shop')
        break
      case 'sale':
        setFilter({ onSale: true })
        navigate('shop')
        break
      case 'gift':
        navigate('shop')
        break
      case 'quiz':
        navigate('quiz')
        break
      case 'visualizer':
        navigate('visualizer')
        break
    }
  }

  const getProductImage = (product: FeaturedProduct) => {
    try {
      const images = JSON.parse(product.images) as string[]
      return images[0] || null
    } catch {
      return null
    }
  }

  const getCategoryImage = (cat: Category) => {
    return cat.image || null
  }

  const menuContent = (
    <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-3">
      {/* Categories Column */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <LayoutGrid className="h-3.5 w-3.5" />
          Categories
        </h3>
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug)}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-amber-50 dark:hover:bg-amber-950/20"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800">
                  {getCategoryImage(cat) ? (
                    <img
                      src={getCategoryImage(cat)!}
                      alt={cat.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground/50">
                      🪑
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                    {cat.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cat._count.products} products
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Featured Products Column */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Star className="h-3.5 w-3.5 text-amber-500" />
          Best Sellers
        </h3>
        {loading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-lg border p-3">
                <Skeleton className="mb-2 h-24 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-1 h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {featured.slice(0, 2).map((product) => {
              const img = getProductImage(product)
              return (
                <button
                  key={product.id}
                  onClick={() => {
                    setIsOpen(false)
                    navigate('product', { productId: product.id })
                  }}
                  className="group w-full overflow-hidden rounded-lg border border-stone-200 bg-white p-3 text-left transition-all hover:border-amber-300 hover:shadow-md dark:border-stone-700 dark:bg-stone-800"
                >
                  <div className="mb-2 aspect-video overflow-hidden rounded-md bg-stone-100 dark:bg-stone-700">
                    {img ? (
                      <img
                        src={img}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl text-muted-foreground/30">
                        🪑
                      </div>
                    )}
                  </div>
                  <p className="truncate text-sm font-medium text-stone-800 group-hover:text-amber-700 dark:text-stone-200 dark:group-hover:text-amber-500 transition-colors">
                    {product.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-500">
                      {formatCurrency(product.price)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatCurrency(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Links Column */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          Quick Links
        </h3>
        <div className="space-y-1">
          {quickLinks.map((link) => (
            <button
              key={link.action}
              onClick={() => handleQuickLink(link.action)}
              className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-amber-50 dark:hover:bg-amber-950/20"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
                <link.icon className="h-4 w-4 text-amber-700 dark:text-amber-500" />
              </div>
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                {link.label}
              </span>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop: hover-triggered mega menu */}
      {!isMobile && (
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-500">
            Shop
            <ChevronRight className="h-3.5 w-3.5 rotate-90" />
          </button>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="absolute left-1/2 top-full z-50 mt-1 w-[800px] -translate-x-1/2 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl dark:border-stone-700 dark:bg-stone-900"
                onMouseEnter={() => {
                  if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
                }}
                onMouseLeave={handleMouseLeave}
              >
                {menuContent}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Mobile: sheet-triggered */}
      {isMobile && (
        <>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Shop
            <ChevronRight className="h-3.5 w-3.5 rotate-90" />
          </button>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-2xl sm:max-w-none">
              <SheetHeader>
                <SheetTitle className="text-left">Browse Categories</SheetTitle>
              </SheetHeader>
              {menuContent}
            </SheetContent>
          </Sheet>
        </>
      )}
    </>
  )
}
