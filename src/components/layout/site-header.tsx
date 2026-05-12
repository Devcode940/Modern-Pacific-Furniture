'use client'

import { useState, useEffect, useRef } from 'react'
import { Armchair, Search, ShoppingCart, Menu, X, Heart, Settings, User, Gift, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from 'next-themes'
import { useStore } from '@/store/use-store'
import { useAuthStore } from '@/store/auth-store'
import { cn } from '@/lib/utils'
import { SmartSearch } from '@/components/shop/smart-search'
import { MegaMenu } from '@/components/layout/mega-menu'
import { LanguageSwitcher } from '@/components/features/language-switcher'
import { NotificationCenter } from '@/components/features/notification-center'
import { SocialLogin } from '@/components/features/social-login'

export function SiteHeader() {
  const {
    navigate,
    cartCount,
    setCartOpen,
    currentView,
    wishlistOpen,
    wishlistCount,
    setWishlistOpen,
  } = useStore()
  const { user, signInOpen, setSignInOpen, logout, fetchProfile } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // Keyboard shortcut: Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector<HTMLInputElement>('[data-smart-search-input]')
        searchInput?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSignOut = async () => {
    await logout()
    navigate('home')
  }

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : ''

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Armchair className="h-6 w-6 text-amber-700" />
          <span className="text-xl font-bold tracking-tight">
            Modern Furniture <span className="text-amber-700">Pacific</span>
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <button
            onClick={() => navigate('home')}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-amber-700',
              currentView === 'home' ? 'text-amber-700' : 'text-muted-foreground'
            )}
          >
            Home
          </button>

          <MegaMenu />

          <button
            onClick={() => navigate('bundles')}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-amber-700',
              currentView === 'bundles' ? 'text-amber-700' : 'text-muted-foreground'
            )}
          >
            Bundle Deals
          </button>
          <button
            onClick={() => navigate('order-tracking')}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-amber-700',
              currentView === 'order-tracking' ? 'text-amber-700' : 'text-muted-foreground'
            )}
          >
            Track Order
          </button>
          <button
            onClick={() => navigate('loyalty')}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-amber-700',
              currentView === 'loyalty' ? 'text-amber-700' : 'text-muted-foreground'
            )}
          >
            Rewards
          </button>
          <button
            onClick={() => navigate('blog')}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-amber-700',
              currentView === 'blog' || currentView === 'blog-post' ? 'text-amber-700' : 'text-muted-foreground'
            )}
          >
            Blog
          </button>
          <button
            onClick={() => navigate('videos')}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-amber-700',
              currentView === 'videos' ? 'text-amber-700' : 'text-muted-foreground'
            )}
          >
            Videos
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {/* SmartSearch - Desktop */}
          <div className="hidden lg:block">
            <SmartSearch />
          </div>

          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 lg:hidden"
            onClick={() => {
              setMobileMenuOpen(true)
            }}
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9"
            >
              {theme === 'dark' ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          {/* Language Switcher */}
          {mounted && <LanguageSwitcher />}

          {/* Notification Center */}
          {mounted && <NotificationCenter />}

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWishlistOpen(true)}
            className="relative h-9 w-9"
          >
            <Heart className={cn('h-4 w-4', wishlistCount > 0 ? 'fill-amber-700 text-amber-700 dark:fill-amber-500 dark:text-amber-500' : '')} />
            {wishlistCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-700 p-0 text-[10px] text-white">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </Badge>
            )}
            <span className="sr-only">Wishlist</span>
          </Button>

          {/* Cart Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCartOpen(true)}
            className="relative h-9 w-9"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-700 p-0 text-[10px] text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </Badge>
            )}
            <span className="sr-only">Cart</span>
          </Button>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden h-9 w-9 sm:flex"
                  title="My Account"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                    {userInitials}
                  </div>
                  <span className="sr-only">My Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('account')}>
                  <User className="mr-2 h-4 w-4" />
                  My Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('order-tracking')}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Track Order
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSignInOpen(true)}
              className="hidden h-9 w-9 sm:flex"
              title="Sign In"
            >
              <User className="h-4 w-4" />
              <span className="sr-only">Sign In</span>
            </Button>
          )}

          {/* Admin Link - visible only to admin users */}
          {user?.role === 'admin' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('admin')}
              className="hidden h-9 w-9 text-muted-foreground transition-colors hover:text-amber-700 sm:flex"
              title="Admin Dashboard"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Admin</span>
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex flex-col gap-6 pt-6">
                <button
                  onClick={() => {
                    navigate('home')
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-2"
                >
                  <Armchair className="h-6 w-6 text-amber-700" />
                  <span className="text-lg font-bold">
                    Modern Furniture <span className="text-amber-700">Pacific</span>
                  </span>
                </button>

                <nav className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      navigate('home')
                      setMobileMenuOpen(false)
                    }}
                    className="rounded-lg px-3 py-2.5 text-left text-base font-medium transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/20"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => {
                      navigate('shop')
                      setMobileMenuOpen(false)
                    }}
                    className="rounded-lg px-3 py-2.5 text-left text-base font-medium transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/20"
                  >
                    Shop All
                  </button>
                  <button
                    onClick={() => {
                      navigate('quiz')
                      setMobileMenuOpen(false)
                    }}
                    className="rounded-lg px-3 py-2.5 text-left text-base font-medium transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/20"
                  >
                    Design Quiz
                  </button>
                  <button
                    onClick={() => {
                      navigate('visualizer')
                      setMobileMenuOpen(false)
                    }}
                    className="rounded-lg px-3 py-2.5 text-left text-base font-medium transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/20"
                  >
                    Room Visualizer
                  </button>
                  <button
                    onClick={() => {
                      navigate('calculator')
                      setMobileMenuOpen(false)
                    }}
                    className="rounded-lg px-3 py-2.5 text-left text-base font-medium transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/20"
                  >
                    Size Calculator
                  </button>
                  <button
                    onClick={() => {
                      navigate('bundles')
                      setMobileMenuOpen(false)
                    }}
                    className="rounded-lg px-3 py-2.5 text-left text-base font-medium transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/20"
                  >
                    Bundle Deals
                  </button>
                  <button
                    onClick={() => {
                      navigate('order-tracking')
                      setMobileMenuOpen(false)
                    }}
                    className="rounded-lg px-3 py-2.5 text-left text-base font-medium transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/20"
                  >
                    Track Order
                  </button>
                  <button
                    onClick={() => {
                      navigate('loyalty')
                      setMobileMenuOpen(false)
                    }}
                    className="rounded-lg px-3 py-2.5 text-left text-base font-medium transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/20"
                  >
                    Rewards
                  </button>
                  <button
                    onClick={() => {
                      navigate('blog')
                      setMobileMenuOpen(false)
                    }}
                    className="rounded-lg px-3 py-2.5 text-left text-base font-medium transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/20"
                  >
                    Blog
                  </button>
                  <button
                    onClick={() => {
                      navigate('referral')
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-base font-medium transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/20"
                  >
                    <Gift className="h-4 w-4" />
                    Refer a Friend
                  </button>

                  <div className="my-2 border-t" />

                  <button
                    onClick={() => {
                      setWishlistOpen(true)
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-base font-medium transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/20"
                  >
                    <Heart className="h-4 w-4" />
                    Wishlist
                    {wishlistCount > 0 && (
                      <Badge className="ml-auto bg-amber-700 text-white hover:bg-amber-700">
                        {wishlistCount}
                      </Badge>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setCartOpen(true)
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-base font-medium transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/20"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Cart
                    {cartCount > 0 && (
                      <Badge className="ml-auto bg-amber-700 text-white hover:bg-amber-700">
                        {cartCount}
                      </Badge>
                    )}
                  </button>

                  <div className="my-2 border-t" />

                  {user ? (
                    <>
                      <button
                        onClick={() => {
                          navigate('account')
                          setMobileMenuOpen(false)
                        }}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-base font-medium transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/20"
                      >
                        <User className="h-4 w-4" />
                        My Account
                      </button>
                      <button
                        onClick={() => {
                          handleSignOut()
                          setMobileMenuOpen(false)
                        }}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-base font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setSignInOpen(true)
                        setMobileMenuOpen(false)
                      }}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-base font-medium transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/20"
                    >
                      <User className="h-4 w-4" />
                      Sign In
                    </button>
                  )}

                  {user?.role === 'admin' && (
                    <button
                      onClick={() => {
                        navigate('admin')
                        setMobileMenuOpen(false)
                      }}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/20"
                    >
                      <Settings className="h-4 w-4" />
                      Admin Dashboard
                    </button>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Sign In Dialog */}
      <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-amber-700" />
              {signInOpen ? 'Welcome' : 'Sign In'}
            </DialogTitle>
            <DialogDescription>
              Sign in or create an account to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            <SocialLogin />
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
