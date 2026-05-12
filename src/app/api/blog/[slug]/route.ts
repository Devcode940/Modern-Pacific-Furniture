import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const post = await db.blogPost.findUnique({ where: { slug } })
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    return NextResponse.json(post)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
