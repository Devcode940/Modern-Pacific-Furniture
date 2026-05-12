'use client'

import { useState, useCallback } from 'react'
import { Truck, Loader2, MapPin, Clock, Info } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'

interface DeliveryEstimatorProps {
  subtotal: number
  onDeliveryChange: (cost: number, county: string, days: string) => void
}

const KENYAN_COUNTIES = [
  'Nairobi',
  'Mombasa',
  'Nakuru',
  'Kisumu',
  'Eldoret',
  'Thika',
  'Kiambu',
  'Machakos',
  'Uasin Gishu',
  'Kajiado',
  'Nyeri',
  'Meru',
  'Kakamega',
  'Other',
]

const FREE_DELIVERY_THRESHOLD = 50000

export function DeliveryEstimator({
  subtotal,
  onDeliveryChange,
}: DeliveryEstimatorProps) {
  const [selectedCounty, setSelectedCounty] = useState('')
  const [loading, setLoading] = useState(false)
  const [deliveryInfo, setDeliveryInfo] = useState<{
    cost: number
    days: string
    county: string
    isFree: boolean
  } | null>(null)

  const handleCountyChange = useCallback(
    async (county: string) => {
      setSelectedCounty(county)
      setLoading(true)
      setDeliveryInfo(null)

      try {
        const res = await fetch('/api/delivery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ county, subtotal }),
        })

        const data = await res.json()

        const isFree = data.isFreeDelivery || (data.cost === 0)

        const info = {
          cost: isFree ? 0 : (data.deliveryCost ?? data.cost ?? 0),
          days: typeof data.estimatedDays === 'string'
            ? data.estimatedDays
            : (data.estimatedDays?.label ?? '3-5 business days'),
          county: data.county || county,
          isFree,
        }

        setDeliveryInfo(info)
        onDeliveryChange(info.cost, county, info.days)
      } catch {
        const info = {
          cost: 500,
          days: '5-7 business days',
          county,
          isFree: false,
        }
        setDeliveryInfo(info)
        onDeliveryChange(info.cost, county, info.days)
      } finally {
        setLoading(false)
      }
    },
    [subtotal, onDeliveryChange]
  )

  const remainingForFree =
    subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD
      ? FREE_DELIVERY_THRESHOLD - subtotal
      : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Truck className="h-4 w-4 text-amber-700 dark:text-amber-500" />
        <span className="text-sm font-semibold">
          Delivery Estimate
        </span>
      </div>

      {/* County Select */}
      <div className="space-y-2">
        <Label htmlFor="delivery-county" className="text-xs text-muted-foreground">
          Select your county
        </Label>
        <Select
          value={selectedCounty}
          onValueChange={handleCountyChange}
          disabled={subtotal <= 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose delivery county..." />
          </SelectTrigger>
          <SelectContent>
            {KENYAN_COUNTIES.map((county) => (
              <SelectItem key={county} value={county}>
                {county === 'Other' ? 'Other County' : county}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Calculating delivery...
          </span>
        </div>
      )}

      {/* Delivery Info */}
      <AnimatePresence mode="wait">
        {!loading && deliveryInfo && (
          <motion.div
            key="delivery-info"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {/* Result Card */}
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Delivering to</span>
                </div>
                <span className="text-sm font-medium">
                  {deliveryInfo.county}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Delivery fee</span>
                </div>
                <span
                  className={`text-sm font-bold ${
                    deliveryInfo.isFree
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-foreground'
                  }`}
                >
                  {deliveryInfo.isFree
                    ? 'FREE'
                    : formatCurrency(deliveryInfo.cost)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Est. delivery</span>
                </div>
                <span className="text-sm font-medium">
                  {deliveryInfo.days}
                </span>
              </div>
            </div>

            {/* Free Delivery Tip */}
            {remainingForFree > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20"
              >
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                    Free delivery tip
                  </p>
                  <p className="text-xs text-amber-700/70 dark:text-amber-400/70">
                    Add {formatCurrency(remainingForFree)} more to get{' '}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      FREE delivery
                    </span>{' '}
                    across Kenya!
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state before selecting */}
      {!loading && !deliveryInfo && !selectedCounty && subtotal > 0 && (
        <p className="text-xs text-muted-foreground">
          Select your county to calculate delivery costs
        </p>
      )}
    </div>
  )
}
