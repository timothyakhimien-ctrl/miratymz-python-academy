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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Please choose a PDF material to upload.' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestampName = `python_course_guide_${Date.now()}.pdf`;

    // 1. Upload timestamped version
    await supabase.storage
      .from('receipts')
      .upload(timestampName, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    // 2. Upload/overwrite latest_python_course_guide.pdf for permanent reference
    const { error: uploadErr } = await supabase.storage
      .from('receipts')
      .upload('latest_python_course_guide.pdf', buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadErr) {
      console.error('Material upload error:', uploadErr);
      return NextResponse.json({ error: 'Failed to upload material to storage: ' + uploadErr.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from('receipts')
      .getPublicUrl('latest_python_course_guide.pdf');

    const publicUrl = urlData.publicUrl;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      message: 'Course Guide PDF uploaded successfully and live across all pages.',
    });
  } catch (err: any) {
    console.error('Upload Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
