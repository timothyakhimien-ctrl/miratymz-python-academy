import { getServiceSupabase } from './supabase';

export interface PublicPromoData {
  isOfferActive: boolean;
  unibenFee: number;
  generalFee: number;
  unibenDiscountFee: number;
  unibenNormalFee: number;
  generalDiscountFee: number;
  generalNormalFee: number;
  limitedOfferSlots: number;
  expiresAt: string;
}

export async function getPublicPromoSettings(): Promise<PublicPromoData> {
  // Default values
  const defaultPromo: PublicPromoData = {
    isOfferActive: true,
    unibenFee: 5950,
    generalFee: 10000,
    unibenDiscountFee: 5950,
    unibenNormalFee: 8500,
    generalDiscountFee: 10000,
    generalNormalFee: 15000,
    limitedOfferSlots: 7,
    expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
  };

  try {
    const supabase = getServiceSupabase();

    // 1. Fetch admin_settings
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('uniben_fee, general_fee')
      .eq('id', 1)
      .single();

    // 2. Fetch promo_settings.json from storage
    let promoFileParsed: any = null;
    try {
      const { data: promoFile, error } = await supabase.storage
        .from('receipts')
        .download('promo_settings.json');
      if (!error && promoFile) {
        promoFileParsed = JSON.parse(await promoFile.text());
      }
    } catch {
      // Storage file optional
    }

    const enabled = promoFileParsed
      ? promoFileParsed.enabled !== false
      : true;

    const unibenDiscount = Number(promoFileParsed?.unibenDiscountFee || promoFileParsed?.unibenFee) || 5950;
    const unibenNormal = Number(promoFileParsed?.unibenNormalFee || promoFileParsed?.unibenOriginalFee) || 8500;
    const generalDiscount = Number(promoFileParsed?.generalDiscountFee || promoFileParsed?.generalFee) || 10000;
    const generalNormal = Number(promoFileParsed?.generalNormalFee || promoFileParsed?.generalOriginalFee) || 15000;
    const limitedOfferSlots = Number(promoFileParsed?.limitedOfferSlots) || 7;
    const expiresAt = promoFileParsed?.expiresAt || defaultPromo.expiresAt;

    const isExpired = !enabled || (expiresAt && new Date(expiresAt).getTime() <= Date.now());
    const isOfferActive = enabled && !isExpired;

    const activeUniben = isOfferActive ? unibenDiscount : unibenNormal;
    const activeGeneral = isOfferActive ? generalDiscount : generalNormal;

    return {
      isOfferActive,
      unibenFee: activeUniben,
      generalFee: activeGeneral,
      unibenDiscountFee: unibenDiscount,
      unibenNormalFee: unibenNormal,
      generalDiscountFee: generalDiscount,
      generalNormalFee: generalNormal,
      limitedOfferSlots,
      expiresAt,
    };
  } catch (err) {
    console.error('Error in getPublicPromoSettings:', err);
    return defaultPromo;
  }
}
