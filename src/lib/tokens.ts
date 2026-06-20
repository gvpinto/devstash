import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

const EXPIRY_HOURS = 24

export async function generateVerificationToken(email: string): Promise<string> {
  const token = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000)

  await prisma.verificationToken.deleteMany({ where: { identifier: email } })
  await prisma.verificationToken.create({ data: { identifier: email, token, expires } })

  return token
}

export async function verifyToken(
  email: string,
  token: string,
): Promise<{ valid: true } | { valid: false; reason: 'invalid' | 'expired' }> {
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  })
  if (!record) return { valid: false, reason: 'invalid' }
  if (record.expires < new Date()) return { valid: false, reason: 'expired' }
  return { valid: true }
}

export async function deleteVerificationToken(email: string, token: string) {
  await prisma.verificationToken.deleteMany({ where: { identifier: email, token } })
}
