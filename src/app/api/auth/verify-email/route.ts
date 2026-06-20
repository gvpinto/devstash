import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken, deleteVerificationToken } from "@/lib/tokens"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  if (!token || !email) {
    return NextResponse.redirect(new URL("/verify-email?error=invalid", request.url))
  }

  const result = await verifyToken(email, token)

  if (!result.valid) {
    const param = result.reason === "expired" ? "expired" : "invalid"
    return NextResponse.redirect(new URL(`/verify-email?error=${param}`, request.url))
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  })

  await deleteVerificationToken(email, token)

  return NextResponse.redirect(new URL("/sign-in?verified=true", request.url))
}
