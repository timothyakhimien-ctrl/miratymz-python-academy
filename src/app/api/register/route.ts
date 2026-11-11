import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { generateTrackingId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

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
      learningMode,
    } = body;

    if (!fullName || !email || !phone || !institution) {
      return NextResponse.json(
        { error: 'Please provide all required fields (Full Name, Email, Phone, Institution).' },
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

    const unibenFee = settings?.uniben_fee || 5950;
    const generalFee = settings?.general_fee || 10000;
    const isUniben = category === 'uniben';
    const amount = isUniben ? unibenFee : generalFee;

    const trackingId = generateTrackingId();

    const { data, error } = await supabase
      .from('registrations')
      .insert({
        tracking_id: trackingId,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        institution: institution.trim(),
        department: department?.trim() || 'General',
        level: level || 'N/A',
        category: isUniben ? 'uniben' : 'general',
        amount,
        learning_mode: 'online',
        status: 'Pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Registration insertion error:', error);
      return NextResponse.json(
        { error: 'Could not create registration record. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      trackingId,
      amount,
      status: 'Pending',
      bankDetails: {
        bankName: settings?.bank_name || 'OPay',
        accountNumber: settings?.account_number || '8100000000',
        accountName: settings?.account_name || 'MiraTymz Programming Academy',
      },
    });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
