import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { verifyPasswordResetToken, deletePasswordResetToken } from '@/lib/tokens'
import { rateLimit, getClientIP, retryAfterSeconds } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const { success, reset } = await rateLimit(`reset-password:${ip}`, 5, '15 m')
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
  const { email: rawEmail, token, password, confirmPassword } = body as Record<string, string>

  if (!rawEmail || !token || !password || !confirmPassword) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  const email = rawEmail.trim().toLowerCase()

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
  }

  const result = await verifyPasswordResetToken(email, token)
  if (!result.valid) {
    const message = result.reason === 'expired'
      ? 'This reset link has expired. Please request a new one.'
      : 'Invalid or already used reset link. Please request a new one.'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { email }, data: { password: hashedPassword } })
  await deletePasswordResetToken(email, token)

  return NextResponse.json({ success: true })
}
