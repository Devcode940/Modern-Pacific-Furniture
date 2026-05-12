'use client'

import { useState } from 'react'
import { Armchair, Mail, Shield, Truck, RotateCcw, BadgeCheck, Package, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useStore } from '@/store/use-store'
import { toast } from 'sonner'

const footerLinks = {
  about: [
    { label: 'Our Story', href: '#' },
    { label: 'Craftsmanship', href: '#' },
    { label: 'Sustainability', href: '#' },
    { label: 'Careers', href: '#' },
  ],
  categories: [
    { label: 'Living Room', href: '#' },
    { label: 'Bedroom', href: '#' },
    { label: 'Dining Tables', href: '#' },
    { label: 'TV Stands', href: '#' },
    { label: 'Mattresses', href: '#' },
    { label: 'Coffee Tables', href: '#' },
  ],
  service: [
    { label: 'Shipping & Returns', href: '#' },
    { label: 'Assembly Help', href: '#' },
    { label: 'Care Guide', href: '#' },
    { label: 'FAQ', href: '#' },
    { label: 'Contact Us', href: '#' },
  ],
  extras: [
    { label: 'Blog', href: 'blog' },
    { label: 'Refer a Friend', href: 'referral' },
    { label: 'Bundle Deals', href: 'bundles' },
    { label: 'Track Order', href: 'order-tracking' },
    { label: 'Loyalty Rewards', href: 'loyalty' },
    { label: 'Size Calculator', href: 'calculator' },
    { label: 'Design Quiz', href: 'quiz' },
  ],
}

export function SiteFooter() {
  const { navigate } = useStore()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleCategoryClick = (label: string) => {
    const slugMap: Record<string, string> = {
      'Living Room': 'living-room',
      'Bedroom': 'bedroom',
      'Dining Tables': 'dining-tables',
      'TV Stands': 'tv-stands',
      'Mattresses': 'mattresses',
      'Coffee Tables': 'coffee-tables',
    }
    const slug = slugMap[label] || label.toLowerCase().replace(/ /g, '-')
    navigate('shop', { category: slug })
  }

  return (
    <footer className="border-t bg-muted/30 pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* About Column */}
          <div>
            <button
              onClick={() => navigate('home')}
              className="mb-4 flex items-center gap-2"
            >
              <Armchair className="h-5 w-5 text-amber-700" />
              <span className="text-lg font-bold">
                Modern Furniture <span className="text-amber-700">Pacific</span>
              </span>
            </button>
            <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
              Premium quality furniture for every room in your home. Based in Kenya, delivering comfort and style across the region.
            </p>
            <p className="text-sm text-muted-foreground">Est. 2020</p>
          </div>

          {/* Categories Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Categories
            </h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleCategoryClick(link.label)}
                    className="text-sm text-muted-foreground transition-colors hover:text-amber-700"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Customer Service
            </h3>
            <ul className="space-y-2">
              {footerLinks.service.map((link) => (
                <li key={link.label}>
                  <span className="cursor-default text-sm text-muted-foreground">
                    {link.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {footerLinks.extras.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.href as any)}
                    className="text-sm text-muted-foreground transition-colors hover:text-amber-700"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Stay Connected
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Subscribe for exclusive offers, design tips, and new arrivals.
            </p>
            {subscribed ? (
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                ✓ Thank you for subscribing!
              </p>
            ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!email) return
                fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
                  .then(r => r.json())
                  .then(data => { toast.success(data.message || 'Subscribed successfully!'); setSubscribed(true); setEmail('') })
                  .catch(() => toast.error('Failed to subscribe'))
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 pl-9"
                />
              </div>
              <Button
                type="submit"
                className="bg-amber-700 hover:bg-amber-800 shrink-0"
                size="sm"
              >
                Subscribe
              </Button>
            </form>
            )}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Trust Badges Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-6">
          {[
            { icon: Shield, label: 'Secure Payment' },
            { icon: Truck, label: 'Free Delivery' },
            { icon: RotateCcw, label: '30-Day Returns' },
            { icon: BadgeCheck, label: 'Quality Guaranteed' },
            { icon: Package, label: 'Free Assembly' },
            { icon: Headphones, label: '24/7 Support' },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 text-muted-foreground">
              <badge.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{badge.label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Modern Furniture Pacific. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
