import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ids = searchParams.get('ids')

  if (!ids) {
    return NextResponse.json([])
  }

  try {
    const products = await db.product.findMany({
      where: { id: { in: ids.split(',') } },
      include: { category: { select: { id: true, name: true, slug: true } } },
    })
    return NextResponse.json(products)
  } catch {
    return NextResponse.json([])
  }
}
