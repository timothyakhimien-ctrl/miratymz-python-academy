import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const {
      trackingId,
      action,
      reason,
      verifiedAmount,
      paymentReference,
    } = await request.json();

    if (!trackingId || !action) {
      return NextResponse.json({ error: 'Tracking ID and action are required.' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // 1. Fetch current record to preserve documents and details
    const { data: currentReg, error: fetchErr } = await supabase
      .from('registrations')
      .select('*')
      .eq('tracking_id', trackingId)
      .single();

    if (fetchErr || !currentReg) {
      return NextResponse.json({ error: `Registration ${trackingId} not found.` }, { status: 404 });
    }

    // Helper to preserve admission letter stored in declined_reason
    const preservedAdmission =
      currentReg.declined_reason?.includes('Admission Letter:') ||
      currentReg.declined_reason?.includes('UNIBEN Admission Letter:') ||
      currentReg.declined_reason?.includes('UNIBEN Clearance Slip:')
        ? currentReg.declined_reason
        : null;

    // 2. VIP GROUP JOINED
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
        message: `Student ${trackingId} marked as Joined VIP Group.`,
        registration: data,
      });
    }

    // 3. APPROVE REGISTRATION & VERIFY PAYMENT
    if (action === 'approve') {
      let notes = preservedAdmission || '';
      if (verifiedAmount) {
        notes = `${notes ? notes + ' | ' : ''}[VERIFIED: ₦${Number(verifiedAmount).toLocaleString()}${paymentReference ? ' | Ref: ' + paymentReference : ''}]`;
      }

      const updatePayload: Record<string, any> = {
        status: 'Approved',
        approved_at: new Date().toISOString(),
        declined_reason: notes || null,
      };

      const { data, error } = await supabase
        .from('registrations')
        .update(updatePayload)
        .eq('tracking_id', trackingId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to approve registration: ' + error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Registration ${trackingId} successfully approved! Student granted access to VIP group.`,
        registration: data,
      });
    }

    // 4. DECLINE REGISTRATION
    if (action === 'decline') {
      let effectiveReason = reason || 'Proof of payment could not be validated or transfer has not reflected.';
      if (preservedAdmission && !effectiveReason.includes('Admission Letter:')) {
        effectiveReason = `${effectiveReason} | ${preservedAdmission}`;
      }

      const { data, error } = await supabase
        .from('registrations')
        .update({
          status: 'Declined',
          declined_reason: effectiveReason,
        })
        .eq('tracking_id', trackingId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to decline registration: ' + error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Registration ${trackingId} marked as Declined.`,
        registration: data,
      });
    }

    // 5. ARCHIVE / SOFT DELETE (100% reliable - uses status column)
    if (action === 'delete' || action === 'archive') {
      let archiveNote = `[ARCHIVED: ${new Date().toISOString()}]`;
      if (currentReg.declined_reason) {
        archiveNote = `${archiveNote} | ${currentReg.declined_reason}`;
      }

      const { data, error } = await supabase
        .from('registrations')
        .update({
          status: 'Archived',
          declined_reason: archiveNote,
        })
        .eq('tracking_id', trackingId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to archive record: ' + error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Record ${trackingId} has been safely archived. You can view or restore it anytime from the Archived tab.`,
        registration: data,
      });
    }

    // 6. RESTORE ARCHIVED RECORD
    if (action === 'restore') {
      // Determine restored status based on whether a receipt proof was uploaded
      const restoredStatus = currentReg.receipt_url ? 'Under Review' : 'Pending';

      // Clean archive marker from declined_reason
      let cleanReason = currentReg.declined_reason || '';
      cleanReason = cleanReason.replace(/\[ARCHIVED:[^\]]*\]\s*\|?\s*/g, '').trim();

      const { data, error } = await supabase
        .from('registrations')
        .update({
          status: restoredStatus,
          declined_reason: cleanReason || null,
        })
        .eq('tracking_id', trackingId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to restore record: ' + error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Record ${trackingId} successfully restored to active records (${restoredStatus}).`,
        registration: data,
      });
    }

    // 7. PERMANENT DELETE (Only allowed for records that are already in 'Archived' status)
    if (action === 'permanent_delete') {
      if (currentReg.status !== 'Archived') {
        return NextResponse.json(
          { error: 'For data protection, active student records must first be archived before permanent deletion.' },
          { status: 400 }
        );
      }

      const { error } = await supabase.from('registrations').delete().eq('tracking_id', trackingId);

      if (error) {
        return NextResponse.json({ error: 'Failed to permanently remove record: ' + error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Archived record ${trackingId} permanently deleted from database.`,
      });
    }

    return NextResponse.json({ error: `Invalid action "${action}".` }, { status: 400 });
  } catch (err: any) {
    console.error('Admin Action API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
