import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/utils';
import {
  createAdminToken,
  checkRateLimit,
  recordFailedAttempt,
  clearFailedAttempts,
} from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request);

  // 1. Rate Limit & Anti-Brute-Force check
  const rateLimit = checkRateLimit(clientIp);
  if (rateLimit.isLocked) {
    return NextResponse.json(
      {
        error: `Security Alert: Too many failed login attempts from this network. The portal is locked for ${rateLimit.remainingMinutes} minute(s) to protect against unauthorized access.`,
      },
      { status: 429 }
    );
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required.' }, { status: 400 });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanPassword = String(password).trim();
    const passwordHash = hashPassword(cleanPassword);

    // 2. Validate Credentials:
    // Priority A: Environment Variables (ADMIN_USERNAME & ADMIN_PASSWORD)
    const envAdminUser = (process.env.ADMIN_USERNAME || 'miraadmin').trim().toLowerCase();
    const envAdminPass = (process.env.ADMIN_PASSWORD || 'miratymz2026').trim();

    const matchesEnv = cleanUsername === envAdminUser && cleanPassword === envAdminPass;

    let matchesDb = false;
    if (!matchesEnv) {
      try {
        const supabase = getServiceSupabase();
        const { data: user } = await supabase
          .from('admin_users')
          .select('*')
          .eq('username', cleanUsername)
          .single();

        if (user && user.password_hash === passwordHash) {
          matchesDb = true;
        }
      } catch {
        // DB user optional
      }
    }

    const isValid = matchesEnv || matchesDb;

    if (!isValid) {
      // Record failed attempt & add artificial delay to defeat rapid credential stuffing
      const failed = recordFailedAttempt(clientIp);
      await delay(800);

      if (failed.isLocked) {
        return NextResponse.json(
          {
            error:
              'Security Alert: Maximum failed attempts exceeded. The portal has been locked for 15 minutes.',
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: `Invalid username or password. ${failed.attemptsLeft} attempt(s) remaining before security lockout.`,
        },
        { status: 401 }
      );
    }

    // 3. Clear any previous failed attempts on success
    clearFailedAttempts(clientIp);

    // 4. Issue cryptographically signed HMAC token
    const token = createAdminToken(cleanUsername);

    return NextResponse.json({
      success: true,
      token,
      user: cleanUsername,
    });
  } catch (err: any) {
    console.error('Admin Login Error:', err);
    return NextResponse.json({ error: 'Internal server security error' }, { status: 500 });
  }
}
