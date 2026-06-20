# Auth Security Review — DevStash
**Last Audited**: 2026-06-20
**Auditor**: auth-auditor agent
**Files Reviewed**: 29
**Issues Found**: 9 (1 critical, 1 high, 4 medium, 3 low)

---

## 🔴 Critical

### Auth Guard (proxy.ts) Is Never Invoked — All Protected Routes Are Unprotected

- **File**: `src/proxy.ts`
- **Problem**: `proxy.ts` exports a `proxy` function and a `config` matcher, but Next.js middleware must be exported from a file named exactly `middleware.ts` (at the project root or under `src/`). There is no `middleware.ts` file in this project. As a result, `proxy.ts` is dead code — **it is never executed by Next.js**. Every route that the proxy is supposed to protect (`/dashboard/*`, `/profile`) is fully accessible without authentication. A user can navigate directly to `/dashboard` or `/profile` without being logged in and the server will render it. The only protection that currently exists is the per-page `auth()` + `redirect()` call in `src/app/profile/page.tsx` (which catches unauthenticated access at the server component level). The dashboard layout does not appear to have an equivalent guard, meaning dashboard pages may render without authentication if the server components do not individually call `auth()`.
- **Fix**: Create `src/middleware.ts` that re-exports `proxy` and `config` from `proxy.ts`:

  ```ts
  // src/middleware.ts
  export { proxy as default, config } from './proxy'
  ```

  Alternatively, rename `proxy.ts` to `middleware.ts` and change `export const proxy` to `export default`. Then verify that all protected server components also have individual `auth()` guards as defense-in-depth.

---

## 🟠 High

### Open Redirect via Unvalidated `callbackUrl`

- **File**: `src/app/(auth)/sign-in/page.tsx` (line 21 and 41)
- **Problem**: The sign-in page reads `callbackUrl` directly from the URL search params and passes it to `router.push(callbackUrl)` after a successful Credentials login, and to `signIn('github', { callbackUrl })` for GitHub OAuth. There is no validation that `callbackUrl` is a relative URL or belongs to the same origin. An attacker can craft a link like `/sign-in?callbackUrl=https://evil.com` and phish users by sending them to a page that looks like DevStash's sign-in — after they authenticate successfully, they are redirected to `evil.com`. For `router.push()`, Next.js's `router.push` in App Router does not sanitize external URLs and will follow them. For GitHub OAuth, NextAuth v5 does validate `callbackUrl` against the configured `NEXTAUTH_URL`, but the `router.push` path for Credentials is unguarded.
- **Fix**: Validate that `callbackUrl` is a same-origin relative path before use:

  ```ts
  function isSafeCallbackUrl(url: string): boolean {
    // Accept only relative paths starting with /
    return url.startsWith('/') && !url.startsWith('//')
  }

  const rawCallback = searchParams.get('callbackUrl') || '/dashboard'
  const callbackUrl = isSafeCallbackUrl(rawCallback) ? rawCallback : '/dashboard'
  ```

  Apply this before both `router.push(callbackUrl)` and `signIn('github', { callbackUrl })`.

---

## 🟡 Medium

### No Server-Side Password Minimum Length Enforcement

- **Files**: `src/app/api/auth/register/route.ts`, `src/app/api/auth/reset-password/route.ts`, `src/app/api/auth/change-password/route.ts`
- **Problem**: None of the three API routes that accept passwords enforce a minimum password length or any complexity requirement server-side. The register and change-password routes check only that the field is non-empty (`!password`). A client sending `password: "a"` directly to the API (bypassing the browser form) will successfully create an account or change a password to a single character. Since bcrypt cost 12 is used, the short password itself will be stored safely hashed, but the weak password provides virtually no brute-force resistance.
- **Fix**: Add a server-side minimum length check in all three routes:

  ```ts
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }
  ```

---

### No Input Validation Library (Zod) — Ad-hoc Checks Are Incomplete

- **Files**: All routes under `src/app/api/auth/`
- **Problem**: No Zod or equivalent schema validation is used. Validation is done with individual `if (!field)` checks. This means: (1) there is no email format validation server-side — any string is accepted as an email in `register` and `forgot-password`; (2) the `name` field has no maximum length, so a very large string could be stored in the database; (3) there is no `content-type` header check, so a malformed body may produce an unhandled JSON parse error rather than a clean 400. `request.json()` is called without error handling in most routes — if the request body is not valid JSON, Next.js will throw an unhandled error that returns a 500.
- **Fix**: Add `zod` as a dependency and define schemas per route. At minimum, add a JSON parse guard:

  ```ts
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  ```

  Then validate with Zod before destructuring fields.

---

### Email Enumeration via `resend-verification` Endpoint

