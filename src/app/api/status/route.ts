import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    if (!query) {
      return NextResponse.json({ error: 'Please enter a Tracking ID, Email, or Phone number.' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Query registrations by tracking_id, email, or phone
    const { data: records, error } = await supabase
      .from('registrations')
      .select('*')
      .or(`tracking_id.eq.${query.toUpperCase()},email.ilike.${query},phone.eq.${query}`)
      .order('created_at', { ascending: false });

    if (error || !records || records.length === 0) {
      return NextResponse.json(
        { error: 'No registration record found matching that search. Please check your Tracking ID or Phone number.' },
        { status: 404 }
      );
    }

    const record = records[0];

    // If approved, fetch WhatsApp group link from settings
    let whatsappLink = null;
    let bankDetails = null;
    let adminPhone = null;
    let courseGuideUrl = null;

    const { data: settings } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('id', 1)
      .single();

    adminPhone = settings?.support_phone || '2348100000000';

    // Fetch the latest uploaded PDF guide so students can download the curriculum guide
    const { data: files } = await supabase.storage.from('receipts').list();
    const guideFiles = files?.filter((f: any) => f.name.includes('python_course_guide')) || [];
    if (guideFiles.length > 0) {
      guideFiles.sort((a: any, b: any) => {
        const dateA = a.created_at || a.name;
        const dateB = b.created_at || b.name;
        return dateB.localeCompare(dateA);
      });
      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(guideFiles[0].name);
      courseGuideUrl = urlData.publicUrl;
    }

    if (record.status === 'Approved' || record.status === 'Added to VIP Group') {
      whatsappLink = settings?.whatsapp_group_link || null;
    }

    if (record.status === 'Pending' || record.status === 'Declined') {
      bankDetails = {
        bankName: settings?.bank_name || 'OPay',
        accountNumber: settings?.account_number || '8100000000',
        accountName: settings?.account_name || 'MiraTymz Programming Academy',
      };
    }

    return NextResponse.json(
      {
        success: true,
        registration: {
          trackingId: record.tracking_id,
          fullName: record.full_name,
          email: record.email,
          phone: record.phone,
          institution: record.institution,
          department: record.department,
          category: record.category,
          amount: record.amount,
          status: record.status,
          receiptUrl: record.receipt_url,
          declinedReason: record.declined_reason,
          createdAt: record.created_at,
          paidAt: record.paid_at,
          approvedAt: record.approved_at,
        },
        whatsappLink,
        adminPhone,
        courseGuideUrl,
        bankDetails,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Surrogate-Control': 'no-store',
        },
      }
    );
  } catch (err: any) {
    console.error('Status Query Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
