import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { sessionId } = await request.json()
    if (!sessionId) return NextResponse.json({ error: 'Session required' }, { status: 400 })

    const existing = await db.helpfulVote.findFirst({ where: { reviewId: id, sessionId } })
    if (existing) return NextResponse.json({ message: 'You already voted', voted: true })

    await db.helpfulVote.create({ data: { reviewId: id, sessionId } })
    await db.review.update({ where: { id }, data: { helpful: { increment: 1 } } })

    const review = await db.review.findUnique({ where: { id }, select: { helpful: true } })
    return NextResponse.json({ helpful: review?.helpful || 0, message: 'Thanks for your feedback!' })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
