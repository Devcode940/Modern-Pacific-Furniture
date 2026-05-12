'use client'

import { motion } from 'framer-motion'
import {
  DollarSign,
  ShoppingCart,
  Calculator,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Star,
  ArrowUpRight,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface AnalyticsViewProps {
  data: any
  loading: boolean
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#d97706',
  processing: '#6b7280',
  shipped: '#0d9488',
  delivered: '#059669',
  cancelled: '#dc2626',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

export function AnalyticsView({ data, loading }: AnalyticsViewProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-500">
        Unable to load analytics data.
      </div>
    )
  }

  const avgOrderValue =
    data.totalOrders > 0
      ? data.totalRevenue / data.totalOrders
      : 0

  const kpis = [
    {
      label: 'Total Revenue',
      value: `KSh ${data.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true,
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      trendColor: 'text-emerald-600',
    },
    {
      label: 'Total Orders',
      value: data.totalOrders.toString(),
      icon: ShoppingCart,
      trend: '+8.2%',
      trendUp: true,
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      trendColor: 'text-amber-600',
    },
    {
      label: 'Avg. Order Value',
      value: `KSh ${avgOrderValue.toFixed(2)}`,
      icon: Calculator,
      trend: '-2.1%',
      trendUp: false,
      bg: 'bg-stone-100',
      iconColor: 'text-stone-600',
      trendColor: 'text-red-500',
    },
    {
      label: 'Customers',
      value: data.totalCustomers.toString(),
      icon: Users,
      trend: '+15.3%',
      trendUp: true,
      bg: 'bg-teal-50',
      iconColor: 'text-teal-600',
      trendColor: 'text-teal-600',
    },
  ]

  const revenueData = [...(data.revenueByMonth || [])].reverse().map((item: any) => ({
    month: item.month,
    total: item.total,
  }))

  const statusData = (data.ordersByStatus || []).map((item: any) => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item._count,
    color: STATUS_COLORS[item.status] || '#9ca3af',
  }))

  const statusBadgeColor: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    processing: 'bg-stone-100 text-stone-700 border-stone-200',
    shipped: 'bg-teal-100 text-teal-800 border-teal-200',
    delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <motion.div
              key={kpi.label}
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: index * 0.1 }}
            >
              <Card className="border-stone-200 py-4 shadow-none hover:shadow-md transition-shadow">
                <CardContent className="px-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-stone-500">{kpi.label}</p>
                      <p className="mt-1 text-2xl font-bold text-stone-900">{kpi.value}</p>
                    </div>
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', kpi.bg)}>
                      <Icon className={cn('size-5', kpi.iconColor)} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {kpi.trendUp ? (
                      <TrendingUp className="size-3.5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="size-3.5 text-red-500" />
                    )}
                    <span className={cn('text-xs font-medium', kpi.trendColor)}>
                      {kpi.trend}
                    </span>
                    <span className="text-xs text-stone-400">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.3 }} className="lg:col-span-2">
          <Card className="border-stone-200 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-stone-900">
                <DollarSign className="size-5 text-emerald-600" />
                Revenue by Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#d97706" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: '#78716c' }}
                        axisLine={{ stroke: '#e7e5e4' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#78716c' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `KSh ${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e7e5e4',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}
                        formatter={(value: number) => [
                          `KSh ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                          'Revenue',
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#d97706"
                        strokeWidth={2}
                        fill="url(#amberGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-400">
                    No revenue data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders by Status Pie */}
        <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.4 }}>
          <Card className="border-stone-200 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-stone-900">
                <ShoppingCart className="size-5 text-amber-600" />
                Orders by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e7e5e4',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-400">
                    No order data
                  </div>
                )}
              </div>
              {/* Legend */}
              <div className="mt-2 space-y-1.5">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-stone-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-stone-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.5 }}>
          <Card className="border-stone-200 shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-stone-900">Recent Orders</CardTitle>
                <ArrowUpRight className="size-4 text-stone-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="pb-2 text-left font-medium text-stone-500">Order</th>
                      <th className="pb-2 text-left font-medium text-stone-500">Customer</th>
                      <th className="pb-2 text-right font-medium text-stone-500">Total</th>
                      <th className="pb-2 text-right font-medium text-stone-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {(data.recentOrders || []).map((order: any) => (
                      <tr key={order.id} className="hover:bg-stone-50">
                        <td className="py-2.5 font-medium text-stone-900">
                          #{order.orderNumber || order.id.slice(-6)}
                        </td>
                        <td className="py-2.5 text-stone-600">
                          {order.firstName} {order.lastName}
                        </td>
                        <td className="py-2.5 text-right text-stone-900">
                          KSh {order.total?.toFixed(2)}
                        </td>
                        <td className="py-2.5 text-right">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              statusBadgeColor[order.status] || 'bg-stone-100 text-stone-600 border-stone-200'
                            )}
                          >
                            {STATUS_LABELS[order.status] || order.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Low Stock + Top Products */}
        <div className="space-y-6">
          {/* Low Stock Alert */}
          <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.55 }}>
            <Card className="border-stone-200 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-stone-900">
                  <AlertTriangle className="size-5 text-orange-500" />
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(data.lowStock || []).length === 0 ? (
                  <p className="text-sm text-stone-500">All products are well stocked!</p>
                ) : (
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {(data.lowStock || []).map((product: any) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between rounded-lg bg-orange-50 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                            product.stock === 0
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          )}>
                            {product.stock}
                          </div>
                          <span className="text-sm font-medium text-stone-700">
                            {product.name}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs text-orange-700 border-orange-200 hover:bg-orange-100"
                          onClick={() => {}}
                        >
                          Restock
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Products */}
          <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.6 }}>
            <Card className="border-stone-200 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-stone-900">
                  <Star className="size-5 text-amber-500" />
                  Top Rated Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(data.topProducts || []).map((product: any, index: number) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-stone-900">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-1">
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs text-stone-500">
                            {product.rating.toFixed(1)} · {product.reviewCount} reviews
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-stone-900">
                        KSh {product.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
