import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Get related products from the same category
    const relatedProducts = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 4,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    })

    return NextResponse.json({ product, relatedProducts })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { review } = body

    if (!review || !review.author || !review.rating) {
      return NextResponse.json(
        { error: 'review.author and review.rating are required' },
        { status: 400 }
      )
    }

    // Build photos JSON array
    let photosArray: string[] = []
    if (review.photo) {
      photosArray = [review.photo]
    }
    const photosJson = JSON.stringify(photosArray)

    // Create the review
    const newReview = await db.review.create({
      data: {
        productId: id,
        author: review.author,
        rating: review.rating,
        comment: review.comment || null,
        photos: photosJson,
        verified: false,
      },
    })

    // Recalculate product rating and review count
    const allReviews = await db.review.findMany({
      where: { productId: id },
    })

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0)
    const avgRating = allReviews.length > 0 ? totalRating / allReviews.length : 0

    await db.product.update({
      where: { id },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    })

    return NextResponse.json({ review: newReview }, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
