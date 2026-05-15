import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { loginSchema } from '@/lib/validators'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
const COOKIE_NAME = 'mfp_auth_token'

interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input using Zod schema
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }
    
    const { email, password } = validationResult.data
    
    // Handle logout action
    if (body.action === 'logout') {
      const cookieStore = await cookies()
      cookieStore.delete(COOKIE_NAME)
      return NextResponse.json({ success: true })
    }

    // Rate limiting check (simple in-memory, use Redis in production)
    const rateLimitKey = `rate_limit:${email}`
    const now = Date.now()
    const windowMs = 15 * 60 * 1000 // 15 minutes
    const maxAttempts = 5

    // Simple rate limiting using global Map (use Redis for production)
    const globalForRateLimit = globalThis as unknown as {
      rateLimitMap?: Map<string, { count: number; resetTime: number }>
    }
    
    if (!globalForRateLimit.rateLimitMap) {
      globalForRateLimit.rateLimitMap = new Map()
    }

    const rateLimitEntry = globalForRateLimit.rateLimitMap.get(rateLimitKey)
    if (rateLimitEntry) {
      if (now > rateLimitEntry.resetTime) {
        globalForRateLimit.rateLimitMap.set(rateLimitKey, { count: 1, resetTime: now + windowMs })
      } else if (rateLimitEntry.count >= maxAttempts) {
        const retryAfter = Math.ceil((rateLimitEntry.resetTime - now) / 1000)
        return NextResponse.json(
          { error: `Too many login attempts. Try again in ${retryAfter} seconds` },
          { status: 429 }
        )
      } else {
        globalForRateLimit.rateLimitMap.set(rateLimitKey, {
          count: rateLimitEntry.count + 1,
          resetTime: rateLimitEntry.resetTime,
        })
      }
    } else {
      globalForRateLimit.rateLimitMap.set(rateLimitKey, { count: 1, resetTime: now + windowMs })
    }

    const user = await db.user.findUnique({ where: { email } })

    if (!user) {
      // Constant time response to prevent user enumeration
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50))
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Generate JWT token
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role || 'customer',
    }

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '30d',
      issuer: 'modern-furniture-pacific',
      audience: 'modern-furniture-pacific-users',
    })

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    // Clear any old cookie
    cookieStore.delete('mfp_auth')

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
