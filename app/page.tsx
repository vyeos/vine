import { redirect } from 'next/navigation';
import { isAuthenticatedNextjs } from '@convex-dev/auth/nextjs/server';
import { AuthenticatedWorkspaceRedirect } from '@/components/authenticated-workspace-redirect';
import { Cta } from '@/components/cta';
import FAQ from '@/components/faq';
import Features from '@/components/features';
import Footer from '@/components/footer';
import Hero from '@/components/hero';
import Navbar from '@/components/navbar';
import { getViewerDashboardDestination } from '@/lib/server-navigation';
import {
  generateStructuredData,
  generateOrganizationData,
  generateWebSiteData,
} from '@/lib/structured-data';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  if (await isAuthenticatedNextjs()) {
    const destination = await getViewerDashboardDestination();

    if (destination) {
      redirect(destination);
    }
  }

  const structuredData = [
    generateStructuredData(),
    generateOrganizationData(),
    generateWebSiteData(),
  ];

  return (
    <main className='min-h-screen bg-background text-foreground'>
      <AuthenticatedWorkspaceRedirect />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />
      <Hero badgeText='Just released v1! 🎉' />
      <Features />
      <FAQ />
      <Cta
        heading='Ready to get started?'
        description='Get started with Vine today and start managing your content the smart way.'
        buttons={{
          primary: {
            text: 'Get Started',
            url: '/sign-in',
          },
        }}
      />
      <Footer />
    </main>
  );
}
