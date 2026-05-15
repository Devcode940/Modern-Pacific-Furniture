import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'

interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  // API routes: 100 requests per minute
  api: { windowMs: 60 * 1000, maxRequests: 100 },
  // Auth routes: 20 requests per minute
  auth: { windowMs: 60 * 1000, maxRequests: 20 },
  // Checkout: 10 requests per minute (prevent abuse)
  checkout: { windowMs: 60 * 1000, maxRequests: 10 },
}

// In-memory rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

function checkRateLimit(identifier: string, config: { windowMs: number; maxRequests: number }): {
  allowed: boolean
  retryAfter?: number
  remaining: number
} {
  const now = Date.now()
  const key = `rate_limit:${identifier}`
  
  const entry = rateLimitStore.get(key)
  
  if (!entry) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs })
    return { allowed: true, remaining: config.maxRequests - 1 }
  }
  
  if (now > entry.resetTime) {
    // Window expired, reset
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs })
    return { allowed: true, remaining: config.maxRequests - 1 }
  }
  
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return { allowed: false, retryAfter, remaining: 0 }
  }
  
  entry.count++
  rateLimitStore.set(key, entry)
  return { allowed: true, remaining: config.maxRequests - entry.count }
}

function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'modern-furniture-pacific',
      audience: 'modern-furniture-pacific-users',
    }) as JWTPayload
    return decoded
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  // Rate limiting for all API routes
  if (pathname.startsWith('/api/')) {
    let config = RATE_LIMIT_CONFIG.api
    
    if (pathname.startsWith('/api/auth')) {
      config = RATE_LIMIT_CONFIG.auth
    } else if (pathname.startsWith('/api/checkout')) {
      config = RATE_LIMIT_CONFIG.checkout
    }
    
    const result = checkRateLimit(`${ip}:${pathname}`, config)
    
    if (!result.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: result.retryAfter },
        { 
          status: 429,
          headers: {
            'Retry-After': String(result.retryAfter),
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': '0',
          }
        }
      )
    }
    
    // Add rate limit headers to response
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', String(config.maxRequests))
    response.headers.set('X-RateLimit-Remaining', String(result.remaining))
  }
  
  // Protect admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('mfp_auth_token')?.value
    
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    const payload = verifyJWT(token)
    
    if (!payload) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Check admin role
    if (payload.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Add user info to headers for API routes
    const response = NextResponse.next()
    response.headers.set('X-User-ID', payload.userId)
    response.headers.set('X-User-Role', payload.role)
    return response
  }
  
  // Protect user-specific API routes
  if (pathname.match(/^\/api\/(auth|wishlist|cart|orders)/)) {
    const token = request.cookies.get('mfp_auth_token')?.value
    
    if (token) {
      const payload = verifyJWT(token)
      if (payload) {
        const response = NextResponse.next()
        response.headers.set('X-User-ID', payload.userId)
        response.headers.set('X-User-Email', payload.email)
        return response
      }
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
  ],
}
