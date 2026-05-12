'use client'

import { useState, useEffect } from 'react'
import { Gift, Copy, Share2, Check, Users, PartyPopper, Mail, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { useStore } from '@/store/use-store'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function ReferralPage() {
  const { sessionId, navigate } = useStore()
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [codeCopied, setCodeCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    // Try to get existing referral code
    if (sessionId) {
      fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'session-' + sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.referralCode) setReferralCode(data.referralCode)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [sessionId])

  const handleGenerateCode = async () => {
    if (!email) {
      toast.error('Please enter your email address')
      return
    }
    try {
      const res = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setReferralCode(data.referralCode)
        toast.success(data.message)
      } else {
        toast.error(data.error || 'Failed to generate code')
      }
    } catch {
      toast.error('Something went wrong')
    }
  }

  const copyCode = () => {
    if (!referralCode) return
    navigator.clipboard.writeText(referralCode).then(() => {
      setCodeCopied(true)
      toast.success('Referral code copied!')
      setTimeout(() => setCodeCopied(false), 2000)
    })
  }

  const copyLink = () => {
    const link = `${window.location.origin}?ref=${referralCode}`
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true)
      toast.success('Referral link copied!')
      setTimeout(() => setLinkCopied(false), 2000)
    })
  }

  const shareWhatsApp = () => {
    const text = `Shop premium furniture at Modern Furniture Pacific! Use my referral code ${referralCode} to earn ${formatCurrency(2000)} reward points on your first purchase.`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const shareEmail = () => {
    const subject = 'Join Modern Furniture Pacific & Earn Rewards!'
    const body = `Hi!\n\nI wanted to invite you to check out Modern Furniture Pacific — they have amazing premium furniture at great prices.\n\nUse my referral code: ${referralCode}\n\nYou'll earn ${formatCurrency(2000)} in reward points on your first purchase!\n\nHappy shopping!`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const steps = [
    {
      icon: Share2,
      title: 'Share Your Code',
      description: 'Share your unique referral code with friends and family via any channel.',
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    },
    {
      icon: Users,
      title: 'Friend Signs Up',
      description: 'When your friend makes their first purchase using your code, they get rewarded too.',
      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    },
    {
      icon: PartyPopper,
      title: 'Both Earn Rewards',
      description: `You both receive ${formatCurrency(2000)} in reward points that can be used on future purchases.`,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-700 via-amber-800 to-stone-900 p-8 text-white"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Gift className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Invite Friends, Earn {formatCurrency(2000)}</h1>
              <p className="text-amber-200 mt-1">Share the love of great furniture with your friends</p>
            </div>
          </div>
          <p className="text-amber-100 text-sm max-w-lg">
            For every friend who makes a purchase, you both earn {formatCurrency(2000)} in reward points. 
            There&apos;s no limit to how many friends you can refer!
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-12 h-40 w-40 rounded-full bg-white/5" />
      </motion.div>

      {/* Referral Code */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Referral Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!referralCode && !loading && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Enter your email to generate your unique referral code.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button
                    onClick={handleGenerateCode}
                    className="bg-amber-700 hover:bg-amber-800"
                  >
                    Generate Code
                  </Button>
                </div>
              </div>
            )}
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-700 border-t-transparent" />
                Loading your referral code...
              </div>
            )}
            {referralCode && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-lg border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 px-6 py-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Your Code</p>
                    <p className="text-3xl font-bold tracking-[0.3em] text-amber-700 dark:text-amber-400">
                      {referralCode}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 shrink-0"
                    onClick={copyCode}
                  >
                    {codeCopied ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Share this code with your friends. When they use it, you both earn {formatCurrency(2000)}!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Share Buttons */}
      {referralCode && (
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Share Via</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Button
                  variant="outline"
                  className="gap-2 h-auto py-3"
                  onClick={copyLink}
                >
                  {linkCopied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 h-auto py-3 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-300"
                  onClick={shareWhatsApp}
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 h-auto py-3"
                  onClick={shareEmail}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 h-auto py-3"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Modern Furniture Pacific - Referral',
                        text: `Use my code ${referralCode} for ${formatCurrency(2000)} off!`,
                        url: window.location.origin,
                      }).catch(() => {})
                    } else {
                      copyLink()
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  More
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* How It Works */}
      <motion.div variants={item}>
        <h2 className="text-xl font-bold mb-4">How It Works</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="text-center h-full">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex justify-center">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${step.color}`}>
                      <step.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="secondary" className="text-xs">Step {index + 1}</Badge>
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Referral Stats */}
      <motion.div variants={item}>
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{formatCurrency(2000)}</p>
                <p className="text-xs text-muted-foreground mt-1">Reward Per Referral</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">Unlimited</p>
                <p className="text-xs text-muted-foreground mt-1">Referrals Allowed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">365 Days</p>
                <p className="text-xs text-muted-foreground mt-1">Points Validity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA */}
      <motion.div variants={item} className="text-center pb-4">
        <p className="text-sm text-muted-foreground mb-3">
          Ready to explore more? Check out our latest collections and deals.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            onClick={() => navigate('shop')}
            className="bg-amber-700 hover:bg-amber-800"
          >
            Browse Furniture
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('bundles')}
          >
            View Bundle Deals
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
