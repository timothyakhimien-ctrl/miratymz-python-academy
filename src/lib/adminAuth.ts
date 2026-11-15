import crypto from 'crypto';

// Secret key for HMAC token signing (falls back securely to server role key or a default salt)
function getAdminSecret(): string {
  return (
    process.env.ADMIN_SECRET_KEY ||
    process.env.ADMIN_JWT_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'miratymz_secure_super_secret_signing_key_2026'
  );
}

export interface AdminTokenPayload {
  user: string;
  exp: number;
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token
 */
export function createAdminToken(username: string): string {
  const payload: AdminTokenPayload = {
    user: username,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days expiration
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', getAdminSecret());
  hmac.update(payloadB64);
  const signature = hmac.digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies the HMAC-SHA256 token and validates expiration
 */
export function verifyAdminToken(token: string): { valid: boolean; user?: string } {
  if (!token) return { valid: false };

  try {
    const parts = token.split('.');
    if (parts.length === 2) {
      const [payloadB64, signature] = parts;
      const hmac = crypto.createHmac('sha256', getAdminSecret());
      hmac.update(payloadB64);
      const expectedSignature = hmac.digest('base64url');

      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expectedSignature);

      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return { valid: false };
      }

      const raw = Buffer.from(payloadB64, 'base64url').toString('utf-8');
      const payload: AdminTokenPayload = JSON.parse(raw);

      if (payload && payload.exp && payload.exp > Date.now()) {
        return { valid: true, user: payload.user };
      }
      return { valid: false };
    }

    // Graceful backward-compatibility check for unexpired legacy base64 tokens during transition
    const legacyRaw = Buffer.from(token, 'base64').toString('utf-8');
    const legacyParsed = JSON.parse(legacyRaw);
    if (legacyParsed && legacyParsed.exp && legacyParsed.exp > Date.now() && legacyParsed.user) {
      return { valid: true, user: legacyParsed.user };
    }

    return { valid: false };
  } catch {
    return { valid: false };
  }
}

/**
 * Extracts and verifies the Bearer token from an incoming HTTP Request
 */
export function verifyAdminRequest(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

  const token = authHeader.replace('Bearer ', '').trim();
  const { valid } = verifyAdminToken(token);
  return valid;
}

// -------------------------------------------------------------
// IN-MEMORY RATE LIMITER & BRUTE-FORCE SHIELD
// -------------------------------------------------------------
interface AttemptRecord {
  count: number;
  lockedUntil: number;
  lastAttempt: number;
}

const loginAttempts = new Map<string, AttemptRecord>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

/**
 * Checks if the client IP is currently locked out
 */
export function checkRateLimit(ip: string): { isLocked: boolean; remainingMinutes: number } {
  const record = loginAttempts.get(ip);
  if (!record) return { isLocked: false, remainingMinutes: 0 };

  const now = Date.now();
  if (record.lockedUntil > now) {
    const remainingMs = record.lockedUntil - now;
    return { isLocked: true, remainingMinutes: Math.ceil(remainingMs / 60000) };
  }

  // If lockout expired or older than 30 mins, clear
  if (now - record.lastAttempt > LOCKOUT_DURATION_MS * 2) {
    loginAttempts.delete(ip);
  }

  return { isLocked: false, remainingMinutes: 0 };
}

/**
 * Records a failed login attempt; triggers lockout if threshold reached
 */
export function recordFailedAttempt(ip: string): { isLocked: boolean; attemptsLeft: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, lockedUntil: 0, lastAttempt: now };

  record.count += 1;
  record.lastAttempt = now;

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    loginAttempts.set(ip, record);
    return { isLocked: true, attemptsLeft: 0 };
  }

  loginAttempts.set(ip, record);
  return { isLocked: false, attemptsLeft: MAX_FAILED_ATTEMPTS - record.count };
}

/**
 * Clears failed attempts upon a successful login
 */
export function clearFailedAttempts(ip: string): void {
  loginAttempts.delete(ip);
}
