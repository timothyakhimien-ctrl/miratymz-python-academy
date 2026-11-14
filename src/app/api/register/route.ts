import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { generateTrackingId } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      institution,
      department,
      level,
      category,
      learningGoals,
      learning_goals,
    } = body;

    // Core validation: Full Name, Email, and Phone are always required
    if (!fullName || !fullName.trim() || !email || !email.trim() || !phone || !phone.trim()) {
      return NextResponse.json(
        { error: 'Please provide all required fields: Full Name, Email Address, and WhatsApp Phone Number.' },
        { status: 400 }
      );
    }

    const isUniben = category === 'uniben';

    // Institution is required only for UNIBEN students
    if (isUniben && (!institution || !institution.trim())) {
      return NextResponse.json(
        { error: 'Please enter your institution (e.g. University of Benin).' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Fetch current fees and bank details from admin_settings
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('id', 1)
      .single();

    let unibenFee = settings?.uniben_fee || 5950;
    let generalFee = settings?.general_fee || 10000;

    // Check promotional and countdown status
    try {
      const { data: promoFile } = await supabase.storage
        .from('receipts')
        .download('promo_settings.json');
      if (promoFile) {
        const promo = JSON.parse(await promoFile.text());
        const isExpired = promo.expiresAt && new Date(promo.expiresAt).getTime() < Date.now();
        if (promo.enabled && !isExpired) {
          unibenFee = promo.unibenDiscountFee || unibenFee;
          generalFee = promo.generalDiscountFee || generalFee;
        } else if (isExpired) {
          unibenFee = promo.unibenNormalFee || 8500;
          generalFee = promo.generalNormalFee || 15000;
        }
      }
    } catch {
      // fallback to default
    }

    const amount = isUniben ? unibenFee : generalFee;

    const trackingId = generateTrackingId();
    const effectiveGoals = (learningGoals || learning_goals || '').trim();

    // Prepare insert record
    const insertPayload: Record<string, any> = {
      tracking_id: trackingId,
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      institution: isUniben ? institution.trim() : 'General Public',
      department: isUniben ? (department?.trim() || 'General') : 'General',
      level: isUniben ? (level || '100 Level') : 'General',
      category: isUniben ? 'uniben' : 'general',
      amount,
      learning_mode: 'online',
      status: 'Pending',
    };

    if (effectiveGoals) {
      insertPayload.learning_goals = effectiveGoals;
    }

    // Attempt insertion
    let { data, error } = await supabase
      .from('registrations')
      .insert(insertPayload)
      .select()
      .single();

    // Graceful schema fallback: if learning_goals column does not yet exist in Supabase DB,
    // retry insert without that column so the student's registration is never blocked.
    if (error && (error.code === '42703' || error.message?.includes('learning_goals')) && insertPayload.learning_goals) {
      console.warn('learning_goals column missing in Supabase schema. Retrying without it...');
      delete insertPayload.learning_goals;
      const retry = await supabase
        .from('registrations')
        .insert(insertPayload)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('Registration insertion error:', error);
      return NextResponse.json(
        { error: 'Could not create registration record. ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      trackingId,
      amount,
      status: 'Pending',
      bankDetails: {
        bankName: settings?.bank_name || 'OPay / PalmPay',
        accountNumber: settings?.account_number || '8100000000',
        accountName: settings?.account_name || 'MiraTymz Programming Academy',
      },
    });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
