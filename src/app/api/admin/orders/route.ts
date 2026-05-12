import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const orders = await db.order.findMany({
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json()
    const order = await db.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    })
    return NextResponse.json(order)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
