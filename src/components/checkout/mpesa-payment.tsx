'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

interface MpesaPaymentProps {
  amount: number
  orderNumber: string
  onPaymentSuccess: () => void
  disabled: boolean
}

export function MpesaPayment({
  amount,
  orderNumber,
  onPaymentSuccess,
  disabled,
}: MpesaPaymentProps) {
  const [phoneDigits, setPhoneDigits] = useState('')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  const fullPhoneNumber = `254${phoneDigits}`

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 9) {
      setPhoneDigits(value)
    }
  }

  const isPhoneValid = phoneDigits.length === 9

  const handlePayment = async () => {
    if (!isPhoneValid) {
      toast.error('Please enter a valid 9-digit phone number')
      return
    }

    setProcessing(true)
    try {
      const res = await fetch('/api/mpesa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
          amount,
          orderNumber,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'M-Pesa payment failed. Please try again.')
        return
      }

      setSuccess(true)
      toast.success('M-Pesa payment successful!')
      onPaymentSuccess()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* M-Pesa Branding */}
      <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/20">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Smartphone className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
            Lipa na M-Pesa
          </h3>
          <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70">
            Pay securely via M-Pesa mobile money
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-950/20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            >
              <CheckCircle2 className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
            </motion.div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                Payment Successful!
              </p>
              <p className="text-sm text-emerald-700/70 dark:text-emerald-400/70">
                {formatCurrency(amount)} has been processed
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Order #{orderNumber}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Phone Input */}
            <div className="space-y-2">
              <Label htmlFor="mpesa-phone">M-Pesa Phone Number</Label>
              <div className="flex items-center gap-0 rounded-md border border-input shadow-xs focus-within:ring-2 focus-within:ring-emerald-600/30 focus-within:border-emerald-600">
                <span className="flex items-center justify-center rounded-l-md border-r bg-muted/50 px-3 text-sm font-medium text-muted-foreground">
                  +254
                </span>
                <Input
                  id="mpesa-phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="7XX XXX XXX"
                  value={phoneDigits}
                  onChange={handlePhoneChange}
                  disabled={processing || disabled}
                  className="h-9 rounded-l-none border-0 shadow-none focus-visible:ring-0"
                  maxLength={9}
                />
              </div>
              {phoneDigits.length > 0 && !isPhoneValid && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Enter all 9 digits after +254
                </p>
              )}
            </div>

            {/* Pay Button */}
            <Button
              onClick={handlePayment}
              disabled={!isPhoneValid || processing || disabled}
              className="w-full bg-emerald-600 text-base font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              size="lg"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing M-Pesa...
                </>
              ) : (
                <>
                  <Smartphone className="mr-2 h-4 w-4" />
                  Pay with M-Pesa (Lipa na M-Pesa)
                </>
              )}
            </Button>

            {/* Amount Display */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Amount: <span className="font-bold text-foreground">{formatCurrency(amount)}</span>
              </p>
              <p className="text-xs text-muted-foreground/70">
                You will receive an STS push on your phone
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
