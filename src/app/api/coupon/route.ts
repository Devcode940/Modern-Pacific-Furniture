import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { code, cartTotal } = await request.json()
    const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } })

    if (!coupon) {
      return NextResponse.json({ valid: false, message: 'Invalid coupon code' })
    }
    if (!coupon.active) {
      return NextResponse.json({ valid: false, message: 'This coupon is no longer active' })
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json({ valid: false, message: 'This coupon has expired' })
    }
    if (coupon.usesLimit && coupon.usesCount >= coupon.usesLimit) {
      return NextResponse.json({ valid: false, message: 'This coupon has reached its usage limit' })
    }
    if (cartTotal < coupon.minOrder) {
      return NextResponse.json({ valid: false, message: `Minimum order of KSh ${coupon.minOrder.toLocaleString('en-KE')} required` })
    }

    let discount = 0
    if (coupon.type === 'percentage') {
      discount = (cartTotal * coupon.value) / 100
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
    } else {
      discount = coupon.value
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: Math.round(discount * 100) / 100,
      message: coupon.type === 'percentage' ? `${coupon.value}% off your order` : `KSh ${coupon.value.toLocaleString('en-KE')} off your order`,
    })
  } catch {
    return NextResponse.json({ valid: false, message: 'Failed to validate coupon' }, { status: 500 })
  }
}
