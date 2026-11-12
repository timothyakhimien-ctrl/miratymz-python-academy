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

export async function POST(request: Request) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { trackingId, action, reason } = await request.json();

    if (!trackingId || !action) {
      return NextResponse.json({ error: 'Tracking ID and action are required.' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    if (action === 'added_to_vip') {
      const { data, error } = await supabase
        .from('registrations')
        .update({
          status: 'Added to VIP Group',
        })
        .eq('tracking_id', trackingId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to update VIP status: ' + error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Student ${trackingId} is now marked as Added to VIP Group.`,
        registration: data,
      });
    }

    if (action === 'approve') {
      // Check if registration currently has a clearance slip stored in declined_reason
      const { data: currentReg } = await supabase
        .from('registrations')
        .select('declined_reason')
        .eq('tracking_id', trackingId)
        .single();

      const preservedClearance =
        currentReg?.declined_reason?.includes('UNIBEN Clearance Slip:')
          ? currentReg.declined_reason
          : null;

      const { data, error } = await supabase
        .from('registrations')
        .update({
          status: 'Approved',
          approved_at: new Date().toISOString(),
          declined_reason: preservedClearance,
        })
        .eq('tracking_id', trackingId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to approve registration: ' + error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Registration ${trackingId} has been successfully approved! Student is now granted access to the Paid Members WhatsApp Community.`,
        registration: data,
      });
    }

    if (action === 'decline') {
      const { data, error } = await supabase
        .from('registrations')
        .update({
          status: 'Declined',
          declined_reason: reason || 'Proof of payment could not be validated or transfer has not reflected.',
        })
        .eq('tracking_id', trackingId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to decline registration: ' + error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Registration ${trackingId} has been marked as Declined.`,
        registration: data,
      });
    }

    if (action === 'delete') {
      const { error } = await supabase.from('registrations').delete().eq('tracking_id', trackingId);
      if (error) {
        return NextResponse.json({ error: 'Failed to delete record: ' + error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: 'Record deleted.' });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
