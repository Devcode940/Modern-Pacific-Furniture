import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { productId, email } = await request.json()
    if (!productId || !email) return NextResponse.json({ error: 'Product ID and email required' }, { status: 400 })
    const existing = await db.waitlistEntry.findFirst({ where: { productId, email } })
    if (existing) return NextResponse.json({ message: 'You are already on the waitlist for this product' })
    await db.waitlistEntry.create({ data: { productId, email } })
    return NextResponse.json({ message: 'You will be notified when this product is back in stock!' })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
