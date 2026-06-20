import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { verifyPasswordResetToken, deletePasswordResetToken } from '@/lib/tokens'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, token, password, confirmPassword } = body

  if (!email || !token || !password || !confirmPassword) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
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
