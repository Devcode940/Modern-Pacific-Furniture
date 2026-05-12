import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ============================================================================
// County-Based Delivery Estimation API for Kenya
// ============================================================================
// Returns delivery cost (KES) and estimated delivery days based on the
// destination county. Supports both POST (estimate for a specific order)
// and GET (list all supported counties and their free-delivery thresholds).
// ============================================================================

// Delivery zone configuration — keyed by county name
const DELIVERY_ZONES: Record<string, {
  cost: number
  minDays: number
  maxDays: number
  freeThreshold: number
}> = {
  Nairobi: {
    cost: 1500,
    minDays: 1,
    maxDays: 2,
    freeThreshold: 30_000,
  },
  Mombasa: {
    cost: 3000,
    minDays: 2,
    maxDays: 4,
    freeThreshold: 50_000,
  },
  Nakuru: {
    cost: 2500,
    minDays: 2,
    maxDays: 5,
    freeThreshold: 50_000,
  },
  Kisumu: {
    cost: 2500,
    minDays: 2,
    maxDays: 5,
    freeThreshold: 50_000,
  },
  Eldoret: {
    cost: 2500,
    minDays: 2,
    maxDays: 5,
    freeThreshold: 50_000,
  },
  Thika: {
    cost: 2500,
    minDays: 2,
    maxDays: 5,
    freeThreshold: 50_000,
  },
}

// Default zone for any county not explicitly listed above
const DEFAULT_ZONE = {
  cost: 4000,
  minDays: 3,
  maxDays: 7,
  freeThreshold: 80_000,
}

const supportedCounties = Object.keys(DELIVERY_ZONES)

const deliveryEstimateSchema = z.object({
  county: z.string().min(1, 'County is required'),
  total: z.number().nonnegative('Order total must be 0 or greater'),
})

function getZone(county: string) {
  // Case-insensitive match against known zones
  const normalizedName = county
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('')

  for (const [zoneCounty, zone] of Object.entries(DELIVERY_ZONES)) {
    if (zoneCounty.toLowerCase() === normalizedName.toLowerCase()) {
      return { county: zoneCounty, ...zone }
    }
  }

  return { county: county.trim(), ...DEFAULT_ZONE }
}

// GET — Return the list of supported counties and their free-delivery thresholds
export async function GET() {
  const freeThresholds: Record<string, number> = {}
  for (const [county, zone] of Object.entries(DELIVERY_ZONES)) {
    freeThresholds[county] = zone.freeThreshold
  }
  freeThresholds['Other Counties'] = DEFAULT_ZONE.freeThreshold

  return NextResponse.json({
    counties: supportedCounties,
    freeThresholds,
    defaultZone: { ...DEFAULT_ZONE },
  })
}

// POST — Calculate delivery cost and estimated days for a given county and order total
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = deliveryEstimateSchema.parse(body)

    const zone = getZone(validated.county)
    const isFreeDelivery = validated.total >= zone.freeThreshold
    const deliveryCost = isFreeDelivery ? 0 : zone.cost

    return NextResponse.json({
      county: zone.county,
      deliveryCost,
      isFreeDelivery,
      freeThreshold: zone.freeThreshold,
      remainingForFree: isFreeDelivery ? 0 : zone.freeThreshold - validated.total,
      estimatedDays: {
        min: zone.minDays,
        max: zone.maxDays,
        label: `${zone.minDays}-${zone.maxDays} business days`,
      },
      total: validated.total,
      grandTotal: validated.total + deliveryCost,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Delivery estimation error:', error)
    return NextResponse.json(
      { error: 'Failed to estimate delivery' },
      { status: 500 }
    )
  }
}
