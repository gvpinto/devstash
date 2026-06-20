import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`

  const { error } = await resend.emails.send({
    from: 'DevStash <onboarding@resend.dev>',
    to: email,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="font-size: 20px; margin-bottom: 8px;">Verify your email</h2>
        <p style="color: #555; margin-bottom: 24px;">
          Thanks for signing up for DevStash. Click the button below to verify your email address.
          This link expires in 24 hours.
        </p>
        <a href="${verifyUrl}"
          style="display: inline-block; background: #000; color: #fff; padding: 12px 24px;
                 border-radius: 6px; text-decoration: none; font-weight: 500;">
          Verify email
        </a>
        <p style="margin-top: 24px; font-size: 13px; color: #999;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  })

  if (error) {
    console.error('[Resend] Failed to send verification email:', error)
    throw new Error(error.message)
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

  const { error } = await resend.emails.send({
    from: 'DevStash <onboarding@resend.dev>',
    to: email,
    subject: 'Reset your password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="font-size: 20px; margin-bottom: 8px;">Reset your password</h2>
        <p style="color: #555; margin-bottom: 24px;">
          We received a request to reset your DevStash password. Click the button below to choose a new one.
          This link expires in 1 hour.
        </p>
        <a href="${resetUrl}"
          style="display: inline-block; background: #000; color: #fff; padding: 12px 24px;
                 border-radius: 6px; text-decoration: none; font-weight: 500;">
          Reset password
        </a>
        <p style="margin-top: 24px; font-size: 13px; color: #999;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  })

  if (error) {
    console.error('[Resend] Failed to send password reset email:', error)
    throw new Error(error.message)
  }
}
