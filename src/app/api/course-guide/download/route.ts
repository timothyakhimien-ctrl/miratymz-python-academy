import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingId = searchParams.get('trackingId')?.trim();

    // STRICT PAYMENT GATE: Never allow PDF download without a verified paid Tracking ID
    if (!trackingId) {
      return NextResponse.redirect(new URL('/status?notice=verification_required', request.url));
    }

    const supabase = getServiceSupabase();

    // Verify student is actually approved (paid & verified)
    const { data: record, error } = await supabase
      .from('registrations')
      .select('status')
      .eq('tracking_id', trackingId.toUpperCase())
      .single();

    if (error || !record || (record.status !== 'Approved' && record.status !== 'Added to VIP Group')) {
      return NextResponse.redirect(
        new URL(`/status?q=${encodeURIComponent(trackingId)}&notice=pending_approval`, request.url)
      );
    }

    // Student is confirmed Approved / Added to VIP Group
    // 1. Check Supabase Storage for admin-uploaded course guide PDF
    const { data: files } = await supabase.storage.from('receipts').list();
    const guideFiles = files?.filter((f: any) => f.name.includes('python_course_guide')) || [];

    if (guideFiles.length > 0) {
      guideFiles.sort((a: any, b: any) => {
        const dateA = a.created_at || a.name;
        const dateB = b.created_at || b.name;
        return dateB.localeCompare(dateA);
      });
      const targetFileName = guideFiles[0].name;
      const { data: fileBlob, error: downloadErr } = await supabase.storage
        .from('receipts')
        .download(targetFileName);

      if (!downloadErr && fileBlob) {
        const arrayBuffer = await fileBlob.arrayBuffer();
        return new NextResponse(Buffer.from(arrayBuffer), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="MiraTymz_Python_Course_Guide.pdf"',
            'Cache-Control': 'no-store',
          },
        });
      }
    }

    // 2. Fallback to protected private_assets/syllabus.pdf on server
    const privatePath = path.join(process.cwd(), 'private_assets', 'syllabus.pdf');
    if (fs.existsSync(privatePath)) {
      const fileBuffer = fs.readFileSync(privatePath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="MiraTymz_Python_Course_Guide.pdf"',
          'Cache-Control': 'no-store',
        },
      });
    }

    return NextResponse.redirect(new URL(`/status?q=${encodeURIComponent(trackingId)}`, request.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL('/status', request.url));
  }
}
