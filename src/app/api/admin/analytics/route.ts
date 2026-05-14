import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Execute all independent queries in parallel for better performance
    const [
      totalOrders,
      totalProducts,
      totalRevenue,
      totalCustomers,
      recentOrders,
      topProducts,
      lowStock,
      ordersByStatus,
      revenueByMonth,
    ] = await Promise.all([
      db.order.count(),
      db.product.count(),
      db.order.aggregate({ _sum: { total: true } }),
      db.order.groupBy({ by: ['email'], _count: true }),
      db.order.findMany({
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      db.product.findMany({
        orderBy: { rating: 'desc' },
        take: 5,
        include: { category: true },
      }),
      db.product.findMany({
        where: { stock: { lte: 5 } },
        orderBy: { stock: 'asc' },
        take: 10,
      }),
      db.order.groupBy({
        by: ['status'],
        _count: true,
      }),
      db.$queryRaw<Array<{ month: string; total: number }>>`
        SELECT strftime('%Y-%m', createdAt) as month, SUM(total) as total
        FROM "Order"
        GROUP BY strftime('%Y-%m', createdAt)
        ORDER BY month DESC
        LIMIT 6
      `,
    ])

    return NextResponse.json({
      totalOrders,
      totalProducts,
      totalRevenue: totalRevenue._sum.total || 0,
      totalCustomers: totalCustomers.length,
      recentOrders,
      topProducts,
      lowStock,
      ordersByStatus,
      revenueByMonth,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
