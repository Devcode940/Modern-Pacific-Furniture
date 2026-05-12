'use client'

import { useState, useEffect } from 'react'
import { Package, RefreshCw, Search, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface OrderItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  orderNumber: string
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  phone: string
  couponCode: string | null
  discount: number
  pointsEarned: number
  total: number
  status: string
  createdAt: string
  items: OrderItem[]
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400' },
  processing: { label: 'Processing', color: 'text-stone-700', bg: 'bg-stone-100 dark:bg-stone-800 dark:text-stone-300' },
  shipped: { label: 'Shipped', color: 'text-orange-700', bg: 'bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400' },
  delivered: { label: 'Delivered', color: 'text-emerald-700', bg: 'bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100 dark:bg-red-900/30 dark:text-red-400' },
}

const allStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      setOrders(data || [])
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })
      const updated = await res.json()
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? updated : o))
        )
        toast.success(`Order status updated to ${newStatus}`)
      } else {
        toast.error('Failed to update order status')
      }
    } catch {
      toast.error('Failed to update order status')
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      order.firstName.toLowerCase().includes(q) ||
      order.lastName.toLowerCase().includes(q) ||
      order.email.toLowerCase().includes(q) ||
      order.total.toString().includes(q) ||
      order.status.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {orders.length} total order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-56 pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            disabled={loading}
          >
            <RefreshCw className={cn('mr-2 h-3.5 w-3.5', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground/30" />
          <div>
            <p className="font-medium text-muted-foreground">No orders found</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              {searchQuery ? 'Try a different search term' : 'Orders will appear here when customers place them'}
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-50 dark:bg-stone-800/50">
                <TableHead className="text-xs font-semibold uppercase">Order #</TableHead>
                <TableHead className="text-xs font-semibold uppercase">Customer</TableHead>
                <TableHead className="text-xs font-semibold uppercase hidden sm:table-cell">Items</TableHead>
                <TableHead className="text-xs font-semibold uppercase">Total</TableHead>
                <TableHead className="text-xs font-semibold uppercase">Status</TableHead>
                <TableHead className="text-xs font-semibold uppercase hidden md:table-cell">Date</TableHead>
                <TableHead className="text-xs font-semibold uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.pending
                const itemCount = order.items?.length || 0
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-stone-900 dark:text-stone-100">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {order.firstName} {order.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{order.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-amber-700 dark:text-amber-500">
                      KSh {order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                        disabled={updatingId === order.id}
                      >
                        <SelectTrigger
                          className={cn(
                            'h-8 w-28 text-xs font-medium border-0 shadow-sm',
                            status.bg,
                            status.color
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allStatuses.map((s) => {
                            const cfg = statusConfig[s]
                            return (
                              <SelectItem key={s} value={s} className="text-sm">
                                <span className={cn('font-medium', cfg?.color)}>
                                  {cfg?.label || s}
                                </span>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(order.createdAt), 'MMM d, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">
                    {selectedOrder.firstName} {selectedOrder.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedOrder.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedOrder.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedOrder.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium">{selectedOrder.address}, {selectedOrder.city}</p>
                </div>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold">Items</p>
                  <div className="space-y-2 rounded-lg border p-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} × KSh {item.price}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          KSh {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1 rounded-lg border bg-stone-50 p-3 dark:bg-stone-800/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>KSh {(selectedOrder.total + selectedOrder.discount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">
                      Discount {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ''}
                    </span>
                    <span className="text-emerald-600">
                      -KSh {selectedOrder.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-amber-700 dark:text-amber-500">
                    KSh {selectedOrder.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge className={statusConfig[selectedOrder.status]?.bg || ''}>
                  {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
