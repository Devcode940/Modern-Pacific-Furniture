import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ============================================================================
// SIMULATED M-Pesa STK Push Payment API — DEMO / SANDBOX ONLY
// ============================================================================
// This route simulates an M-Pesa STK Push (Lipa na M-Pesa Online) request.
// In production, this would call the real Safaricom Daraja API endpoints:
//   1. POST /mpesa/stkpush/v1/processrequest  (initiate STK Push)
//   2. Callback URL configured in Daraja sandbox to confirm payment
//
// Environment variables you would need in production:
//   MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY,
//   MPESA_SHORTCODE, MPESA_CALLBACK_URL, MPESA_ENVIRONMENT (sandbox/live)
//
// This implementation adds a ~2-second delay to mimic network latency and
// always returns a successful mock response. No real money is transacted.
// ============================================================================

const mpesaStkSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^254\d{9}$/, 'Phone number must be a valid Kenyan number starting with 254 (e.g. 254712345678)'),
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .max(1_000_000, 'Maximum single transaction amount is KSh 1,000,000'),
  orderNumber: z
    .string()
    .min(1, 'Order number is required')
    .max(50, 'Order number is too long'),
})

function generateTransactionId(phone: string): string {
  const phoneSuffix = phone.slice(-4)
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `TXN-${phoneSuffix}-${timestamp}-${random}`
}

function generateMpesaReceipt(): string {
  const prefixes = ['SBK', 'QJK', 'RGH', 'SHF', 'OBK', 'RQE']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let receipt = prefix
  for (let i = 0; i < 8; i++) {
    receipt += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return receipt
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = mpesaStkSchema.parse(body)

    // SIMULATION: In production, you would:
    // 1. Generate an OAuth token via Safaricom API
    // 2. POST to /mpesa/stkpush/v1/processrequest with the payload
    // 3. Return the CheckoutRequestID to the client for polling
    // 4. Safaricom calls your callback URL when the user enters their PIN

    // Simulate network latency for the STK Push request
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const transactionId = generateTransactionId(validated.phoneNumber)
    const mpesaReceipt = generateMpesaReceipt()

    // Return a mock successful response matching the Safaricom STK Push response structure
    return NextResponse.json({
      success: true,
      transactionId,
      mpesaReceipt,
      amount: validated.amount,
      phoneNumber: validated.phoneNumber,
      orderNumber: validated.orderNumber,
      currency: 'KES',
      // Mimicking Safaricom's response fields (mock values)
      responseCode: '0',
      responseDescription: 'Success. Request accepted for processing',
      merchantRequestID: `MR-${Date.now()}`,
      checkoutRequestID: `WS_CO_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('M-Pesa STK Push simulation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process M-Pesa payment' },
      { status: 500 }
    )
  }
}
