import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePasswordResetToken } from '@/lib/tokens'
import { sendPasswordResetEmail } from '@/lib/email'
import { rateLimit, getClientIP, retryAfterSeconds } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const { success, reset } = await rateLimit(`forgot-password:${ip}`, 3, '1 h')
  if (!success) {
    const retryAfter = retryAfterSeconds(reset)
    return NextResponse.json(
      { error: `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { email: rawEmail } = body as Record<string, string>

  if (!rawEmail) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const email = rawEmail.trim().toLowerCase()

  const user = await prisma.user.findUnique({ where: { email } })

  if (user) {
    try {
      const token = await generatePasswordResetToken(email)
      await sendPasswordResetEmail(email, token)
    } catch (err) {
      console.error('[forgot-password] Failed to send reset email:', err)
    }
  }

  // Always return 200 to avoid email enumeration
  return NextResponse.json({ success: true })
}
