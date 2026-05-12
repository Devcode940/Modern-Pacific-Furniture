import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const newsletterSchema = z.object({ email: z.string().email('Invalid email address') })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = newsletterSchema.parse(body)
    const newsletter = await db.newsletter.create({
      data: { email },
    })
    return NextResponse.json({ message: 'Subscribed successfully!', ...newsletter })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Already subscribed' }, { status: 200 })
    }
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