- **File**: `src/app/api/auth/resend-verification/route.ts` (line 25)
- **Problem**: When a request is made for an email that exists but is already verified, the endpoint returns a distinct `409` error: `"Email is already verified"`. The non-existent-email path returns `200`. This three-way response (200 for unknown email, 200 for unverified, 409 for verified) allows an attacker to determine which emails are registered as verified accounts in DevStash — a lower-severity enumeration than the register endpoint but still leaks user presence. Note: the forgot-password and register endpoints were audited separately and correctly avoid this pattern.
- **Fix**: Return a uniform `200` for both the unknown-email and already-verified cases. The UI does not need to distinguish them:

  ```ts
  if (!user || user.emailVerified) {
    return NextResponse.json({ success: true })
  }
  ```

---

### Missing Rate Limiting on All Auth Endpoints

- **Files**: All routes under `src/app/api/auth/`, `src/auth.ts` (Credentials `authorize`)
- **Problem**: No rate limiting exists anywhere in the auth flow. There are no packages for rate limiting (`upstash`, `limiter`, etc.) in `package.json`, and no custom IP-based throttling in any route or middleware. This exposes the following attack surfaces:
  - **Credential stuffing / password brute force**: The `POST /api/auth/[...nextauth]` Credentials endpoint can be called unlimited times per IP, enabling automated password guessing.
  - **Account enumeration via register timing**: Mass account creation or repeated lookups can fingerprint whether an email is registered.
  - **Email flooding**: `POST /api/auth/forgot-password` and `POST /api/auth/resend-verification` can be called repeatedly to flood an arbitrary email address with reset/verification emails.
  - **Change-password brute force**: An authenticated attacker who has cookie access can try unlimited current-password guesses against `POST /api/auth/change-password`.
- **Fix**: Implement IP-based rate limiting using Upstash Ratelimit + Redis (or a similar edge-compatible solution). Apply limits at the middleware layer or per-route. Suggested limits: sign-in: 5 attempts per 15 minutes per IP; forgot-password and resend-verification: 3 requests per hour per IP or email; register: 10 per hour per IP.

---

## 🔵 Low / Informational

### Email Not Normalized Before Database Lookup

- **Files**: `src/app/api/auth/register/route.ts`, `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/reset-password/route.ts`, `src/app/api/auth/resend-verification/route.ts`
- **Problem**: Email addresses are not lowercased or trimmed before being used in Prisma queries or stored in the database. This means `User@Example.com` and `user@example.com` would be treated as different users at the database level (PostgreSQL `=` comparison is case-sensitive). A user who registers with `User@Example.com` and then tries to sign in with `user@example.com` via Credentials will fail (`findUnique({ where: { email } })` will return null). Additionally, if a database `unique` index is case-sensitive, two accounts can coexist for what is effectively the same email. This is a consistency bug that also has minor security implications (a user could register two accounts with the same email in different cases).
- **Fix**: Normalize email at the point of ingestion in all routes:

  ```ts
  const normalizedEmail = email.trim().toLowerCase()
  ```

  Use `normalizedEmail` in all subsequent Prisma calls and token generation. Also update the Credentials `authorize` to normalize before lookup (it currently uses the raw value from the form).

---

### `forgot-password` Logs Email Address on Send Failure

- **File**: `src/app/api/auth/forgot-password/route.ts` (line 21)
- **Problem**: `console.error('[forgot-password] Failed to send reset email for', email)` logs the user's email address to the server console when the Resend API call fails. In a production deployment with centralized log aggregation, this can result in email addresses being stored in log systems potentially accessible to a wider audience than the database itself.
- **Fix**: Log the error without the email, or use a hashed reference:

  ```ts
  console.error('[forgot-password] Failed to send reset email:', error)
  ```

---

### JWT Session Cannot Be Invalidated After Password Reset or Account Compromise

- **File**: `src/auth.ts` (line 11 — `session: { strategy: "jwt" }`)
- **Problem**: This is a **known NextAuth v5 limitation** with the JWT session strategy, not a bug introduced by the application code. When a user resets their password via the forgot-password flow, or when an admin deletes a user, any existing JWT sessions for that user remain valid until they expire naturally. There is no session revocation list or token version field on the User model to invalidate outstanding tokens.
- **Impact**: If an attacker steals a session cookie, changing the password does not immediately invalidate the attacker's session. The window is bounded by the JWT expiry (NextAuth v5 default is 30 days).
- **Accepted trade-off**: The JWT strategy was chosen deliberately (noted in the codebase). To mitigate without switching to database sessions, add a `passwordChangedAt` timestamp to the User model and validate it in the JWT `jwt` callback — if the token's `iat` predates `passwordChangedAt`, reject the token.

---

## ✅ Passed Checks

