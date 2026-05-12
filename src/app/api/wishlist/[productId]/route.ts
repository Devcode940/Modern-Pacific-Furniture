import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    await db.wishlistItem.deleteMany({ where: { productId } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 })
  }
}
