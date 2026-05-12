import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ points: 0, transactions: [] })
  }

  try {
    const transactions = await db.loyaltyTransaction.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' },
    })
    const totalPoints = transactions.reduce((sum, t) => sum + t.points, 0)
    return NextResponse.json({ points: totalPoints, transactions })
  } catch {
    return NextResponse.json({ points: 0, transactions: [] })
  }
}
