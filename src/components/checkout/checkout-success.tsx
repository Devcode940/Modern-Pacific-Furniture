'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/use-store'

export function CheckoutSuccess() {
  const { navigate, lastOrderNumber } = useStore()

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <CheckCircle2 className="mx-auto mb-6 h-20 w-20 text-emerald-500" />
        </motion.div>

        <h1 className="mb-3 text-3xl font-bold tracking-tight">
          Order Placed Successfully!
        </h1>
        {lastOrderNumber && (
          <p className="mb-2 text-lg font-semibold text-amber-700 dark:text-amber-500">
            Order #{lastOrderNumber}
          </p>
        )}
        <p className="mb-2 text-muted-foreground">
          Thank you for your purchase. We&apos;ll send you an email confirmation shortly.
        </p>
        <p className="mb-8 text-sm text-muted-foreground">
          Your order is being processed and will ship within 1-3 business days.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            className="bg-amber-700 hover:bg-amber-800"
            onClick={() => navigate('shop')}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('home')}
          >
            Back to Home
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