- **bcrypt cost factor**: ✅ Work factor is 12 in all three locations that hash passwords: `src/app/api/auth/register/route.ts` line 24, `src/app/api/auth/reset-password/route.ts` line 26, `src/app/api/auth/change-password/route.ts` line 36.
- **Timing-safe password comparison**: ✅ `bcrypt.compare()` is used throughout — never string equality. Found in `src/auth.ts` line 28 and `src/app/api/auth/change-password/route.ts` line 31.
- **Token entropy**: ✅ `crypto.randomBytes(32)` (node `crypto` module) is used for both verification and reset tokens (`src/lib/tokens.ts` lines 8 and 36). This yields 256 bits of entropy, well above the 128-bit minimum.
- **Token length**: ✅ `randomBytes(32).toString('hex')` produces a 64-character hex string — adequate length for brute-force resistance.
- **Token expiry enforcement**: ✅ Both `verifyToken` and `verifyPasswordResetToken` check `record.expires < new Date()` server-side and return `{ valid: false, reason: 'expired' }` (`src/lib/tokens.ts` lines 25 and 53).
- **Single-use token enforcement**: ✅ Tokens are deleted immediately after successful use: `deleteVerificationToken` is called in `verify-email/route.ts` line 26 after setting `emailVerified`; `deletePasswordResetToken` is called in `reset-password/route.ts` line 28 after updating the password.
- **Token collision handling**: ✅ When a new token is generated, old tokens for the same identifier are deleted first via `prisma.verificationToken.deleteMany({ where: { identifier } })` (`src/lib/tokens.ts` lines 11 and 40). This prevents token accumulation and potential replay.
- **Token identifier separation**: ✅ Password reset tokens use the identifier prefix `reset:${email}`, while email verification tokens use plain `email`. This prevents a verification token from being used as a password reset token or vice versa (`src/lib/tokens.ts` line 33).
- **Forgot-password email enumeration**: ✅ `POST /api/auth/forgot-password` always returns `200` regardless of whether the email exists (`src/app/api/auth/forgot-password/route.ts` line 26).
- **Session ID used (not request body) for change-password**: ✅ `POST /api/auth/change-password` calls `auth()` server-side and uses `session.user.id` for the Prisma lookup — no user-supplied ID is trusted (`src/app/api/auth/change-password/route.ts` lines 7-10, 22-23, 37).
- **Session ID used (not request body) for account deletion**: ✅ `DELETE /api/auth/account` calls `auth()` and uses `session.user.id` — no IDOR risk (`src/app/api/auth/account/route.ts` lines 6-8, 11).
- **Profile page auth guard**: ✅ `src/app/profile/page.tsx` calls `auth()` server-side (line 12) and redirects to `/sign-in` if no session. It uses `session.user.id` for all data fetching (line 16).
- **IDOR protection**: ✅ All sensitive mutations (change-password, delete-account) use session-derived user ID, not request body parameters.
- **Password not returned to client**: ✅ The `password` field is not included in Prisma `select` statements in API responses. `getProfileData` selects `password` internally only to set `isEmailUser` (a boolean) — it is never serialized to the client.
- **Credentials sign-in error messaging**: ✅ The `authorize` function returns `null` for both "user not found" and "wrong password" cases — the same generic error is shown to the user (`src/app/(auth)/sign-in/page.tsx` line 39: "Invalid email or password.").
- **Register email enumeration**: Low-severity trade-off — the register endpoint returns a distinct `409 "User already exists"` for duplicate emails. This is the common UX pattern and considered acceptable in most applications.
- **Password exposure in logs**: ✅ No `console.log` or `console.error` calls include password values in any auth route.
- **Proxy unverified-user guard**: ✅ The proxy correctly checks `!req.auth?.user?.emailVerified` and redirects unverified users to `/verify-email` — **however, this only matters once the proxy is actually wired up as middleware (see Critical finding above)**.
- **confirmPassword server-side check**: ✅ All three password-accepting routes verify `password !== confirmPassword` server-side, not just in the UI.

---

## Summary

The auth implementation has strong fundamentals: bcrypt at cost 12, cryptographically secure tokens with proper expiry and single-use enforcement, clear identifier separation between token types, and correct session-based ownership checks on all sensitive mutations. The token flow (verify-email, forgot-password, reset-password) is well-constructed.

**The most urgent fix** is creating `src/middleware.ts` to wire up `proxy.ts` as Next.js middleware. As it stands, the entire auth guard is dead code and `/dashboard/*` routes are unauthenticated at the network level. This is a Critical issue that must be fixed before production deployment.

**The second priority** is validating the `callbackUrl` parameter in the sign-in page to prevent open redirect phishing attacks.

After those two are addressed, adding server-side password minimum length enforcement and rate limiting on auth endpoints will bring the posture to a production-ready level. The missing Zod validation and email normalization are lower-urgency but should be addressed to harden the API surface.

The JWT session non-revocation on password reset is a known trade-off of the chosen `strategy: "jwt"` — it is not a bug but the application could add a `passwordChangedAt` guard in the JWT callback to bound the risk.
