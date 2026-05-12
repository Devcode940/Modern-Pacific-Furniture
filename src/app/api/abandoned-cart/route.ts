import { NextRequest, NextResponse } from 'next/server'

// In-memory store for demo abandoned cart stats
const abandonedCartEvents: Array<{
  sessionId: string
  itemCount: number
  total: number
  email: string | null
  timestamp: string
}> = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, itemCount, total, email } = body

    if (!sessionId || typeof itemCount !== 'number' || typeof total !== 'number') {
      return NextResponse.json(
        { error: 'sessionId, itemCount, and total are required' },
        { status: 400 }
      )
    }

    const event = {
      sessionId,
      itemCount,
      total,
      email: email || null,
      timestamp: new Date().toISOString(),
    }

    abandonedCartEvents.push(event)

    return NextResponse.json({
      success: true,
      message: 'Abandoned cart event recorded',
      event,
    })
  } catch (error) {
    console.error('Error recording abandoned cart:', error)
    return NextResponse.json(
      { error: 'Failed to record abandoned cart event' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const totalEvents = abandonedCartEvents.length
    const totalItems = abandonedCartEvents.reduce((sum, e) => sum + e.itemCount, 0)
    const totalValue = abandonedCartEvents.reduce((sum, e) => sum + e.total, 0)
    const uniqueSessions = new Set(abandonedCartEvents.map((e) => e.sessionId)).size
    const emailsProvided = abandonedCartEvents.filter((e) => e.email).length

    // Calculate recovery rate (how many sessions returned after abandonment)
    const sessionTimestamps = new Map<string, string[]>()
    for (const event of abandonedCartEvents) {
      const existing = sessionTimestamps.get(event.sessionId) || []
      existing.push(event.timestamp)
      sessionTimestamps.set(event.sessionId, existing)
    }
    const recoveredSessions = Array.from(sessionTimestamps.values()).filter(
      (timestamps) => timestamps.length > 1
    ).length
    const recoveryRate =
      uniqueSessions > 0 ? Math.round((recoveredSessions / uniqueSessions) * 100) : 0

    return NextResponse.json({
      stats: {
        totalEvents,
        totalItems,
        totalValue,
        uniqueSessions,
        emailsProvided,
        recoveredSessions,
        recoveryRate,
        averageCartValue: totalEvents > 0 ? Math.round(totalValue / totalEvents) : 0,
        recentEvents: abandonedCartEvents.slice(-10).reverse(),
      },
    })
  } catch (error) {
    console.error('Error fetching abandoned cart stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch abandoned cart stats' },
      { status: 500 }
    )
  }
}
