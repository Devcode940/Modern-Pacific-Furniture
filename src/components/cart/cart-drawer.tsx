'use client'

import { ShoppingCart, Minus, Plus, Trash2, Truck, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { useStore, type CartItemType } from '@/store/use-store'
import { toast } from 'sonner'
import { cn, formatCurrency } from '@/lib/utils'

const FREE_SHIPPING_THRESHOLD = 50000

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, navigate, updateCartItemOptimistic, removeFromCartOptimistic, cartTotal, cartCount, sessionId } = useStore()

  const handleUpdateQuantity = async (item: CartItemType, newQuantity: number) => {
    if (newQuantity < 1) return
    try {
      const res = await fetch(`/api/cart/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
        body: JSON.stringify({ quantity: newQuantity }),
      })
      const updated = await res.json()
      updateCartItemOptimistic(item.id, updated.quantity)
    } catch {
      toast.error('Failed to update quantity')
    }
  }

  const handleRemove = async (item: CartItemType) => {
    try {
      await fetch(`/api/cart/${item.id}`, { method: 'DELETE' })
      removeFromCartOptimistic(item.id)
      toast.success('Item removed from cart')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const freeShippingProgress = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const amountRemaining = Math.max(FREE_SHIPPING_THRESHOLD - cartTotal, 0)
  const hasFreeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart ({cartCount} items)
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
            <div>
              <p className="font-semibold">Your cart is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add some beautiful furniture to get started!
              </p>
            </div>
            <Button
              className="bg-amber-700 hover:bg-amber-800"
              onClick={() => {
                setCartOpen(false)
                navigate('shop')
              }}
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Free Shipping Progress Bar */}
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
              <div className="mb-2 flex items-center gap-2">
                {hasFreeShipping ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                ) : (
                  <Truck className="h-4 w-4 text-amber-700 dark:text-amber-500" />
                )}
                <p className="text-xs font-medium">
                  {hasFreeShipping ? (
                    <span className="text-emerald-700 dark:text-emerald-400">
                      🎉 You&apos;ve earned free shipping!
                    </span>
                  ) : (
                    <span className="text-amber-800 dark:text-amber-300">
                      You&apos;re <span className="font-bold">{formatCurrency(amountRemaining)}</span> away from free shipping!
                    </span>
                  )}
                </p>
              </div>
              <Progress
                value={freeShippingProgress}
                className={cn(
                  'h-2',
                  hasFreeShipping
                    ? '[&>div]:bg-emerald-500'
                    : '[&>div]:bg-amber-700 dark:[&>div]:bg-amber-500'
                )}
              />
              {!hasFreeShipping && (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Add {formatCurrency(amountRemaining)} more to get free shipping on orders over KSh 50,000
                </p>
              )}
            </div>

            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {cart.map((item) => {
                  const images: string[] = (() => { try { return JSON.parse(item.product.images) } catch { return [] } })()
                  return (
                    <div key={item.id} className="flex gap-4 rounded-lg border p-3">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {images[0] ? (
                          <img
                            src={images[0]}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg text-muted-foreground/30">
                            🪑
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-semibold leading-tight">
                              {item.product.name}
                            </h4>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {item.product.category.name}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-red-500"
                            onClick={() => handleRemove(item)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center rounded border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-r-none"
                              onClick={() =>
                                handleUpdateQuantity(item, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="flex h-7 w-8 items-center justify-center text-xs font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-l-none"
                              onClick={() =>
                                handleUpdateQuantity(item, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-semibold text-amber-700 dark:text-amber-500">
                            {formatCurrency(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Subtotal</span>
                <span className="text-amber-700 dark:text-amber-500">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
              {hasFreeShipping ? (
                <div className="mt-1 flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Free shipping included!
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  Shipping calculated at checkout
                </p>
              )}
              <Button
                className="mt-4 w-full bg-amber-700 text-base hover:bg-amber-800"
                size="lg"
                onClick={() => {
                  setCartOpen(false)
                  navigate('checkout')
                }}
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="ghost"
                className="mt-2 w-full"
                onClick={() => {
                  setCartOpen(false)
                  navigate('shop')
                }}
              >
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
