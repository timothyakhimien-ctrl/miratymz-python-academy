import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    const status = searchParams.get('status')?.trim();
    const search = searchParams.get('search')?.trim();

    const supabase = getServiceSupabase();

    let query = supabase.from('registrations').select('*').order('created_at', { ascending: false });

    // Status filter:
    // 'all' or empty means show everyone across all statuses
    // 'Approved' includes both 'Approved' and 'Added to VIP Group'
    if (status && status.toLowerCase() !== 'all') {
      if (status === 'Approved') {
        query = query.in('status', ['Approved', 'Added to VIP Group']);
      } else {
        query = query.eq('status', status);
      }
    }

    if (search && search.length > 0) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,tracking_id.ilike.%${search}%`
      );
    }

    const { data: registrations, error } = await query;

    if (error) {
      console.error('Fetch registrations error:', error);
      return NextResponse.json({ error: 'Could not fetch registrations: ' + error.message }, { status: 500 });
    }

    // Calculate metrics across ALL records in DB
    const { data: allRecords, error: statsError } = await supabase.from('registrations').select('status, amount');

    if (statsError) {
      console.error('Fetch stats error:', statsError);
    }

    const stats = {
      total: allRecords?.length || 0,
      pending: allRecords?.filter((r: any) => r.status === 'Pending').length || 0,
      underReview: allRecords?.filter((r: any) => r.status === 'Under Review').length || 0,
      approved: allRecords?.filter((r: any) => r.status === 'Approved' || r.status === 'Added to VIP Group').length || 0,
      declined: allRecords?.filter((r: any) => r.status === 'Declined').length || 0,
      totalRevenue:
        allRecords
          ?.filter((r: any) => r.status === 'Approved' || r.status === 'Added to VIP Group')
          .reduce((sum: number, r: any) => sum + (r.amount || 0), 0) || 0,
    };

    return NextResponse.json(
      {
        success: true,
        registrations: registrations || [],
        stats,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Surrogate-Control': 'no-store',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
