import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const styleProductMap: Record<string, string[]> = {
  modern: ['modern-walnut-coffee-table', 'ergonomic-standing-desk', 'modern-walnut-platform-bed', 'linen-upholstered-bed-frame', 'bamboo-organizer-shelf'],
  scandinavian: ['scandinavian-oak-sofa', 'walnut-nightstand-drawer', 'modular-wall-shelf-system'],
  industrial: ['modern-bookcase-ladder', 'counter-height-bar-stools'],
  rustic: ['solid-oak-dining-table', 'teak-garden-bench', 'amish-built-storage-cabinet'],
  glam: ['velvet-accent-chair', 'cloud-sectional-sofa'],
}

export async function GET() {
  try {
    const products = await db.product.findMany()
    return NextResponse.json(products)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const { answers } = await request.json()
    // Simple style scoring based on quiz answers
    const styleScores: Record<string, number> = {
      modern: 0,
      scandinavian: 0,
      industrial: 0,
      rustic: 0,
      glam: 0,
    }

    if (answers.color === 'neutral') { styleScores.modern += 2; styleScores.scandinavian += 1 }
    if (answers.color === 'warm') { styleScores.rustic += 2; styleScores.glam += 1 }
    if (answers.color === 'bold') { styleScores.glam += 2; styleScores.industrial += 1 }

    if (answers.material === 'wood') { styleScores.scandinavian += 2; styleScores.rustic += 1 }
    if (answers.material === 'metal') { styleScores.industrial += 2; styleScores.modern += 1 }
    if (answers.material === 'fabric') { styleScores.glam += 2; styleScores.scandinavian += 1 }

    if (answers.space === 'minimal') { styleScores.scandinavian += 2; styleScores.modern += 1 }
    if (answers.space === 'cozy') { styleScores.rustic += 2; styleScores.glam += 1 }
    if (answers.space === 'bold') { styleScores.industrial += 2; styleScores.modern += 1 }

    const topStyle = Object.entries(styleScores).sort((a, b) => b[1] - a[1])[0][0]
    const recommendedSlugs = styleProductMap[topStyle] || styleProductMap.modern

    const products = await db.product.findMany({
      where: { slug: { in: recommendedSlugs } },
      include: { category: { select: { id: true, name: true, slug: true } } },
    })

    return NextResponse.json({
      style: topStyle,
      scores: styleScores,
      products,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 })
  }
}
