import { getPublicPromoSettings } from '@/lib/promo';
import HomePageClient from './HomePageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const initialPromo = await getPublicPromoSettings();
  return <HomePageClient initialPromo={initialPromo} />;
}
