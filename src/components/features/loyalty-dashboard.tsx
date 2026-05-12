'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Award,
  Gift,
  TrendingUp,
  Star,
  ShoppingBag,
  Truck,
  Percent,
  Info,
  CheckCircle2,
  History,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import { useStore } from '@/store/use-store'
import { Skeleton } from '@/components/ui/skeleton'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface LoyaltyTransaction {
  id: string
  email: string
  points: number
  description: string
  orderId: string | null
  createdAt: string
}

interface LoyaltyData {
  points: number
  transactions: LoyaltyTransaction[]
}

/* ------------------------------------------------------------------ */
/*  Tier helpers                                                       */
/* ------------------------------------------------------------------ */

type TierKey = 'Bronze' | 'Silver' | 'Gold' | 'Platinum'

interface TierConfig {
  name: TierKey
  min: number
  max: number
  color: string
  bg: string
  border: string
  iconBg: string
  badgeClass: string
  progressTrack: string
}

const TIERS: TierConfig[] = [
  {
    name: 'Bronze',
    min: 0,
    max: 999,
    color: 'text-amber-700 dark:text-amber-500',
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-200 dark:border-amber-700',
    progressTrack: 'bg-amber-200 dark:bg-amber-800',
  },
  {
    name: 'Silver',
    min: 1000,
    max: 4999,
    color: 'text-gray-700 dark:text-gray-300',
    bg: 'bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900/40 dark:to-slate-800/30',
    border: 'border-gray-300 dark:border-gray-600',
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    badgeClass: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600',
    progressTrack: 'bg-gray-200 dark:bg-gray-700',
  },
  {
    name: 'Gold',
    min: 5000,
    max: 9999,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/40 dark:to-amber-950/30',
    border: 'border-yellow-300 dark:border-yellow-700',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',
    badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
    progressTrack: 'bg-yellow-200 dark:bg-yellow-800',
  },
  {
    name: 'Platinum',
    min: 10000,
    max: Infinity,
    color: 'text-slate-700 dark:text-slate-200',
    bg: 'bg-gradient-to-br from-slate-50 to-zinc-100 dark:from-slate-900/60 dark:to-zinc-900/40',
    border: 'border-slate-300 dark:border-slate-600',
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    badgeClass: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600',
    progressTrack: 'bg-slate-200 dark:bg-slate-700',
  },
]

function getTierConfig(points: number): TierConfig {
  if (points >= 10000) return TIERS[3]
  if (points >= 5000) return TIERS[2]
  if (points >= 1000) return TIERS[1]
  return TIERS[0]
}

function getNextTier(points: number): TierConfig | null {
  if (points >= 10000) return null
  if (points >= 5000) return TIERS[3]
  if (points >= 1000) return TIERS[2]
  return TIERS[1]
}

function getTierProgress(points: number): number {
  const current = getTierConfig(points)
  const next = getNextTier(points)
  if (!next) return 100
  const range = next.min - current.min
  const progress = points - current.min
  return Math.min(100, Math.round((progress / range) * 100))
}

/* ------------------------------------------------------------------ */
/*  Rewards catalog                                                    */
/* ------------------------------------------------------------------ */

interface Reward {
  id: string
  points: number
  title: string
  description: string
  icon: React.ReactNode
}

const REWARDS: Reward[] = [
  {
    id: 'r1',
    points: 500,
    title: formatCurrency(500) + ' Off',
    description: 'Discount on your next order',
    icon: <Percent className="h-5 w-5" />,
  },
  {
    id: 'r2',
    points: 1000,
    title: 'Free Delivery',
    description: 'Free delivery voucher for one order',
    icon: <Truck className="h-5 w-5" />,
  },
  {
    id: 'r3',
    points: 2500,
    title: formatCurrency(2500) + ' Off',
    description: 'Bigger discount on your next purchase',
    icon: <Gift className="h-5 w-5" />,
  },
  {
    id: 'r4',
    points: 5000,
    title: formatCurrency(5000) + ' Off + Free Delivery',
    description: 'Premium reward — max savings!',
    icon: <Star className="h-5 w-5" />,
  },
]

