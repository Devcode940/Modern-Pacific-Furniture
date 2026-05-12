import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const totalOrders = await db.order.count()
    const totalProducts = await db.product.count()
    const totalRevenue = await db.order.aggregate({ _sum: { total: true } })
    const totalCustomers = await db.order.groupBy({ by: ['email'], _count: true })

    const recentOrders = await db.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    const topProducts = await db.product.findMany({
      orderBy: { rating: 'desc' },
      take: 5,
      include: { category: true },
    })

    const lowStock = await db.product.findMany({
      where: { stock: { lte: 5 } },
      orderBy: { stock: 'asc' },
      take: 10,
    })

    const ordersByStatus = await db.order.groupBy({
      by: ['status'],
      _count: true,
    })

    const revenueByMonth = await db.$queryRaw<Array<{ month: string; total: number }>>`
      SELECT strftime('%Y-%m', createdAt) as month, SUM(total) as total
      FROM "Order"
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month DESC
      LIMIT 6
    `

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
