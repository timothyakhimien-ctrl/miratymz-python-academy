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

    if (action === 'approve') {
      const { data, error } = await supabase
        .from('registrations')
        .update({
          status: 'Approved',
          approved_at: new Date().toISOString(),
          declined_reason: null,
        })
        .eq('tracking_id', trackingId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to approve registration' }, { status: 500 });
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
        return NextResponse.json({ error: 'Failed to decline registration' }, { status: 500 });
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
        return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: 'Record deleted.' });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
