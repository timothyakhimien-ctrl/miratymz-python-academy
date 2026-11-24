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
      paymentNotes,
    } = await request.json();

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
      // Check current registration to preserve admission letter and notes
      const { data: currentReg } = await supabase
        .from('registrations')
        .select('*')
        .eq('tracking_id', trackingId)
        .single();

      const preservedClearance =
        currentReg?.declined_reason?.includes('UNIBEN Clearance Slip:') ||
        currentReg?.declined_reason?.includes('UNIBEN Admission Letter:') ||
        currentReg?.declined_reason?.includes('Admission Letter:')
          ? currentReg.declined_reason
          : null;

      const updatePayload: Record<string, any> = {
        status: 'Approved',
        approved_at: new Date().toISOString(),
        declined_reason: preservedClearance,
      };

      if (verifiedAmount !== undefined && verifiedAmount !== null && !isNaN(Number(verifiedAmount))) {
        updatePayload.verified_amount = Number(verifiedAmount);
      }
      if (paymentReference) {
        updatePayload.payment_reference = paymentReference.trim();
      }
      if (paymentNotes) {
        updatePayload.payment_notes = paymentNotes.trim();
      }

      let { data, error } = await supabase
        .from('registrations')
        .update(updatePayload)
        .eq('tracking_id', trackingId)
        .select()
        .single();

      // Graceful fallback if verified_amount/payment_reference columns aren't in schema yet
      if (error && (error.code === '42703' || error.message?.includes('column'))) {
        delete updatePayload.verified_amount;
        delete updatePayload.payment_reference;
        delete updatePayload.payment_notes;
        const retry = await supabase
          .from('registrations')
          .update(updatePayload)
          .eq('tracking_id', trackingId)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        return NextResponse.json({ error: 'Failed to approve registration: ' + error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Registration ${trackingId} has been successfully approved! Student is now granted access to the Paid Members WhatsApp Community.`,
        registration: data,
      });
    }

    if (action === 'verify_payment') {
      const updatePayload: Record<string, any> = {
        status: 'Approved',
        approved_at: new Date().toISOString(),
      };

      if (verifiedAmount !== undefined && verifiedAmount !== null && !isNaN(Number(verifiedAmount))) {
        updatePayload.verified_amount = Number(verifiedAmount);
      }
      if (paymentReference) {
        updatePayload.payment_reference = paymentReference.trim();
      }
      if (paymentNotes) {
        updatePayload.payment_notes = paymentNotes.trim();
      }

      let { data, error } = await supabase
        .from('registrations')
        .update(updatePayload)
        .eq('tracking_id', trackingId)
        .select()
        .single();

      if (error && (error.code === '42703' || error.message?.includes('column'))) {
        delete updatePayload.verified_amount;
        delete updatePayload.payment_reference;
        delete updatePayload.payment_notes;
        const retry = await supabase
          .from('registrations')
          .update(updatePayload)
          .eq('tracking_id', trackingId)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        return NextResponse.json({ error: 'Failed to record payment verification: ' + error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Payment for ${trackingId} recorded and verified (₦${verifiedAmount || 'confirmed'}).`,
        registration: data,
      });
    }

    if (action === 'decline') {
      // Preserve admission letter in declined_reason if present
      const { data: currentReg } = await supabase
        .from('registrations')
        .select('declined_reason, admission_letter_url')
        .eq('tracking_id', trackingId)
        .single();

      let effectiveReason = reason || 'Proof of payment could not be validated or transfer has not reflected.';
      if (currentReg?.declined_reason?.includes('Admission Letter:') && !effectiveReason.includes('Admission Letter:')) {
        effectiveReason = `${effectiveReason} | ${currentReg.declined_reason}`;
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
        message: `Registration ${trackingId} has been marked as Declined.`,
        registration: data,
      });
    }

    // SOFT DELETE: NEVER hard delete student records from production database
    if (action === 'delete') {
      const updatePayload: Record<string, any> = {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      };

      let { data, error } = await supabase
        .from('registrations')
        .update(updatePayload)
        .eq('tracking_id', trackingId)
        .select()
        .single();

      // Graceful fallback if is_deleted column does not yet exist
      if (error && (error.code === '42703' || error.message?.includes('is_deleted'))) {
        const retry = await supabase
          .from('registrations')
          .update({
            status: 'Archived',
            declined_reason: '[ARCHIVED] Record archived by administrator.',
          })
          .eq('tracking_id', trackingId)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        return NextResponse.json({ error: 'Failed to archive record: ' + error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Record ${trackingId} has been safely archived (soft deleted). It can be restored from the Archived tab.`,
        registration: data,
      });
    }

    // RESTORE: Restore an archived student record
    if (action === 'restore') {
      const updatePayload: Record<string, any> = {
        is_deleted: false,
        deleted_at: null,
        status: 'Pending',
      };

      let { data, error } = await supabase
        .from('registrations')
        .update(updatePayload)
        .eq('tracking_id', trackingId)
        .select()
        .single();

      if (error && (error.code === '42703' || error.message?.includes('is_deleted'))) {
        const retry = await supabase
          .from('registrations')
          .update({
            status: 'Pending',
            declined_reason: null,
          })
          .eq('tracking_id', trackingId)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        return NextResponse.json({ error: 'Failed to restore record: ' + error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Record ${trackingId} has been successfully restored.`,
        registration: data,
      });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
