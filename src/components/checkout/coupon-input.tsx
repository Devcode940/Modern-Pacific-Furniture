'use client'

import { useState } from 'react'
import { Ticket, X, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/use-store'
import { toast } from 'sonner'
import { cn, formatCurrency } from '@/lib/utils'

export function CouponInput() {
  const { coupon, setCoupon, clearCoupon, cartTotal } = useStore()
  const [code, setCode] = useState('')
  const [applying, setApplying] = useState(false)

  const handleApply = async () => {
    const trimmedCode = code.trim()
    if (!trimmedCode) {
      toast.error('Please enter a coupon code')
      return
    }
    if (cartTotal <= 0) {
      toast.error('Your cart is empty')
      return
    }

    setApplying(true)
    try {
      const res = await fetch('/api/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmedCode, cartTotal }),
      })
      const data = await res.json()

      if (data.valid) {
        setCoupon({
          code: data.code,
          discount: data.discount,
          value: data.value,
          type: data.type,
          valid: true,
          message: data.message,
        })
        toast.success(`Coupon applied: ${data.message}`)
        setCode('')
      } else {
        toast.error(data.message || 'Invalid coupon code')
      }
    } catch {
      toast.error('Failed to validate coupon. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  const handleRemove = () => {
    clearCoupon()
    toast.success('Coupon removed')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Ticket className="h-4 w-4 text-amber-700 dark:text-amber-500" />
        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          Coupon Code
        </span>
      </div>

      <AnimatePresence mode="wait">
        {coupon.valid && coupon.code ? (
          <motion.div
            key="applied"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs">
                  {coupon.code}
                </Badge>
                <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                  {coupon.type === 'percentage'
                    ? `${coupon.value}% discount applied`
                    : `KSh ${coupon.value.toLocaleString('en-KE')} discount applied`}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="rounded-full p-1 text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex gap-2"
          >
            <Input
              type="text"
              placeholder="Enter coupon code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              className="h-9 text-sm border-stone-200 bg-stone-50 focus-visible:ring-amber-700/30 uppercase dark:border-stone-700 dark:bg-stone-800"
            />
            <Button
              size="sm"
              onClick={handleApply}
              disabled={applying || !code.trim()}
              className="h-9 shrink-0 bg-amber-700 hover:bg-amber-800 text-white disabled:opacity-50"
            >
              {applying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {!coupon.valid && (
        <p className="text-xs text-muted-foreground">
          Try codes like WELCOME10, SAVE25, or FLAT5000
        </p>
      )}
    </div>
  )
}
