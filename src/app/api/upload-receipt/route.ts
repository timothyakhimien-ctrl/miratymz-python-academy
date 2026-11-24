import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const trackingId = (formData.get('trackingId') as string || '').trim().toUpperCase();
    const file = formData.get('file') as File | null;
    const clearanceFile = formData.get('clearanceFile') as File | null;

    if (!trackingId) {
      return NextResponse.json(
        { error: 'Tracking ID is missing. Please restart your registration from Step 1.' },
        { status: 400 }
      );
    }

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: 'Please upload your payment receipt before submitting your payment details.' },
        { status: 400 }
      );
    }

    // Validate receipt file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Receipt file exceeds the 10MB limit. Please upload a smaller image or compressed PDF.' },
        { status: 400 }
      );
    }

    // Validate receipt MIME type
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid file format. Accepted formats: JPG, PNG, WebP, or PDF.' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Verify registration exists
    const { data: reg, error: fetchErr } = await supabase
      .from('registrations')
      .select('id, tracking_id, status, declined_reason')
      .eq('tracking_id', trackingId)
      .single();

    if (fetchErr || !reg) {
      return NextResponse.json(
        { error: `Registration record not found for Tracking ID "${trackingId}". Please check your code or register again.` },
        { status: 404 }
      );
    }

    // Prepare file for upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExt = file.name.split('.').pop() || 'jpg';
    const cleanFileName = `${trackingId}_${Date.now()}.${fileExt}`;
    const filePath = `${cleanFileName}`;

    // Upload receipt to Supabase Storage Bucket 'receipts'
    const { error: uploadErr } = await supabase.storage
      .from('receipts')
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (uploadErr) {
      console.error('Storage upload error:', uploadErr);
      return NextResponse.json(
        { error: 'Failed to upload receipt to storage: ' + uploadErr.message },
        { status: 500 }
      );
    }

    // Get public URL for payment receipt
    const { data: urlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Optional UNIBEN Admission Letter upload for university verification
    let clearanceUrl: string | null = null;
    if (clearanceFile && clearanceFile instanceof File && clearanceFile.size > 0) {
      try {
        if (clearanceFile.size <= MAX_FILE_SIZE) {
          const cBytes = await clearanceFile.arrayBuffer();
          const cBuffer = Buffer.from(cBytes);
          const cExt = clearanceFile.name.split('.').pop() || 'jpg';
          const cFileName = `admission_letter_${trackingId}_${Date.now()}.${cExt}`;
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
        }
      } catch (cErr) {
        console.warn('Admission letter upload warning:', cErr);
      }
    }

    // Update registration to 'Under Review'
    const updatePayload: Record<string, any> = {
      receipt_url: publicUrl,
      status: 'Under Review',
      paid_at: new Date().toISOString(),
    };

    if (clearanceUrl) {
      updatePayload.admission_letter_url = clearanceUrl;
      // Also store in declined_reason as backward-compatible fallback if the column is not yet queried
      updatePayload.declined_reason = `UNIBEN Admission Letter: ${clearanceUrl}`;
    }

    // Attempt update with admission_letter_url
    let { error: updateErr } = await supabase
      .from('registrations')
      .update(updatePayload)
      .eq('tracking_id', trackingId);

    // If admission_letter_url column does not exist yet in DB schema, retry without it
    if (updateErr && (updateErr.code === '42703' || updateErr.message?.includes('admission_letter_url'))) {
      delete updatePayload.admission_letter_url;
      const retry = await supabase
        .from('registrations')
        .update(updatePayload)
        .eq('tracking_id', trackingId);
      updateErr = retry.error;
    }

    if (updateErr) {
      console.error('Registration status update error:', updateErr);
      return NextResponse.json(
        { error: 'Failed to update payment status: ' + updateErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: 'Under Review',
      receiptUrl: publicUrl,
      admissionLetterUrl: clearanceUrl,
      message: 'Receipt uploaded successfully. Your payment has been submitted for review.',
    });
  } catch (err: any) {
    console.error('Upload Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
