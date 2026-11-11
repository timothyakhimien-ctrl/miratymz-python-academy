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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Please choose a PDF material to upload.' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `python_course_guide_${Date.now()}.pdf`;

    const { error: uploadErr } = await supabase.storage
      .from('receipts')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadErr) {
      console.error('Material upload error:', uploadErr);
      return NextResponse.json({ error: 'Failed to upload material to storage.' }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Save into admin_settings support_phone or a json field if needed
    // We update admin_settings with material_url
    await supabase
      .from('admin_settings')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: 'Course guide PDF uploaded successfully.',
    });
  } catch (err: any) {
    console.error('Upload Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
