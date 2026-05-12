'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  Menu,
  X,
} from 'lucide-react'
import { useStore } from '@/store/use-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { AnalyticsView } from './analytics-view'
import { ProductsManagement } from './products-management'
import { OrdersManagement } from './orders-management'

interface AnalyticsData {
  totalOrders: number
  totalProducts: number
  totalRevenue: number
  totalCustomers: number
  recentOrders: any[]
  topProducts: any[]
  lowStock: any[]
  ordersByStatus: any[]
  revenueByMonth: any[]
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
]

export function AdminDashboard() {
  const { adminTab, setAdminTab, navigate } = useStore()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const stats = [
    {
      label: 'Total Revenue',
      value: analytics ? `KSh ${analytics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'KSh 0.00',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Total Orders',
      value: analytics ? analytics.totalOrders.toString() : '0',
      icon: ShoppingCart,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Total Products',
      value: analytics ? analytics.totalProducts.toString() : '0',
      icon: Package,
      color: 'text-stone-600',
      bg: 'bg-stone-100',
    },
    {
      label: 'Total Customers',
      value: analytics ? analytics.totalCustomers.toString() : '0',
      icon: Users,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
  ]

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-700 text-white">
                <TrendingUp className="size-4" />
              </div>
              <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Modern Furniture Pacific <span className="text-amber-700">Admin</span>
              </h1>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('home')}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to Store</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto flex gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-30 w-64 transform border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 pt-20 transition-transform duration-300 md:relative md:z-0 md:block md:w-64 md:flex-shrink-0 md:translate-x-0 md:border md:pt-0 md:shadow-none',
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          )}
        >
          <div className="flex h-full flex-col gap-6 p-4">
            {/* Stats Summary */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Overview
              </h3>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse rounded-lg bg-stone-100 h-16" />
                  ))}
                </div>
              ) : (
                stats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border-stone-200 dark:border-stone-700 py-3 shadow-none">
                        <CardContent className="flex items-center gap-3 px-4 py-0">
                          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', stat.bg)}>
                            <Icon className={cn('size-5', stat.color)} />
                          </div>
                          <div>
                            <p className="text-xs text-stone-500">{stat.label}</p>
                            <p className="text-lg font-bold text-stone-900 dark:text-stone-100">{stat.value}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })
              )}
            </div>

            {/* Tab Navigation */}
            <nav className="mt-auto space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
                Management
              </h3>
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = adminTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setAdminTab(tab.id)
                      setSidebarOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-amber-700 text-white shadow-sm'
                        : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
                    )}
                  >
                    <Icon className="size-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          <Card className="border-stone-200 dark:border-stone-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-stone-900 dark:text-stone-100">
                {tabs.find((t) => t.id === adminTab)?.label || 'Dashboard'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {adminTab === 'dashboard' && (
                <AnalyticsView data={analytics} loading={loading} />
              )}
              {adminTab === 'products' && <ProductsManagement />}
              {adminTab === 'orders' && <OrdersManagement />}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
