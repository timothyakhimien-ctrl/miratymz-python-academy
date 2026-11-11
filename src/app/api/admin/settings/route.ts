import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Helper to verify admin token header
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

export async function GET(request: Request) {
  try {
    const supabase = getServiceSupabase();
    const { data: settings, error } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    // List any course guide uploaded in storage
    const { data: files } = await supabase.storage.from('receipts').list('', {
      limit: 10,
      search: 'python_course_guide',
    });
    let latestGuideUrl = null;
    if (files && files.length > 0) {
      files.sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));
      const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(files[0].name);
      latestGuideUrl = publicUrlData.publicUrl;
    }

    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        course_guide_url: latestGuideUrl,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      bankName,
      accountNumber,
      accountName,
      unibenFee,
      generalFee,
      whatsappGroupLink,
      supportPhone,
    } = body;

    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from('admin_settings')
      .upsert({
        id: 1,
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        uniben_fee: Number(unibenFee) || 5950,
        general_fee: Number(generalFee) || 10000,
        whatsapp_group_link: whatsappGroupLink,
        support_phone: supportPhone,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Settings update error:', error);
      return NextResponse.json({ error: 'Could not update settings.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      settings: data,
      message: 'Bank details and academy settings updated successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
