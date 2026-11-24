import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status')?.trim();
    const category = searchParams.get('category')?.trim();
    const schoolId = searchParams.get('schoolId')?.trim();
    const rawSearch = searchParams.get('search')?.trim();

    const supabase = getServiceSupabase();

    let query = supabase.from('registrations').select('*').order('created_at', { ascending: false });

    // Handle soft-deleted / archived filtering
    const isArchivedFilter = status?.toLowerCase() === 'archived';

    if (isArchivedFilter) {
      // Show archived records
      // Attempt filtering by is_deleted or status
      query = query.or('is_deleted.eq.true,status.eq.Archived');
    } else {
      // Normal view: exclude deleted records
      // Filter out records where is_deleted is true or status is Archived
      query = query.or('is_deleted.is.null,is_deleted.eq.false');
      query = query.neq('status', 'Archived');

      // Status filter
      if (status && status.toLowerCase() !== 'all') {
        if (status === 'Approved') {
          query = query.in('status', ['Approved', 'Added to VIP Group']);
        } else {
          query = query.eq('status', status);
        }
      }
    }

    // Category filter
    if (category && category.toLowerCase() !== 'all') {
      query = query.eq('category', category.toLowerCase());
    }

    // School filter
    if (schoolId && schoolId.toLowerCase() !== 'all') {
      query = query.eq('school_id', schoolId);
    }

    // Search filter with sanitized input
    if (rawSearch && rawSearch.length > 0) {
      const sanitized = rawSearch.replace(/[,%()\"\'\\]/g, '').trim();
      if (sanitized) {
        query = query.or(
          `full_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,phone.ilike.%${sanitized}%,tracking_id.ilike.%${sanitized}%`
        );
      }
    }

    let { data: registrations, error } = await query;

    // Graceful fallback if is_deleted column does not yet exist
    if (error && (error.code === '42703' || error.message?.includes('is_deleted'))) {
      console.warn('is_deleted column missing during query. Retrying with basic status filter...');
      let retryQuery = supabase.from('registrations').select('*').order('created_at', { ascending: false });
      if (isArchivedFilter) {
        retryQuery = retryQuery.eq('status', 'Archived');
      } else {
        retryQuery = retryQuery.neq('status', 'Archived');
        if (status && status.toLowerCase() !== 'all') {
          if (status === 'Approved') {
            retryQuery = retryQuery.in('status', ['Approved', 'Added to VIP Group']);
          } else {
            retryQuery = retryQuery.eq('status', status);
          }
        }
      }
      if (category && category.toLowerCase() !== 'all') {
        retryQuery = retryQuery.eq('category', category.toLowerCase());
      }
      if (rawSearch && rawSearch.length > 0) {
        const sanitized = rawSearch.replace(/[,%()\"\'\\]/g, '').trim();
        if (sanitized) {
          retryQuery = retryQuery.or(
            `full_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,phone.ilike.%${sanitized}%,tracking_id.ilike.%${sanitized}%`
          );
        }
      }
      const retry = await retryQuery;
      registrations = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('Fetch registrations error:', error);
      return NextResponse.json({ error: 'Could not fetch registrations: ' + error.message }, { status: 500 });
    }

    // Calculate metrics across ALL active records in DB
    const { data: allRecords, error: statsError } = await supabase
      .from('registrations')
      .select('status, amount, verified_amount, is_deleted, category');

    if (statsError) {
      console.error('Fetch stats error:', statsError);
    }

    const activeRecords = (allRecords || []).filter((r: any) => !r.is_deleted && r.status !== 'Archived');
    const archivedRecords = (allRecords || []).filter((r: any) => r.is_deleted === true || r.status === 'Archived');

    const approvedList = activeRecords.filter(
      (r: any) => r.status === 'Approved' || r.status === 'Added to VIP Group'
    );

    const stats = {
      total: activeRecords.length,
      archived: archivedRecords.length,
      pending: activeRecords.filter((r: any) => r.status === 'Pending').length,
      underReview: activeRecords.filter((r: any) => r.status === 'Under Review').length,
      approved: approvedList.length,
      declined: activeRecords.filter((r: any) => r.status === 'Declined').length,
      unibenCount: activeRecords.filter((r: any) => r.category === 'uniben').length,
      schoolCount: activeRecords.filter((r: any) => r.category === 'school').length,
      generalCount: activeRecords.filter((r: any) => r.category === 'general' || (!r.category && r.institution === 'General Public')).length,
      totalRevenue: approvedList.reduce((sum: number, r: any) => {
        const amt = r.verified_amount !== null && r.verified_amount !== undefined ? Number(r.verified_amount) : Number(r.amount) || 0;
        return sum + amt;
      }, 0),
      expectedRevenue: approvedList.reduce((sum: number, r: any) => sum + (Number(r.amount) || 0), 0),
      underReviewPotential: activeRecords
        .filter((r: any) => r.status === 'Under Review')
        .reduce((sum: number, r: any) => sum + (Number(r.amount) || 0), 0),
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
