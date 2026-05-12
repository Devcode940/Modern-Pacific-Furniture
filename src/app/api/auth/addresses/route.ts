import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

async function getCurrentUserId() {
  const cookieStore = await cookies()
  return cookieStore.get('mfp_auth')?.value || null
}

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const addresses = await db.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ addresses })
  } catch (error) {
    console.error('Addresses fetch error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { label, street, city, county, isDefault } = body

    if (!street || !city || !county) {
      return NextResponse.json({ error: 'Street, city, and county are required' }, { status: 400 })
    }

    // If this is default, unset other defaults
    if (isDefault) {
      await db.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }

    const address = await db.address.create({
      data: {
        userId,
        label: label || 'Home',
        street,
        city,
        county,
        isDefault: isDefault || false,
      },
    })

    return NextResponse.json({ address }, { status: 201 })
  } catch (error) {
    console.error('Address create error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { id, label, street, city, county, isDefault } = body

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 })
    }

    // Verify ownership
    const existing = await db.address.findFirst({ where: { id, userId } })
    if (!existing) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // If setting as default, unset others
    if (isDefault) {
      await db.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }

    const address = await db.address.update({
      where: { id },
      data: {
        ...(label ? { label } : {}),
        ...(street ? { street } : {}),
        ...(city ? { city } : {}),
        ...(county ? { county } : {}),
        ...(isDefault !== undefined ? { isDefault } : {}),
      },
    })

    return NextResponse.json({ address })
  } catch (error) {
    console.error('Address update error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 })
    }

    // Verify ownership
    const existing = await db.address.findFirst({ where: { id, userId } })
    if (!existing) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    await db.address.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Address delete error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
