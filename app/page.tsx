import { Cta } from '@/components/cta';
import FAQ from '@/components/faq';
import Features from '@/components/features';
import Footer from '@/components/footer';
import Hero from '@/components/hero';
import Navbar from '@/components/navbar';

export default function HomePage() {
  return (
    <main className='min-h-screen bg-background text-foreground'>
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
