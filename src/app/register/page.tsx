import { Suspense } from 'react';
import { getPublicPromoSettings } from '@/lib/promo';
import RegisterClient from './RegisterClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RegisterPage() {
  const initialPromo = await getPublicPromoSettings();
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-500 font-semibold">Loading Enrollment Portal...</div>}>
      <RegisterClient initialPromo={initialPromo} />
    </Suspense>
  );
}
