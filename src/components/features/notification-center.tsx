'use client'

import { useState } from 'react'
import { Bell, Package, Tag, Heart, TrendingDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type NotificationType = 'order' | 'promo' | 'wishlist' | 'price'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timeAgo: string
  read: boolean
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order Shipped!',
    message: 'Your Modena Sofa Set order #MFP-2847 has been shipped and is on its way to Nairobi.',
    timeAgo: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'promo',
    title: 'Flash Sale: 30% Off Living Room',
    message: 'This weekend only! Save big on sofas, coffee tables, and TV stands. Use code FLASH30.',
    timeAgo: '5 hours ago',
    read: false,
  },
  {
    id: '3',
    type: 'wishlist',
    title: 'Back in Stock: Copenhagen Sofa',
    message: 'The 7-seater corduroy sofa you wishlisted is now back in stock. Grab it before it sells out!',
    timeAgo: '1 day ago',
    read: false,
  },
  {
    id: '4',
    type: 'price',
    title: 'Price Drop on Mahogany Bed',
    message: 'The Crown Mahogany Queen Bed dropped from KSh 145,000 to KSh 119,000. Your wishlist item is cheaper!',
    timeAgo: '2 days ago',
    read: true,
  },
  {
    id: '5',
    type: 'order',
    title: 'Delivery Confirmed',
    message: 'Your dining set was successfully delivered to Westlands, Nairobi. Rate your experience!',
    timeAgo: '3 days ago',
    read: true,
  },
]

const typeConfig: Record<NotificationType, { icon: typeof Package; color: string; bg: string }> = {
  order: { icon: Package, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  promo: { icon: Tag, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  wishlist: { icon: Heart, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30' },
  price: { icon: TrendingDown, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-700 p-0 text-[10px] text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="px-4 pt-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Bell className="h-5 w-5 text-amber-700" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-amber-700 text-white hover:bg-amber-700">
                  {unreadCount} new
                </Badge>
              )}
            </SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-amber-700 hover:text-amber-800 dark:text-amber-500"
              >
                <Check className="mr-1 h-3 w-3" />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="flex flex-col gap-2 py-2">
            {notifications.map((notification) => {
              const config = typeConfig[notification.type]
              const Icon = config.icon
              return (
                <button
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                    notification.read
                      ? 'border-transparent bg-transparent opacity-70 hover:opacity-100'
                      : 'border-amber-100 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/10'
                  )}
                >
                  <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full', config.bg)}>
                    <Icon className={cn('h-4 w-4', config.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm font-medium leading-tight', !notification.read && 'text-amber-900 dark:text-amber-100')}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-600" />
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-1.5 text-[10px] font-medium text-muted-foreground/70">
                      {notification.timeAgo}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <Button
            variant="outline"
            className="w-full text-xs text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:text-amber-500 dark:hover:bg-amber-950/20"
          >
            View All Notifications
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
