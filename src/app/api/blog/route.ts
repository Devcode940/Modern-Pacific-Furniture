import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const posts = await db.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, author: true, tags: true, createdAt: true },
    })
    return NextResponse.json(posts)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
