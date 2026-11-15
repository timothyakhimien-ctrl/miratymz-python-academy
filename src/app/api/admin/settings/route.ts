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

    // Fetch promotional and countdown settings from storage (or use smart defaults)
    let promoSettings = {
      enabled: true,
      unibenDiscountFee: 5950,
      unibenNormalFee: 8500,
      generalDiscountFee: 10000,
      generalNormalFee: 15000,
      limitedOfferSlots: 7,
      expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    };

    try {
      const { data: promoFile, error: promoErr } = await supabase.storage
        .from('receipts')
        .download('promo_settings.json');
      if (!promoErr && promoFile) {
        const text = await promoFile.text();
        const parsed = JSON.parse(text);
        promoSettings = {
          enabled: parsed.enabled !== undefined ? Boolean(parsed.enabled) : true,
          unibenDiscountFee: Number(parsed.unibenDiscountFee || parsed.unibenFee) || 5950,
          unibenNormalFee: Number(parsed.unibenNormalFee || parsed.unibenOriginalFee) || 8500,
          generalDiscountFee: Number(parsed.generalDiscountFee || parsed.generalFee) || 10000,
          generalNormalFee: Number(parsed.generalNormalFee || parsed.generalOriginalFee) || 15000,
          limitedOfferSlots: Number(parsed.limitedOfferSlots) || 7,
          expiresAt: parsed.expiresAt || new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
        };
      }
    } catch {
      // Fall back to default promoSettings
    }

    const isExpired = !promoSettings.enabled || (promoSettings.expiresAt && new Date(promoSettings.expiresAt).getTime() <= Date.now());
    const isOfferActive = promoSettings.enabled && !isExpired;

    const effectiveUniben = isOfferActive ? promoSettings.unibenDiscountFee : promoSettings.unibenNormalFee;
    const effectiveGeneral = isOfferActive ? promoSettings.generalDiscountFee : promoSettings.generalNormalFee;

    return NextResponse.json(
      {
        success: true,
        settings: {
          ...settings,
          uniben_fee: effectiveUniben,
          general_fee: effectiveGeneral,
          course_guide_url: latestGuideUrl,
          course_guide_name: latestGuideName,
          course_guide_date: latestGuideDate,
        },
        promoSettings,
        isOfferActive,
        effectiveFees: {
          uniben: effectiveUniben,
          general: effectiveGeneral,
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
      promoSettings,
    } = body;

    const supabase = getServiceSupabase();

    // Determine active fees based on promo toggle
    const isPromoEnabled = promoSettings ? Boolean(promoSettings.enabled) : true;
    const unibenDiscount = Number(promoSettings?.unibenDiscountFee) || 5950;
    const unibenNormal = Number(promoSettings?.unibenNormalFee) || 8500;
    const generalDiscount = Number(promoSettings?.generalDiscountFee) || 10000;
    const generalNormal = Number(promoSettings?.generalNormalFee) || 15000;

    const activeUnibenFee = isPromoEnabled ? unibenDiscount : unibenNormal;
    const activeGeneralFee = isPromoEnabled ? generalDiscount : generalNormal;

    const { data, error } = await supabase
      .from('admin_settings')
      .upsert({
        id: 1,
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        uniben_fee: activeUnibenFee,
        general_fee: activeGeneralFee,
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

    // Persist full promoSettings in Supabase storage
    const fullPromo = {
      enabled: isPromoEnabled,
      unibenDiscountFee: unibenDiscount,
      unibenNormalFee: unibenNormal,
      generalDiscountFee: generalDiscount,
      generalNormalFee: generalNormal,
      limitedOfferSlots: Number(promoSettings?.limitedOfferSlots) || 7,
      expiresAt: promoSettings?.expiresAt || new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    };

    try {
      const promoBuffer = Buffer.from(JSON.stringify(fullPromo, null, 2), 'utf-8');
      await supabase.storage
        .from('receipts')
        .upload('promo_settings.json', promoBuffer, {
          contentType: 'application/json',
          upsert: true,
        });
    } catch (uploadErr) {
      console.error('Failed to save promo settings to storage:', uploadErr);
    }

    return NextResponse.json({
      success: true,
      settings: data,
      promoSettings: fullPromo,
      effectiveFees: {
        uniben: activeUnibenFee,
        general: activeGeneralFee,
      },
      message: 'Bank details, fees, and promotional settings updated successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
