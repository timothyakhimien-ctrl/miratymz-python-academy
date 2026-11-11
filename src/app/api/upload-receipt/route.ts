import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const trackingId = formData.get('trackingId') as string;
    const file = formData.get('file') as File;
    const clearanceFile = formData.get('clearanceFile') as File | null;

    if (!trackingId || !file) {
      return NextResponse.json(
        { error: 'Tracking ID and receipt file are required.' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Verify registration exists
    const { data: reg, error: fetchErr } = await supabase
      .from('registrations')
      .select('id, tracking_id')
      .eq('tracking_id', trackingId)
      .single();

    if (fetchErr || !reg) {
      return NextResponse.json(
        { error: 'Registration record not found for this Tracking ID.' },
        { status: 404 }
      );
    }

    // Prepare file for upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExt = file.name.split('.').pop() || 'jpg';
    const cleanFileName = `${trackingId}_${Date.now()}.${fileExt}`;
    const filePath = `${cleanFileName}`;

    // Upload to Supabase Storage Bucket 'receipts'
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('receipts')
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (uploadErr) {
      console.error('Storage upload error:', uploadErr);
      return NextResponse.json(
        { error: 'Failed to upload receipt. Please check file format and try again.' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Optional clearance slip upload for UNIBEN students
    let clearanceUrl: string | null = null;
    if (clearanceFile && clearanceFile.size > 0) {
      try {
        const cBytes = await clearanceFile.arrayBuffer();
        const cBuffer = Buffer.from(cBytes);
        const cExt = clearanceFile.name.split('.').pop() || 'jpg';
        const cFileName = `clearance_${trackingId}_${Date.now()}.${cExt}`;
        const { error: cUploadErr } = await supabase.storage
          .from('receipts')
          .upload(cFileName, cBuffer, {
            contentType: clearanceFile.type || 'image/jpeg',
            upsert: true,
          });
        if (!cUploadErr) {
          const { data: cUrlData } = supabase.storage
            .from('receipts')
            .getPublicUrl(cFileName);
          clearanceUrl = cUrlData.publicUrl;
        }
      } catch (cErr) {
        console.warn('Clearance upload warning:', cErr);
      }
    }

    // Update registration to 'Under Review'
    const updatePayload: Record<string, any> = {
      receipt_url: publicUrl,
      status: 'Under Review',
      paid_at: new Date().toISOString(),
    };
    if (clearanceUrl) {
      updatePayload.declined_reason = `UNIBEN Clearance Slip: ${clearanceUrl}`;
    }

    const { error: updateErr } = await supabase
      .from('registrations')
      .update(updatePayload)
      .eq('tracking_id', trackingId);

    if (updateErr) {
      console.error('Registration status update error:', updateErr);
      return NextResponse.json(
        { error: 'Failed to update payment status.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: 'Under Review',
      receiptUrl: publicUrl,
      message: 'Proof of payment submitted successfully. Your transaction is now under review.',
    });
  } catch (err: any) {
    console.error('Upload Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
