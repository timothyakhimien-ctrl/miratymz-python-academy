import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('q')?.trim();

    if (!rawQuery) {
      return NextResponse.json({ error: 'Please enter a Tracking ID, Email, or Phone number.' }, { status: 400 });
    }

    // Sanitize search query input
    const query = rawQuery.replace(/[,%()\"\'\\]/g, '').trim();
    if (!query) {
      return NextResponse.json({ error: 'Please enter a valid Tracking ID, Email, or Phone number.' }, { status: 400 });
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

    // Prioritize Approved / Added to VIP Group / Under Review over Pending records
    const statusPriority: Record<string, number> = {
      'Added to VIP Group': 1,
      'Approved': 2,
      'Under Review': 3,
      'Declined': 4,
      'Pending': 5,
    };

    const sortedRecords = [...records].sort((a, b) => {
      const pA = statusPriority[a.status] || 99;
      const pB = statusPriority[b.status] || 99;
      if (pA !== pB) return pA - pB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const record = sortedRecords[0];

    // Fetch settings
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

    // Only approved students who have been verified can download the complimentary course guide PDF
    if (record.status === 'Approved' || record.status === 'Added to VIP Group') {
      whatsappLink = settings?.whatsapp_group_link || null;

      try {
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
      } catch (err) {
        console.warn('Could not list course guide files:', err);
      }
    }

    if (record.status === 'Pending' || record.status === 'Declined') {
      bankDetails = {
        bankName: settings?.bank_name || 'OPay / PalmPay',
        accountNumber: settings?.account_number || '8100000000',
        accountName: settings?.account_name || 'MiraTymz Programming Academy',
      };
    }

    // Detect admission letter URL if present in declined_reason
    let admissionLetterUrl = record.admission_letter_url || null;
    if (!admissionLetterUrl && record.declined_reason?.includes('Admission Letter:')) {
      const match = record.declined_reason.match(/https?:\/\/[^\s]+/);
      if (match) {
        admissionLetterUrl = match[0];
      }
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
          admissionLetterUrl,
          declinedReason: record.declined_reason,
          createdAt: record.created_at,
          paidAt: record.paid_at,
          approvedAt: record.approved_at,
          schoolId: record.school_id,
          schoolName: record.school_name,
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
