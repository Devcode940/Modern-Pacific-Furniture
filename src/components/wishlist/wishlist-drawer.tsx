'use client'

import { useState, useEffect } from 'react'
import { Heart, ShoppingCart, Star, X, ShoppingBag, Link2, MessageCircle, Mail, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, type WishlistItemType } from '@/store/use-store'
import { toast } from 'sonner'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { formatCurrency } from '@/lib/utils'

export function WishlistDrawer() {
  const {
    wishlist,
    wishlistOpen,
    setWishlistOpen,
    toggleWishlistItem,
    navigate,
    addToCartOptimistic,
    wishlistCount,
    sessionId,
  } = useStore()

  const [items, setItems] = useState<WishlistItemType[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (wishlistOpen && items.length === 0) {
      let cancelled = false
      fetch('/api/wishlist')
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) {
            setItems(data || [])
            useStore.getState().setWishlist(data || [])
            setLoading(false)
          }
        })
        .catch(() => {
          if (!cancelled) setLoading(false)
        })
      return () => { cancelled = true }
    }
  }, [wishlistOpen, items.length])

  const displayItems = wishlist.length > 0 ? wishlist : items

  const handleRemove = (productId: string) => {
    toggleWishlistItem(productId)
    setItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  const handleAddToCart = async (item: WishlistItemType) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
        body: JSON.stringify({ productId: item.productId, quantity: 1 }),
      })
      const cartItem = await res.json()
      addToCartOptimistic(cartItem)
      toast.success(`${item.product.name} added to cart!`)
    } catch {
      toast.error('Failed to add to cart')
    }
  }

  const handleMoveAllToCart = async () => {
    const allItems = displayItems
    let successCount = 0
    for (const item of allItems) {
      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
          body: JSON.stringify({ productId: item.productId, quantity: 1 }),
        })
        const cartItem = await res.json()
        addToCartOptimistic(cartItem)
        successCount++
      } catch {
        // continue with other items
      }
    }
    if (successCount > 0) {
      toast.success(`${successCount} item${successCount !== 1 ? 's' : ''} moved to cart!`)
    }
  }

  const buildShareText = () => {
    const lines = displayItems.map(
      (item) => `• ${item.product.name} - ${formatCurrency(item.product.price)}`
    )
    return `🪑 My Furniture Wishlist - Modern Furniture Pacific\n\n${lines.join('\n')}\n\nBrowse these items at modernfurniturepacific.com`
  }

  const getShareUrl = () => {
    if (typeof window === 'undefined') return ''
    const ids = displayItems.map((item) => item.productId).join(',')
    const encoded = btoa(ids)
    return `${window.location.origin}${window.location.pathname}?wishlist=${encoded}`
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl())
      toast.success('Link copied!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(buildShareText())
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener')
  }

  const handleShareEmail = () => {
    const subject = encodeURIComponent('My Furniture Wishlist - Modern Furniture Pacific')
    const body = encodeURIComponent(buildShareText())
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const handleShareTelegram = () => {
    const text = encodeURIComponent(buildShareText())
    window.open(`https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${text}`, '_blank', 'noopener')
  }

  const getImage = (item: WishlistItemType) => {
    try {
      const images = JSON.parse(item.product.images) as string[]
      return images[0] || null
    } catch {
      return null
    }
  }

  return (
    <Sheet open={wishlistOpen} onOpenChange={setWishlistOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-amber-700 dark:text-amber-500" />
            Wishlist ({wishlistCount})
          </SheetTitle>
        </SheetHeader>

        {displayItems.length === 0 && !loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30"
            >
              <Heart className="h-10 w-10 text-amber-700/50 dark:text-amber-500/50" />
            </motion.div>
            <div>
              <p className="font-semibold text-stone-900 dark:text-stone-100">
                Your wishlist is empty
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Save your favorite pieces here for later
              </p>
            </div>
            <Button
              className="mt-2 bg-amber-700 hover:bg-amber-800 text-white"
              onClick={() => {
                setWishlistOpen(false)
                navigate('shop')
              }}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Explore Products
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              {loading ? (
                <div className="space-y-4 py-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
                        <div className="h-3 w-1/4 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
                        <div className="h-8 w-24 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 py-4">
                  <AnimatePresence>
                    {displayItems.map((item) => {
                      const img = getImage(item)
                      return (
                        <motion.div
                          key={item.productId}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.25 }}
                          className="group overflow-hidden"
                        >
                          <div className="flex gap-3 rounded-lg border border-stone-200 p-3 transition-shadow hover:shadow-sm dark:border-stone-700">
                            <div
                              className="relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800"
                              onClick={() => {
                                setWishlistOpen(false)
                                navigate('product', { productId: item.productId })
                              }}
                            >
                              {img ? (
                                <img
                                  src={img}
                                  alt={item.product.name}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-lg text-muted-foreground/30">
                                  🪑
                                </div>
                              )}
                            </div>

                            <div className="flex flex-1 flex-col justify-between min-w-0">
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <h4
                                      className="cursor-pointer truncate text-sm font-semibold leading-tight text-stone-900 hover:text-amber-700 dark:text-stone-100 dark:hover:text-amber-500 transition-colors"
                                      onClick={() => {
                                        setWishlistOpen(false)
                                        navigate('product', { productId: item.productId })
                                      }}
                                    >
                                      {item.product.name}
                                    </h4>
                                    <div className="mt-0.5 flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                      <span className="text-xs text-muted-foreground">
                                        {item.product.rating}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleRemove(item.productId)}
                                    className="shrink-0 rounded-full p-1 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-2 mt-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-amber-700 dark:text-amber-500">
                                    {formatCurrency(item.product.price)}
                                  </span>
                                  {item.product.compareAtPrice && (
                                    <span className="text-xs text-muted-foreground line-through">
                                      {formatCurrency(item.product.compareAtPrice)}
                                    </span>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  className="h-7 bg-amber-700 hover:bg-amber-800 text-white text-xs px-3"
                                  onClick={() => handleAddToCart(item)}
                                >
                                  <ShoppingCart className="mr-1 h-3 w-3" />
                                  Add
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </ScrollArea>

            {displayItems.length > 0 && (
              <div className="border-t pt-4">
                {/* Share Wishlist Row */}
                <div className="mb-3 flex items-center justify-center gap-1">
                  <span className="mr-2 text-xs font-medium text-muted-foreground">Share</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleCopyLink}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30 dark:hover:text-amber-500"
                      >
                        <Link2 className="h-4 w-4" />
                        <span className="sr-only">Copy Link</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={8}>Copy Link</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleShareWhatsApp}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30 dark:hover:text-amber-500"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="sr-only">Share via WhatsApp</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={8}>WhatsApp</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleShareEmail}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30 dark:hover:text-amber-500"
                      >
                        <Mail className="h-4 w-4" />
                        <span className="sr-only">Share via Email</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={8}>Email</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleShareTelegram}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30 dark:hover:text-amber-500"
                      >
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Share via Telegram</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={8}>Telegram</TooltipContent>
                  </Tooltip>
                </div>

                <Button
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white"
                  size="lg"
                  onClick={handleMoveAllToCart}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Move All to Cart
                </Button>
                <Button
                  variant="ghost"
                  className="mt-2 w-full text-stone-600 dark:text-stone-400"
                  onClick={() => {
                    setWishlistOpen(false)
                    navigate('shop')
                  }}
                >
                  Continue Shopping
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
