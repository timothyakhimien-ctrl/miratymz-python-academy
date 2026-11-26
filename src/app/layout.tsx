import type { Metadata } from 'next';
import './globals.css';
import SiteShell from '@/components/SiteShell';
import { getPublicPromoSettings } from '@/lib/promo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL = 'https://miratymz-python-academy.vercel.app';
const OG_IMAGE_URL = `${SITE_URL}/og-image.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'MiraTymz Programming Academy | 8-Week Practical Python Mastery Programme',
  description:
    'MiraTymz Programming Academy — 8-week practical Python training for university undergraduates, secondary school students, and working professionals. Build real software, automation tools, and portfolio projects.',
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/`,
    siteName: 'MiraTymz Programming Academy',
    title: 'MiraTymz Programming Academy',
    description:
      '8-week practical Python programming training for university undergraduates, secondary school students, and professionals. Learn real programming and build real software.',
    images: [
      {
        url: OG_IMAGE_URL,
        secureUrl: OG_IMAGE_URL,
        alt: 'MiraTymz Programming Academy — Learn Python with MiraTymz!',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MiraTymz Programming Academy',
    description:
      '8-week practical Python programming training for university undergraduates, secondary school students, and professionals. Learn real programming and build real software.',
    images: [OG_IMAGE_URL],
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
