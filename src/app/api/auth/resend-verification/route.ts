import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { email: rawEmail } = body as Record<string, string>

  if (!rawEmail) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const email = rawEmail.trim().toLowerCase()

  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  })

  if (!user) {
    // Return success to avoid leaking whether an email is registered
    return NextResponse.json({ success: true })
  }

  if (user.emailVerified) {
    return NextResponse.json({ success: true })
  }

  const token = await generateVerificationToken(email)
  await sendVerificationEmail(email, token)

  return NextResponse.json({ success: true })
}
