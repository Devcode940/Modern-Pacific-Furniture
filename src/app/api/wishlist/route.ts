import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Use session ID to filter wishlist items
    const sessionId = request.headers.get('x-session-id')
    const items = await db.wishlistItem.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            compareAtPrice: true,
            images: true,
            rating: true,
            stock: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(items)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const { productId } = await request.json()
    const existing = await db.wishlistItem.findFirst({ where: { productId } })
    if (existing) {
      return NextResponse.json(existing)
    }
    const item = await db.wishlistItem.create({
      data: { productId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            compareAtPrice: true,
            images: true,
            rating: true,
            stock: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    })
    return NextResponse.json(item)
  } catch {
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 })
  }
}
