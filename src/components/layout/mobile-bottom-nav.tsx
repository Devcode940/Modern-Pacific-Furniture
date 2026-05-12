'use client'

import { Home, ShoppingBag, Heart, ShoppingCart, Ruler, Settings } from 'lucide-react'
import { useStore } from '@/store/use-store'
import { cn } from '@/lib/utils'

export function MobileBottomNav() {
  const { currentView, navigate, cartCount, wishlistCount, setWishlistOpen, setCartOpen } = useStore()

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      action: () => navigate('home'),
    },
    {
      id: 'shop',
      label: 'Shop',
      icon: ShoppingBag,
      action: () => navigate('shop'),
    },
    {
      id: 'calculator',
      label: 'Size Check',
      icon: Ruler,
      action: () => navigate('calculator'),
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      badge: wishlistCount,
      action: () => setWishlistOpen(true),
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingCart,
      badge: cartCount,
      action: () => setCartOpen(true),
    },
  ]

  const isActive = (id: string) => {
    if (id === 'home' && currentView === 'home') return true
    if (id === 'shop' && (currentView === 'shop' || currentView === 'product')) return true
    if (id === 'calculator' && currentView === 'calculator') return true
    return false
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/95 backdrop-blur-lg md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.id)
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors',
                active
                  ? 'text-amber-700 dark:text-amber-500'
                  : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'h-5 w-5 transition-all',
                    active && 'scale-110',
                    item.id === 'wishlist' && wishlistCount > 0 && !active && 'fill-stone-400'
                  )}
                />
                {item.badge > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-700 px-1 text-[9px] font-bold text-white">
                    {item.badge > 99 ? '99' : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[10px] font-medium',
                active ? 'text-amber-700 dark:text-amber-500' : ''
              )}>
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-amber-700 dark:bg-amber-500" />
              )}
            </button>
          )
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