/* ------------------------------------------------------------------ */
/*  How it works steps                                                 */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    step: 1,
    icon: <ShoppingBag className="h-5 w-5" />,
    title: 'Shop',
    description: 'Browse and purchase furniture from our curated collections.',
  },
  {
    step: 2,
    icon: <TrendingUp className="h-5 w-5" />,
    title: 'Earn Points',
    description: 'Earn 1 point for every KSh 100 spent on qualifying orders.',
  },
  {
    step: 3,
    icon: <Award className="h-5 w-5" />,
    title: 'Level Up',
    description: 'Climb through Bronze, Silver, Gold, and Platinum tiers.',
  },
  {
    step: 4,
    icon: <Gift className="h-5 w-5" />,
    title: 'Redeem Rewards',
    description: 'Convert your points into discounts, free delivery, and more.',
  },
]

/* ------------------------------------------------------------------ */
/*  Animations                                                         */
/* ------------------------------------------------------------------ */

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: 'easeOut' },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function LoyaltyDashboard() {
  const { sessionId } = useStore()
  const [data, setData] = useState<LoyaltyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')

  /* Fetch loyalty data */
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const params = email ? `?email=${encodeURIComponent(email)}` : ''
        const res = await fetch(`/api/loyalty${params}`)
        if (!cancelled) {
          const json: LoyaltyData = await res.json()
          setData(json)
        }
      } catch {
        if (!cancelled) setData({ points: 0, transactions: [] })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [email])

  /* Derived state */
  const tier = useMemo(() => getTierConfig(data?.points ?? 0), [data?.points])
  const nextTier = useMemo(() => getNextTier(data?.points ?? 0), [data?.points])
  const progress = useMemo(() => getTierProgress(data?.points ?? 0), [data?.points])
  const transactions = data?.transactions ?? []

  /* Formatted date helper */
  function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-8 pb-8">
      {/* ─── Page Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tier.iconBg}`}>
          <Award className={`h-6 w-6 ${tier.color}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Loyalty Rewards</h2>
          <p className="text-sm text-muted-foreground">
            Earn points with every purchase and unlock exclusive rewards
          </p>
        </div>
      </motion.div>

      {/* ─── 1. Points Balance Card ─── */}
      {loading ? (
        <Card className={tier.border}>
          <CardContent className="p-6">
            <Skeleton className="h-16 w-48 mb-4" />
            <Skeleton className="h-4 w-full max-w-xs mb-2" />
            <Skeleton className="h-3 w-64" />
          </CardContent>
        </Card>
      ) : (
        <motion.div custom={0} variants={fadeInUp} initial="hidden" animate="visible">
          <Card className={`relative overflow-hidden ${tier.bg} ${tier.border}`}>
            {/* Decorative circles */}
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-amber-200/30 dark:bg-amber-700/10" />
            <div className="absolute -right-4 bottom-2 h-24 w-24 rounded-full bg-amber-300/20 dark:bg-amber-600/10" />

            <CardContent className="relative p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                {/* Left: Points & Tier */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Your Balance</p>
                    <Badge className={tier.badgeClass}>
                      <Award className="mr-1 h-3 w-3" />
                      {tier.name}
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <motion.span
                      key={data?.points ?? 0}
                      initial={{ scale: 1.15, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="text-5xl font-extrabold tracking-tight md:text-6xl"
                    >
                      {data?.points?.toLocaleString() ?? '0'}
                    </motion.span>
                    <span className="text-lg font-semibold text-muted-foreground">pts</span>
                  </div>

                  {/* Progress bar to next tier */}
                  <div className="max-w-xs space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{tier.name}</span>
                      {nextTier ? (
                        <span>
                          {data?.points?.toLocaleString()} / {nextTier.min.toLocaleString()} pts to{' '}
                          {nextTier.name}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Max tier reached
                        </span>
                      )}
                    </div>
                    {nextTier && (
                      <Progress
                        value={progress}
                        className={`h-2.5 ${tier.progressTrack}`}
                      />
                    )}
                  </div>
                </div>

                {/* Right: Tier badges */}
                <div className="hidden sm:block">
                  <div className="flex items-center gap-2">
                    {TIERS.map((t) => (
                      <div
                        key={t.name}
                        className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all ${
                          t.name === tier.name
                            ? `${t.iconBg} ring-2 ring-amber-400/60 dark:ring-amber-500/40`
                            : 'opacity-40'
                        }`}
                      >
                        <Award className={`h-4 w-4 ${t.color}`} />
                        <span className="text-[10px] font-semibold">{t.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ─── Grid: History + Rewards ─── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* ─── 2. Points History Table (3 cols) ─── */}
        <motion.div
          custom={1}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="lg:col-span-3"
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <CardTitle className="text-lg">Points History</CardTitle>
              </div>
              <CardDescription>Your recent loyalty point transactions</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-4 p-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/30">
                    <History className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">No transactions yet</p>
                    <p className="text-xs text-muted-foreground">
                      Start shopping to earn loyalty points!
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1"
                    onClick={() => useStore.getState().navigate('shop')}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Browse Furniture
                  </Button>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <th className="px-6 py-3">Description</th>
                        <th className="px-4 py-3 text-center">Points</th>
                        <th className="hidden px-4 py-3 text-right sm:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 20).map((tx, i) => (
                        <motion.tr
                          key={tx.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.3 }}
                          className="border-b last:border-0 transition-colors hover:bg-muted/30"
                        >
                          <td className="px-6 py-3.5">
                            <p className="font-medium leading-tight">{tx.description}</p>
                            {tx.orderId && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                Order #{tx.orderId}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <Badge
                              variant={tx.points >= 0 ? 'default' : 'destructive'}
                              className={`font-mono text-xs ${
                                tx.points >= 0
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-0'
                                  : ''
                              }`}
                            >
                              {tx.points >= 0 ? '+' : ''}
                              {tx.points}
                            </Badge>
                          </td>
                          <td className="hidden px-4 py-3.5 text-right text-xs text-muted-foreground sm:table-cell">
                            {formatDate(tx.createdAt)}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── 3. Rewards Catalog (2 cols) ─── */}
        <motion.div
          custom={2}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <CardTitle className="text-lg">Rewards Catalog</CardTitle>
              </div>
              <CardDescription>Redeem your points for these rewards</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-4 space-y-3">
              {REWARDS.map((reward, i) => {
                const canRedeem = (data?.points ?? 0) >= reward.points
                return (
                  <motion.div
                    key={reward.id}
                    custom={i}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className={`group relative flex items-center gap-4 rounded-xl border p-4 transition-all ${
                      canRedeem
                        ? 'border-amber-200 bg-amber-50/50 hover:border-amber-300 hover:shadow-sm dark:border-amber-800 dark:bg-amber-950/20 dark:hover:border-amber-700'
                        : 'border-muted bg-muted/20 opacity-70'
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        canRedeem
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {reward.icon}
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{reward.title}</p>
                        {canRedeem && (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {reward.description}
                      </p>
                    </div>

                    {/* Points badge */}
                    <Badge
                      variant="outline"
                      className={`shrink-0 font-mono text-xs ${
                        canRedeem
                          ? 'border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-400'
                          : ''
                      }`}
                    >
                      {reward.points.toLocaleString()} pts
                    </Badge>
                  </motion.div>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── 4. How It Works ─── */}
      <motion.div
        custom={3}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-lg">How It Works</CardTitle>
            </div>
            <CardDescription>Start earning rewards in 4 simple steps</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.step}
                  custom={i}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Connector line (not on last item) */}
                  {i < STEPS.length - 1 && (
                    <div className="absolute -right-3 top-7 hidden h-0.5 w-6 bg-gradient-to-r from-amber-300 to-amber-100 dark:from-amber-700 dark:to-amber-900/40 lg:block" />
                  )}

                  {/* Step number + icon */}
                  <div className="relative mb-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                      {step.icon}
                    </div>
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white dark:bg-amber-500">
                      {step.step}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold">{step.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Email lookup (optional: for demo/testing) ─── */}
      <motion.div
        custom={4}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-dashed">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Looking up a specific customer&rsquo;s points?</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 sm:w-64"
              />
              {email && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-xs text-muted-foreground"
                  onClick={() => setEmail('')}
                >
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
