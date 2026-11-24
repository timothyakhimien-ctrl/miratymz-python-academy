import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { generateTrackingId } from '@/lib/utils';
import { verifySchoolCode } from '@/lib/schools';

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
      schoolId,
      schoolCode,
      classLevel,
    } = body;

    // Core validation: Full Name, Email, and Phone are always required
    if (!fullName || !fullName.trim() || !email || !email.trim() || !phone || !phone.trim()) {
      return NextResponse.json(
        { error: 'Please provide all required fields: Full Name, Email Address, and WhatsApp Phone Number.' },
        { status: 400 }
      );
    }

    const isUniben = category === 'uniben';
    const isSchool = category === 'school';

    // Institution is required for UNIBEN students
    if (isUniben && (!institution || !institution.trim())) {
      return NextResponse.json(
        { error: 'Please enter your institution (e.g. University of Benin).' },
        { status: 400 }
      );
    }

    let verifiedSchool: any = null;
    if (isSchool) {
      if (!schoolId || !schoolCode || !schoolCode.trim()) {
        return NextResponse.json(
          { error: 'Please select your school and enter the valid school access code provided to your school.' },
          { status: 400 }
        );
      }

      const verifyResult = await verifySchoolCode(schoolId, schoolCode);
      if (!verifyResult.valid || !verifyResult.school) {
        return NextResponse.json(
          { error: verifyResult.message || 'Invalid school access code. Please verify the code with your school.' },
          { status: 400 }
        );
      }
      verifiedSchool = verifyResult.school;
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
        const isExpired = !promo.enabled || (promo.expiresAt && new Date(promo.expiresAt).getTime() <= Date.now());
        if (promo.enabled && !isExpired) {
          unibenFee = Number(promo.unibenDiscountFee) || 5950;
          generalFee = Number(promo.generalDiscountFee) || 10000;
        } else {
          unibenFee = Number(promo.unibenNormalFee) || 8500;
          generalFee = Number(promo.generalNormalFee) || 15000;
        }
      }
    } catch {
      // fallback to default
    }

    let amount = generalFee;
    if (isSchool) {
      amount = verifiedSchool.fee || 5000; // Strictly ₦5,000 for verified school students
    } else if (isUniben) {
      amount = unibenFee;
    }

    const trackingId = generateTrackingId();
    const effectiveGoals = (learningGoals || learning_goals || '').trim();

    // Prepare insert record using verified standard PostgreSQL columns
    const insertPayload: Record<string, any> = {
      tracking_id: trackingId,
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      institution: isSchool ? verifiedSchool.name : isUniben ? institution.trim() : 'General Public',
      department: isSchool ? (classLevel?.trim() || 'Secondary School') : isUniben ? (department?.trim() || 'General') : 'General',
      level: isSchool ? 'School Student' : isUniben ? (level || '100 Level') : 'General',
      category: isSchool ? 'school' : isUniben ? 'uniben' : 'general',
      amount,
      learning_mode: 'online',
      status: 'Pending',
    };

    if (effectiveGoals) {
      insertPayload.learning_goals = effectiveGoals;
    }

    // Attempt insertion
    const { data, error } = await supabase
      .from('registrations')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Registration insertion error:', error);
      return NextResponse.json(
        { error: 'Could not create registration record. ' + error.message },
        { status: 500 }
      );
    }

    // Determine bank details to return
    let bankDetails = {
      bankName: settings?.bank_name || 'OPay / PalmPay',
      accountNumber: settings?.account_number || '8100000000',
      accountName: settings?.account_name || 'MiraTymz Programming Academy',
      paymentInstructions: 'Transfer the exact amount and upload your transfer receipt as proof of payment.',
      hasPaymentConfigured: true,
      paymentMethod: 'bank_transfer',
    };

    if (isSchool && verifiedSchool) {
      if (verifiedSchool.hasPaymentConfigured && verifiedSchool.accountNumber) {
        bankDetails = {
          bankName: verifiedSchool.bankName || settings?.bank_name || 'Bank Transfer',
          accountNumber: verifiedSchool.accountNumber,
          accountName: verifiedSchool.accountName || verifiedSchool.name,
          paymentInstructions: verifiedSchool.paymentInstructions || 'Transfer the ₦5,000 discounted student tuition.',
          hasPaymentConfigured: true,
          paymentMethod: verifiedSchool.paymentMethod || 'bank_transfer',
        };
      } else {
        bankDetails = {
          bankName: 'Pending School Arrangement',
          accountNumber: 'N/A',
          accountName: verifiedSchool.name,
          paymentInstructions: verifiedSchool.paymentInstructions || 'Payment arrangements for this school are currently being finalized with the school administration. Please contact your school coordinator.',
          hasPaymentConfigured: false,
          paymentMethod: 'pending',
        };
      }
    }

    return NextResponse.json({
      success: true,
      trackingId,
      amount,
      status: 'Pending',
      category: insertPayload.category,
      schoolName: isSchool ? verifiedSchool.name : null,
      bankDetails,
    });
  } catch (err: any) {
    console.error('Registration API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
