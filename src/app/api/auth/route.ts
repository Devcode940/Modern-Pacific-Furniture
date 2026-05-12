import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, password } = body

    // Handle logout
    if (action === 'logout') {
      const cookieStore = await cookies()
      cookieStore.delete('mfp_auth')
      return NextResponse.json({ success: true })
    }

    // Handle login
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set('mfp_auth', user.id, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    })

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
