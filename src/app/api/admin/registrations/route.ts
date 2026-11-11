import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function verifyAdmin(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  try {
    const raw = Buffer.from(authHeader.replace('Bearer ', ''), 'base64').toString('utf-8');
    const parsed = JSON.parse(raw);
    return parsed && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.trim();

    const supabase = getServiceSupabase();

    let query = supabase.from('registrations').select('*').order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,tracking_id.ilike.%${search}%`
      );
    }

    const { data: registrations, error } = await query;

    if (error) {
      console.error('Fetch registrations error:', error);
      return NextResponse.json({ error: 'Could not fetch registrations' }, { status: 500 });
    }

    // Calculate metrics
    const { data: allRecords } = await supabase.from('registrations').select('status, amount');

    const stats = {
      total: allRecords?.length || 0,
      pending: allRecords?.filter((r) => r.status === 'Pending').length || 0,
      underReview: allRecords?.filter((r) => r.status === 'Under Review').length || 0,
      approved: allRecords?.filter((r) => r.status === 'Approved').length || 0,
      declined: allRecords?.filter((r) => r.status === 'Declined').length || 0,
      totalRevenue:
        allRecords
          ?.filter((r) => r.status === 'Approved')
          .reduce((sum, r) => sum + (r.amount || 0), 0) || 0,
    };

    return NextResponse.json({
      success: true,
      registrations: registrations || [],
      stats,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
