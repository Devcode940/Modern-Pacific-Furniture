import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
const COOKIE_NAME = 'mfp_auth_token'

interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    
    if (error) {
      return NextResponse.redirect(new URL('/login?error=google_auth_failed', request.url))
    }
    
    if (!code) {
      // Redirect to Google OAuth
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      googleAuthUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID || '')
      googleAuthUrl.searchParams.set(
        'redirect_uri',
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`
      )
      googleAuthUrl.searchParams.set('response_type', 'code')
      googleAuthUrl.searchParams.set('scope', 'email profile')
      googleAuthUrl.searchParams.set('access_type', 'offline')
      googleAuthUrl.searchParams.set('prompt', 'consent')
      
      return NextResponse.redirect(googleAuthUrl.toString())
    }
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`,
      }),
    })
    
    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens')
    }
    
    const tokenData = await tokenResponse.json()
    const idToken = tokenData.id_token
    
    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    })
    
    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info')
    }
    
    const userInfo = await userInfoResponse.json()
    const { email, name, picture } = userInfo
    
    // Check if user exists or create new user
    let user = await db.user.findUnique({ where: { email } })
    
    if (!user) {
      // Create new user
      user = await db.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          password: Math.random().toString(36).slice(-8), // Random password for OAuth users
          role: 'customer',
        },
      })
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
    
    // Redirect to home page or dashboard
    return NextResponse.redirect(new URL('/', request.url))
  } catch (error) {
    console.error('Google auth error:', error)
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
  }
}
