import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase()
    const existing = await db.referral.findFirst({ where: { referrerEmail: email } })

    if (existing) {
      return NextResponse.json({ referralCode: existing.referralCode, message: 'You already have a referral code!' })
    }

    await db.referral.create({
      data: { referrerEmail: email, referralCode }
    })

    return NextResponse.json({ referralCode, message: 'Your referral code has been generated!' })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

    const referral = await db.referral.findUnique({ where: { referralCode: code } })
    if (!referral) return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })

    return NextResponse.json({ valid: true, rewardPoints: referral.rewardPoints })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
