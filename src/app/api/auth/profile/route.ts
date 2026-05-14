import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

// Cache for user data to reduce redundant database queries
const userCache = new Map<string, { user: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('mfp_auth')?.value
  if (!userId) return null
  
  // Check cache first
  const cached = userCache.get(userId)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.user
  }
  
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
  })
  
  // Update cache
  if (user) {
    userCache.set(userId, { user, timestamp: Date.now() })
  }
  
  return user
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone } = body

    // Check email uniqueness if changing
    if (email && email !== user.email) {
      const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } })
      if (existing) {
        return NextResponse.json({ error: 'This email is already in use' }, { status: 409 })
      }
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(email ? { email: email.toLowerCase() } : {}),
        ...(phone !== undefined ? { phone: phone || null } : {}),
      },
      select: { id: true, email: true, name: true, phone: true, role: true },
    })

    // Invalidate cache on update
    userCache.delete(user.id)

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
