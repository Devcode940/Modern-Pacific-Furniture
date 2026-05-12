'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Package, Percent, ShoppingCart, Check, Sparkles, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useStore } from '@/store/use-store'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

interface BundleProduct {
  name: string
  image: string
  price: number
  slug: string
  quantity: number
}

interface Bundle {
  id: string
  name: string
  description: string
  products: BundleProduct[]
  discountPercent: number
  badge: string
  tagline: string
}

interface ResolvedProduct {
  id: string
  name: string
  price: number
  compareAtPrice: number | null
  images: string
  stock: number
  category: { id: string; name: string; slug: string }
}

// ─── Static Bundle Data ─────────────────────────────────────────────────────

const bundles: Bundle[] = [
  {
    id: 'complete-living-room',
    name: 'Complete Living Room Set',
    description:
      'Transform your living space with our premium sofa, coffee table, and TV stand — everything you need for the perfect lounge.',
    badge: 'Most Popular',
    tagline: 'Curated for comfort & style',
    discountPercent: 15,
    products: [
      {
        name: 'Modena Sofa Set',
        image: '/images/products/modena-sofa.png',
        price: 260000,
        slug: 'modena-sofa-set',
        quantity: 1,
      },
      {
        name: 'Coffee Table Walnut',
        image: '/images/products/coffee-table-walnut.png',
        price: 32000,
        slug: 'coffee-table-walnut',
        quantity: 1,
      },
      {
        name: 'TV Stand Walnut',
        image: '/images/products/tv-stand-walnut.png',
        price: 42000,
        slug: 'tv-stand-walnut',
        quantity: 1,
      },
    ],
  },
  {
    id: 'bedroom-makeover',
    name: 'Bedroom Makeover Bundle',
    description:
      'Create your dream bedroom retreat with a king-size mahogany bed, matching nightstand, and a premium pocket spring mattress.',
    badge: 'Best Value',
    tagline: 'Sleep like royalty',
    discountPercent: 20,
    products: [
      {
        name: 'King Size Mahogany Bed Set',
        image: '/images/products/king-mahogany-bed.png',
        price: 190000,
        slug: 'king-mahogany-bed-set',
        quantity: 1,
      },
      {
        name: 'Nightstand Walnut',
        image: '/images/products/nightstand-walnut.png',
        price: 35000,
        slug: 'nightstand-walnut',
        quantity: 1,
      },
      {
        name: 'Pacific Pocket Spring Mattress',
        image: '/images/products/pocket-spring-mattress.png',
        price: 37000,
        slug: 'pacific-pocket-spring-mattress',
        quantity: 1,
      },
    ],
  },
  {
    id: 'home-office-setup',
    name: 'Home Office Setup',
    description:
      'Boost your productivity with an ergonomic desk and office chair designed for long working hours and maximum comfort.',
    badge: 'Work From Home',
    tagline: 'Productivity meets comfort',
    discountPercent: 10,
    products: [
      {
        name: 'Ergonomic Desk',
        image: '/images/products/desk-ergonomic.png',
        price: 45000,
        slug: 'desk-ergonomic',
        quantity: 1,
      },
      {
        name: 'Office Ergonomic Chair',
        image: '/images/products/chair-office-ergonomic.png',
        price: 28000,
        slug: 'chair-office-ergonomic',
        quantity: 1,
      },
    ],
  },
  {
    id: 'dining-room-collection',
    name: 'Dining Room Collection',
    description:
      'Host memorable dinner parties with a solid oak dining table and four stylish fabric chairs — timeless elegance for your dining space.',
    badge: 'Entertainer\'s Pick',
    tagline: 'Gather around in style',
    discountPercent: 15,
    products: [
      {
        name: 'Dining Table Oak',
        image: '/images/products/dining-table-oak.png',
        price: 95000,
        slug: 'dining-table-oak',
        quantity: 1,
      },
      {
        name: 'Dining Chair Fabric',
        image: '/images/products/dining-chairs-fabric.png',
        price: 25000,
        slug: 'dining-chairs-fabric',
        quantity: 4,
      },
    ],
  },
  {
    id: 'cozy-corner-bundle',
    name: 'Cozy Corner Bundle',
    description:
      'Create a warm, inviting corner with the classic Benin sofa set and a beautiful walnut coffee table — perfect for relaxing evenings.',
    badge: 'New Arrivals',
    tagline: 'Your relaxation station',
    discountPercent: 10,
    products: [
      {
        name: 'Benin Sofa Set',
        image: '/images/products/benin-sofa.png',
        price: 180000,
        slug: 'benin-sofa-set',
        quantity: 1,
      },
      {
        name: 'Coffee Table Walnut',
        image: '/images/products/coffee-table-walnut.png',
        price: 32000,
        slug: 'coffee-table-walnut',
        quantity: 1,
      },
    ],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getBundleTotals(bundle: Bundle) {
  const originalTotal = bundle.products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  )
  const savings = Math.round(originalTotal * (bundle.discountPercent / 100))
  const discountedTotal = originalTotal - savings
  return { originalTotal, savings, discountedTotal }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function BundleCard({
  bundle,
  resolvedProducts,
  addingBundleId,
  onAddBundle,
}: {
  bundle: Bundle
  resolvedProducts: Map<string, ResolvedProduct>
  addingBundleId: string | null
  onAddBundle: (bundle: Bundle) => Promise<void>
}) {
  const isAdding = addingBundleId === bundle.id
  const { originalTotal, savings, discountedTotal } = getBundleTotals(bundle)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      className="flex h-full"
    >
      <Card className="group flex h-full flex-col overflow-hidden border-2 border-transparent transition-colors duration-300 hover:border-amber-300 dark:hover:border-amber-700">
        {/* Badge Area */}
        <CardHeader className="relative space-y-0 pb-3">
          <div className="flex items-start justify-between">
            <Badge className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 py-1 text-sm font-bold text-white shadow-sm">
              <Percent className="mr-1 h-3.5 w-3.5" />
              Save {bundle.discountPercent}%
            </Badge>
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              {bundle.badge}
            </Badge>
          </div>
          <div className="pt-2">
            <p className="text-xs font-medium tracking-wide text-amber-700 uppercase dark:text-amber-500">
              {bundle.tagline}
            </p>
            <h3 className="mt-1 text-lg font-bold leading-snug tracking-tight">
              {bundle.name}
            </h3>
          </div>
        </CardHeader>

        {/* Product List */}
        <CardContent className="flex-1 space-y-3 pt-0">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {bundle.description}
          </p>

          <Separator />

          <div className="space-y-2.5">
            {bundle.products.map((product, idx) => (
              <div
                key={`${bundle.id}-${idx}`}
                className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2 transition-colors hover:bg-muted/60"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="56px"
                  />
                  {product.quantity > 1 && (
                    <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-700 text-[10px] font-bold text-white dark:bg-amber-500">
                      ×{product.quantity}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(product.price)}
                    {product.quantity > 1 && (
                      <span className="ml-1 text-xs text-muted-foreground/70">
                        (×{product.quantity})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <Separator />

          <div className="space-y-1.5 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Original Total</span>
              <span className="line-through text-muted-foreground/70">
                {formatCurrency(originalTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-medium text-emerald-700 dark:text-emerald-400">
              <span className="flex items-center gap-1">
                <Package className="h-3.5 w-3.5" />
                Bundle Discount
              </span>
              <span>−{formatCurrency(savings)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Bundle Price</span>
              <span className="text-xl font-extrabold text-amber-700 dark:text-amber-500">
                {formatCurrency(discountedTotal)}
              </span>
            </div>
          </div>
        </CardContent>

        {/* Action */}
        <CardFooter className="pt-2">
          {isAdding ? (
            <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-100 py-2.5 text-sm font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <Button
              className="w-full bg-amber-700 py-2.5 text-base font-semibold shadow-md shadow-amber-700/20 hover:bg-amber-800 dark:bg-amber-600 dark:shadow-amber-600/20 dark:hover:bg-amber-700"
              onClick={() => onAddBundle(bundle)}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add Bundle to Cart
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function BundleDealBuilder() {
  const { addToCartOptimistic, sessionId, setCartOpen } = useStore()
  const [addingBundleId, setAddingBundleId] = useState<string | null>(null)
  const [resolvedProducts, setResolvedProducts] = useState<
    Map<string, ResolvedProduct>
  >(new Map())

  // Fetch all products to resolve slugs → IDs for cart operations
  useEffect(() => {
    fetch('/api/products?limit=50')
      .then((res) => res.json())
      .then((data) => {
        const products: ResolvedProduct[] = data.products || []
        const map = new Map<string, ResolvedProduct>()
        for (const p of products) {
          map.set(p.slug, p)
        }
        setResolvedProducts(map)
      })
      .catch(() => {})
  }, [])

  const handleAddBundle = useCallback(
    async (bundle: Bundle) => {
      if (!sessionId) {
        toast.error('Please refresh the page and try again.')
        return
      }

      setAddingBundleId(bundle.id)
      let addedCount = 0
      let failedItems: string[] = []

      for (const product of bundle.products) {
        const resolved = resolvedProducts.get(product.slug)
        if (!resolved) {
          failedItems.push(product.name)
          continue
        }

        try {
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-session-id': sessionId,
            },
            body: JSON.stringify({
              productId: resolved.id,
              quantity: product.quantity,
            }),
          })

          if (res.ok) {
            const cartItem = await res.json()
            addToCartOptimistic(cartItem)
            addedCount += product.quantity
          } else {
            failedItems.push(product.name)
          }
        } catch {
          failedItems.push(product.name)
        }
      }

      setAddingBundleId(null)

      if (addedCount > 0 && failedItems.length === 0) {
        const { savings } = getBundleTotals(bundle)
        toast.success(`${bundle.name} added to cart!`, {
          description: `${addedCount} item${addedCount > 1 ? 's' : ''} added — you save ${formatCurrency(savings)}!`,
          action: {
            label: 'View Cart',
            onClick: () => setCartOpen(true),
          },
        })
      } else if (addedCount > 0 && failedItems.length > 0) {
        toast.success(`${addedCount} item${addedCount > 1 ? 's' : ''} added to cart`, {
          description: `Some items (${failedItems.join(', ')}) are currently unavailable.`,
          action: {
            label: 'View Cart',
            onClick: () => setCartOpen(true),
          },
        })
      } else {
        toast.error('Unable to add bundle to cart', {
          description:
            'Some items may be unavailable. Please try again later.',
        })
      }
    },
    [sessionId, resolvedProducts, addToCartOptimistic, setCartOpen]
  )

  return (
    <section>
      {/* Section Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
              <Package className="h-4.5 w-4.5 text-amber-700 dark:text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Bundle Deals
            </h2>
          </div>
          <p className="mt-1 max-w-xl text-muted-foreground">
            Save more when you buy together. Our curated furniture bundles are
            hand-picked to complement each other — at unbeatable discounted
            prices.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 dark:border-emerald-800 dark:bg-emerald-950/30">
          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Save up to 20% on bundles
          </span>
        </div>
      </div>

      {/* Bundle Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bundles.map((bundle, index) => (
          <motion.div
            key={bundle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            <BundleCard
              bundle={bundle}
              resolvedProducts={resolvedProducts}
              addingBundleId={addingBundleId}
              onAddBundle={handleAddBundle}
            />
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 flex flex-col items-center gap-3 text-center"
      >
        <Separator className="mb-6" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <p className="text-sm">
            All bundles include free delivery within Nairobi on orders over KSh
            50,000
          </p>
        </div>
        <Button
          variant="outline"
          className="mt-2 border-amber-700/30 text-amber-700 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-950/30"
          onClick={() => {
            const shopStore = useStore.getState()
            shopStore.navigate('shop')
          }}
        >
          Browse All Products
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </section>
  )
}
