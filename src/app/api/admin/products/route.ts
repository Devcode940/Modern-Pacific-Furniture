import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const products = await db.product.findMany({
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const product = await db.product.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: body.description,
        price: body.price,
        compareAtPrice: body.compareAtPrice || null,
        images: body.images || '[]',
        specs: body.specs || null,
        categoryId: body.categoryId,
        stock: body.stock || 0,
        featured: body.featured || false,
        rating: 0,
        reviewCount: 0,
        tags: body.tags || null,
        material: body.material || null,
        style: body.style || null,
        colors: body.colors || null,
        dimensions: body.dimensions || null,
        weight: body.weight || null,
      },
      include: { category: true },
    })
    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const product = await db.product.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        compareAtPrice: body.compareAtPrice,
        stock: body.stock,
        featured: body.featured,
        categoryId: body.categoryId,
        tags: body.tags,
        material: body.material,
        style: body.style,
        colors: body.colors,
        dimensions: body.dimensions,
        weight: body.weight,
        images: body.images,
        specs: body.specs,
      },
      include: { category: true },
    })
    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
