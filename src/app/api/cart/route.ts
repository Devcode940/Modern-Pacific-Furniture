import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get('x-session-id')
    if (!sessionId) {
      return NextResponse.json([], { status: 200 })
    }

    const cartItems = await db.cartItem.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: true,
      },
    })
    return NextResponse.json(cartItems)
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.headers.get('x-session-id')
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const { productId, quantity = 1 } = await request.json()

    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if item already in cart for this session
    const existingItem = await db.cartItem.findFirst({
      where: { productId, sessionId },
    })

    if (existingItem) {
      const updated = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      })
      return NextResponse.json(updated)
    }

    const cartItem = await db.cartItem.create({
      data: { productId, quantity, sessionId },
      include: { product: true },
    })

    return NextResponse.json(cartItem)
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}
