import type { Metadata } from 'next';
import './globals.css';
import SiteShell from '@/components/SiteShell';
import { getPublicPromoSettings } from '@/lib/promo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Python Programming: Foundations & Practical Development | MiraTymz Programming Academy',
  description: '8-Week Intensive Python Training Programme by MiraTymz Programming Academy. Learn today, stay ahead with hands-on projects, industry curriculum, and physical/online mentorship.',
  openGraph: {
    title: 'Python Programming Programme | MiraTymz Academy',
    description: 'Special 30% discount for UNIBEN students. Learn today, stay ahead!',
    images: ['/flyer.png'],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialPromo = await getPublicPromoSettings();

  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col antialiased selection:bg-brand-500 selection:text-white">
        <SiteShell initialPromo={initialPromo}>{children}</SiteShell>
      </body>
    </html>
  );
}
