'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useStore } from '@/store/use-store'

export function HeroBanner() {
  const { navigate } = useStore()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-stone-900/30">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-amber-200/20 dark:bg-amber-700/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-orange-200/20 dark:bg-orange-700/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/10 dark:bg-amber-600/5 blur-2xl" />
      </div>

      <div className="container relative mx-auto px-4 py-20 md:py-28 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
              ✨ Premium Furniture Collection
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-50 md:text-5xl lg:text-6xl"
          >
            Furnish Your Home with{' '}
            <span className="text-amber-700 dark:text-amber-500">Quality Furniture</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 text-lg text-stone-600 dark:text-stone-400 md:text-xl"
          >
            Discover premium handcrafted furniture at affordable prices. Sofas, beds, dining sets, and more — delivered across Kenya.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button
              size="lg"
              onClick={() => navigate('shop')}
              className="bg-amber-700 px-8 text-base hover:bg-amber-800"
            >
              Shop Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('shop', { category: 'living-room' })}
              className="border-amber-700/30 text-amber-700 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-950/20"
            >
              Explore Living Room
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-stone-500 dark:text-stone-400"
          >
            <div className="text-center">
              <p className="text-xl font-bold text-stone-900 dark:text-stone-100">5K+</p>
              <p>Happy Customers</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-xl font-bold text-stone-900 dark:text-stone-100">200+</p>
              <p>Products</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-xl font-bold text-stone-900 dark:text-stone-100">3yr Warranty</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
