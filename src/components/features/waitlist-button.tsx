'use client'

import { useState } from 'react'
import { Bell, BellRing, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/store/use-store'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface WaitlistButtonProps {
  productId: string
}

export function WaitlistButton({ productId }: WaitlistButtonProps) {
  const { sessionId } = useStore()
  const [showInput, setShowInput] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = async () => {
    const subscribeEmail = email.trim()
    if (!subscribeEmail) {
      toast.error('Please enter your email address')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email: subscribeEmail }),
      })
      const data = await res.json()
      if (res.ok) {
        setSubscribed(true)
        toast.success(data.message || 'Added to waitlist!')
        setShowInput(false)
      } else {
        toast.error(data.error || 'Failed to join waitlist')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (subscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5"
      >
        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          You&apos;re on the waitlist!
        </span>
      </motion.div>
    )
  }

  return (
    <div>
      <AnimatePresence>
        {showInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-3"
          >
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                className="h-10 flex-1"
                autoFocus
              />
              <Button
                onClick={handleSubscribe}
                disabled={loading}
                className="bg-amber-700 hover:bg-amber-800 h-10"
                size="sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Notify Me'
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="outline"
        className="gap-2 w-full border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
        onClick={() => {
          if (!showInput) {
            setShowInput(true)
          } else {
            setShowInput(false)
          }
        }}
      >
        {showInput ? (
          <Bell className="h-4 w-4" />
        ) : (
          <BellRing className="h-4 w-4" />
        )}
        Notify When Available
      </Button>
    </div>
  )
}
