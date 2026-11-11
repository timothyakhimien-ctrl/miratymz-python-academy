import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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

    const { data: settings } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (record.status === 'Approved') {
      whatsappLink = settings?.whatsapp_group_link || 'https://chat.whatsapp.com/invite/miratymz-python-vip';
    }

    if (record.status === 'Pending' || record.status === 'Declined') {
      bankDetails = {
        bankName: settings?.bank_name || 'OPay',
        accountNumber: settings?.account_number || '8100000000',
        accountName: settings?.account_name || 'MiraTymz Programming Academy',
      };
    }

    return NextResponse.json({
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
      bankDetails,
    });
  } catch (err: any) {
    console.error('Status Query Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
