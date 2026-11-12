import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    const { data: files } = await supabase.storage.from('receipts').list();
    const guideFiles = files?.filter((f: any) => f.name.includes('python_course_guide')) || [];
    let latestGuideUrl = null;
    let latestGuideName = null;
    let latestGuideDate = null;

    if (guideFiles && guideFiles.length > 0) {
      guideFiles.sort((a: any, b: any) => {
        const dateA = a.created_at || a.name;
        const dateB = b.created_at || b.name;
        return dateB.localeCompare(dateA);
      });
      const activeFile = guideFiles[0];
      const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(activeFile.name);
      latestGuideUrl = publicUrlData.publicUrl;
      latestGuideName = activeFile.name;
      latestGuideDate = activeFile.created_at;
    }

    return NextResponse.json(
      {
        success: true,
        settings: {
          ...settings,
          course_guide_url: latestGuideUrl,
          course_guide_name: latestGuideName,
          course_guide_date: latestGuideDate,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
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
