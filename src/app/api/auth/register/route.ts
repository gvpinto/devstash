import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/email"
import { rateLimit, getClientIP, retryAfterSeconds } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const { success, reset } = await rateLimit(`register:${ip}`, 3, "1 h")
  if (!success) {
    const retryAfter = retryAfterSeconds(reset)
    return NextResponse.json(
      { error: `Too many registration attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { name, email: rawEmail, password, confirmPassword } = body as Record<string, string>

  if (!name || !rawEmail || !password || !confirmPassword) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }

  const email = rawEmail.trim().toLowerCase()

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const requireVerification = process.env.REQUIRE_EMAIL_VERIFICATION !== 'false'

  if (!requireVerification) {
    await prisma.user.create({
      data: { name, email, password: hashedPassword, emailVerified: new Date() },
    })
    return NextResponse.json({ success: true, skipVerification: true }, { status: 201 })
  }

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  })

  try {
    const token = await generateVerificationToken(email)
    await sendVerificationEmail(email, token)
  } catch {
    await prisma.user.delete({ where: { id: user.id } })
    return NextResponse.json(
      { error: 'Failed to send verification email. Please try again.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
