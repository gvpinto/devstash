import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"

export default {
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: () => null,
    }),
  ],
  callbacks: {
    // Edge-safe: maps custom JWT fields into session.user for the proxy/middleware.
    // The full auth.ts overrides this with a superset that also adds user.id.
    session({ session, token }) {
      session.user.emailVerified = (token.emailVerified as Date | null) ?? null
      return session
    },
  },
} satisfies NextAuthConfig
