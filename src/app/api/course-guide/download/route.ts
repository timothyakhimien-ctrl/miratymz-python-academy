import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingId = searchParams.get('trackingId')?.trim();

    // If no tracking ID provided or visitor is unverified, redirect to status verification
    if (!trackingId) {
      return NextResponse.redirect(new URL('/status?notice=verification_required', request.url));
    }

    const supabase = getServiceSupabase();

    // Verify student is actually approved
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

    // Student is confirmed approved – redirect to latest uploaded course guide in storage
    const { data: files } = await supabase.storage.from('receipts').list();
    const guideFiles = files?.filter((f: any) => f.name.includes('python_course_guide')) || [];
    let targetFileName = 'latest_python_course_guide.pdf';

    if (guideFiles.length > 0) {
      guideFiles.sort((a: any, b: any) => {
        const dateA = a.created_at || a.name;
        const dateB = b.created_at || b.name;
        return dateB.localeCompare(dateA);
      });
      targetFileName = guideFiles[0].name;
    }

    const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(targetFileName);
    return NextResponse.redirect(urlData.publicUrl);
  } catch (err: any) {
    return NextResponse.redirect(new URL('/status', request.url));
  }
}
