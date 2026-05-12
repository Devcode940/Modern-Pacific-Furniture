'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/use-store'

interface CategoryWithCount {
  id: string
  name: string
  slug: string
  image: string | null
  description: string | null
  _count: { products: number }
}

export function CategoryShowcase() {
  const { navigate } = useStore()
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 w-56 shrink-0 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Shop by Category
          </h2>
          <p className="mt-1 text-muted-foreground">
            Find the perfect piece for every room
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

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible">
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('shop', { category: category.slug })}
            className="group relative shrink-0 overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-lg md:shrink"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 224px, 1fr"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                <h3 className="font-semibold text-white">{category.name}</h3>
                <p className="text-xs text-white/80">
                  {category._count.products} products
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  )
}
