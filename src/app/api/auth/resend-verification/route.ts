import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email } = body

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  })

  if (!user) {
    // Return success to avoid leaking whether an email is registered
    return NextResponse.json({ success: true })
  }

  if (user.emailVerified) {
    return NextResponse.json({ error: "Email is already verified" }, { status: 409 })
  }

  const token = await generateVerificationToken(email)
  await sendVerificationEmail(email, token)

  return NextResponse.json({ success: true })
}
