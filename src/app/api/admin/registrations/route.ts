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
    const rawSearch = searchParams.get('search')?.trim();

    const supabase = getServiceSupabase();

    let query = supabase
      .from('registrations')
      .select('id, tracking_id, full_name, email, phone, institution, department, level, category, amount, learning_mode, status, receipt_url, declined_reason, created_at, paid_at, approved_at, learning_goals')
      .order('created_at', { ascending: false });

    // Handle status filtering
    const isArchivedFilter = status?.toLowerCase() === 'archived';

    if (isArchivedFilter) {
      query = query.eq('status', 'Archived');
    } else {
      // Normal active view: exclude archived records
      query = query.neq('status', 'Archived');

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

    // Search filter with sanitized input
    if (rawSearch && rawSearch.length > 0) {
      const sanitized = rawSearch.replace(/[,%()\"\'\\]/g, '').trim();
      if (sanitized) {
        query = query.or(
          `full_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,phone.ilike.%${sanitized}%,tracking_id.ilike.%${sanitized}%,institution.ilike.%${sanitized}%`
        );
      }
    }

    const { data: registrations, error } = await query;

    if (error) {
      console.error('Fetch registrations error:', error);
      return NextResponse.json({ error: 'Could not fetch registrations: ' + error.message }, { status: 500 });
    }

    // Calculate metrics across ALL records in DB using reliable columns
    const { data: allRecords, error: statsError } = await supabase
      .from('registrations')
      .select('id, status, amount, category, institution, receipt_url, created_at');

    if (statsError) {
      console.error('Fetch stats error:', statsError);
    }

    const records = allRecords || [];
    const activeRecords = records.filter((r) => r.status !== 'Archived');
    const archivedRecords = records.filter((r) => r.status === 'Archived');

    const approvedList = activeRecords.filter(
      (r) => r.status === 'Approved' || r.status === 'Added to VIP Group'
    );
    const underReviewList = activeRecords.filter((r) => r.status === 'Under Review');
    const pendingList = activeRecords.filter((r) => r.status === 'Pending');
    const declinedList = activeRecords.filter((r) => r.status === 'Declined');

    const totalRevenue = approvedList.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const underReviewPotential = underReviewList.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const expectedRevenue = totalRevenue + underReviewPotential;

    const stats = {
      total: activeRecords.length,
      archived: archivedRecords.length,
      pending: pendingList.length,
      underReview: underReviewList.length,
      approved: approvedList.length,
      declined: declinedList.length,
      unibenCount: activeRecords.filter((r) => r.category === 'uniben').length,
      schoolCount: activeRecords.filter(
        (r) => r.category === 'school' || (r.institution && /school|college|academy/i.test(r.institution) && r.institution !== 'University of Benin (UNIBEN)')
      ).length,
      generalCount: activeRecords.filter(
        (r) => r.category === 'general' || r.institution === 'General Public'
      ).length,
      totalRevenue,
      expectedRevenue,
      underReviewPotential,
      verifiedPaymentsCount: approvedList.filter((r) => Boolean(r.receipt_url)).length,
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
    console.error('Admin Registrations API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
