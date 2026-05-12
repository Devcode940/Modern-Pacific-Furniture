import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

const checkoutSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  phone: z.string().min(7, 'Phone number is required'),
  couponCode: z.string().optional(),
})

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `MFP-${timestamp}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = checkoutSchema.parse(body)

    const sessionId = request.headers.get('x-session-id')
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Check if user is logged in
    const cookieStore = await cookies()
    const userId = cookieStore.get('mfp_auth')?.value || null

    // Get cart items for this session
    const cartItems = await db.cartItem.findMany({
      where: { sessionId },
      include: { product: true },
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Calculate subtotal
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )

    // Handle coupon discount
    let discount = 0
    let couponCode: string | undefined = undefined
    let couponId: string | undefined = undefined

    if (validated.couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: validated.couponCode },
      })

      if (coupon && coupon.active) {
        // Check expiry
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
          return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 })
        }
        // Check usage limit
        if (coupon.usesLimit && coupon.usesCount >= coupon.usesLimit) {
          return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })
        }
        // Check minimum order
        if (subtotal < coupon.minOrder) {
          return NextResponse.json(
            { error: `Minimum order of KSh ${coupon.minOrder.toLocaleString('en-KE')} required for this coupon` },
            { status: 400 }
          )
        }

        if (coupon.type === 'percentage') {
          discount = Math.round((subtotal * coupon.value) / 100)
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount
          }
        } else {
          discount = coupon.value
        }

        couponCode = coupon.code
        couponId = coupon.id
      } else {
        return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 })
      }
    }

    const total = Math.max(0, subtotal - discount)
    const pointsEarned = Math.floor(total / 100)

    // Check stock and collect items to order
    const itemsToOrder: { productId: string; name: string; price: number; quantity: number }[] = []
    const warnings: string[] = []

    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        warnings.push(`${item.product.name}: only ${item.product.stock} in stock (requested ${item.quantity})`)
        if (item.product.stock <= 0) {
          continue // Skip out-of-stock items
        }
        itemsToOrder.push({
          productId: item.productId,
          name: item.product.name,
          price: item.product.price,
          quantity: item.product.stock, // Reduce to available stock
        })
      } else {
        itemsToOrder.push({
          productId: item.productId,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })
      }
    }

    if (itemsToOrder.length === 0) {
      return NextResponse.json({ error: 'No items available in stock' }, { status: 400 })
    }

    // Recalculate totals based on available items
    const finalSubtotal = itemsToOrder.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    let finalDiscount = 0
    if (couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: couponCode } })
      if (coupon) {
        if (coupon.type === 'percentage') {
          finalDiscount = Math.round((finalSubtotal * coupon.value) / 100)
          if (coupon.maxDiscount && finalDiscount > coupon.maxDiscount) {
            finalDiscount = coupon.maxDiscount
          }
        } else {
          finalDiscount = Math.min(coupon.value, finalSubtotal)
        }
      }
    }
    const finalTotal = Math.max(0, finalSubtotal - finalDiscount)
    const finalPoints = Math.floor(finalTotal / 100)

    const orderNumber = generateOrderNumber()

    // Use transaction for atomicity
    const order = await db.$transaction(async (tx) => {
      // Create order with nested items
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          email: validated.email,
          firstName: validated.firstName,
          lastName: validated.lastName,
          address: validated.address,
          city: validated.city,
          phone: validated.phone,
          couponCode,
          discount: finalDiscount,
          pointsEarned: finalPoints,
          total: finalTotal,
          ...(userId ? { userId } : {}),
          items: {
            create: itemsToOrder.map((item) => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      })

      // Decrement stock for ordered items
      for (const item of itemsToOrder) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      // Increment coupon usesCount
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usesCount: { increment: 1 } },
        })
      }

      // Create loyalty transaction
      if (finalPoints > 0) {
        await tx.loyaltyTransaction.create({
          data: {
            email: validated.email,
            points: finalPoints,
            description: `Earned ${finalPoints} points from order ${orderNumber}`,
            orderId: newOrder.id,
          },
        })
      }

      // Clear cart for this session
      await tx.cartItem.deleteMany({ where: { sessionId } })

      return newOrder
    })

    return NextResponse.json({
      order,
      warnings: warnings.length > 0 ? warnings : undefined,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Error processing checkout:', error)
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 })
  }
}
