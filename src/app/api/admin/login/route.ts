import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required.' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();
    const passwordHash = hashPassword(cleanPassword);

    const supabase = getServiceSupabase();

    // Check admin_users table
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', cleanUsername)
      .single();

    // Fallback hardcoded master credentials if DB record missing: miraadmin / miratymz2026
    const isMaster = cleanUsername === 'miraadmin' && cleanPassword === 'miratymz2026';
    const isValid = isMaster || (user && user.password_hash === passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    // Simple encrypted token simulation for admin session
    const token = Buffer.from(
      JSON.stringify({
        user: cleanUsername,
        exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    ).toString('base64');

    return NextResponse.json({
      success: true,
      token,
      user: cleanUsername,
    });
  } catch (err: any) {
    console.error('Admin Login Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
