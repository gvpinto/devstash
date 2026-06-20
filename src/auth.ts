import NextAuth from "next-auth"
import { CredentialsSignin } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import authConfig from "./auth.config"
import { rateLimit, getClientIP } from "@/lib/rate-limit"

class TooManyAttemptsError extends CredentialsSignin {
  code = "too_many_attempts"
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  ...authConfig,
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null

        const ip = getClientIP(request as Request)
        const email = (credentials.email as string).toLowerCase().trim()
        const { success } = await rateLimit(`login:${ip}:${email}`, 5, "15 m")
        if (!success) throw new TooManyAttemptsError()

        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, name: true, email: true, image: true, password: true, emailVerified: true },
        })
        if (!user?.password) return null
        const valid = await bcrypt.compare(credentials.password as string, user.password)
        if (!valid) return null
        return { id: user.id, name: user.name, email: user.email, image: user.image, emailVerified: user.emailVerified }
      },
    }),
  ],
  // Must come after ...authConfig spread to override authConfig.callbacks
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.emailVerified = (user as { emailVerified?: Date | null }).emailVerified ?? null
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.emailVerified = token.emailVerified as Date | null
      return session
    },
  },
})
