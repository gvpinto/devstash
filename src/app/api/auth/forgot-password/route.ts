import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePasswordResetToken } from '@/lib/tokens'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email } = body

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (user) {
    try {
      const token = await generatePasswordResetToken(email)
      await sendPasswordResetEmail(email, token)
    } catch {
      console.error('[forgot-password] Failed to send reset email for', email)
    }
  }

  // Always return 200 to avoid email enumeration
  return NextResponse.json({ success: true })
}
