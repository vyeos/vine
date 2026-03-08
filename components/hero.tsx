import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Hero({ badgeText }: { badgeText: string }) {
  return (
    <div className='flex w-full flex-col items-center justify-center gap-10 px-6 py-12 md:gap-16 md:py-16 lg:py-24'>
      <div className='max-w-3xl text-center'>
        <Badge variant='secondary' className='rounded-full border-border py-1'>
          {badgeText}
        </Badge>
        <h1 className='mt-6 text-4xl font-semibold tracking-tighter sm:text-5xl md:text-6xl md:leading-[1.2] lg:text-7xl'>
          A simple CMS
          <br />
          for your next project
        </h1>
        <p className='mt-6 text-foreground/80 md:text-lg'>
          Write content in one place and fetch it from any frontend with a
          straightforward API, so your team can focus on what to say instead of
          how to wire it up.
        </p>
        <div className='mt-10 flex items-center justify-center gap-4'>
          <Button size='lg' className='rounded-full text-base' asChild>
            <Link href='/sign-in'>
              Get Started <ArrowUpRight className='h-5! w-5!' />
            </Link>
          </Button>
          <Button
            variant='outline'
            size='lg'
            className='rounded-full text-base shadow-none'
            asChild
          >
            <Link href='/docs'>
              <BookOpen className='h-5! w-5!' /> Read Docs
            </Link>
          </Button>
        </div>
      </div>
      <div className='relative mx-auto aspect-video w-full max-w-(--breakpoint-xl) overflow-hidden rounded-xl border border-foreground/10 shadow-[0_0_40px_0_rgba(0,0,0,0.1)] shadow-primary/15'>
        <Image
          src='/vine-dashboard.png'
          alt='Vine Dashboard Dark'
          className='hidden object-cover dark:block'
          fill
        />
        <Image
          src='/vine-dashboard-light.png'
          alt='Vine Dashboard Light'
          className='block object-cover dark:hidden'
          fill
        />
      </div>
    </div>
  );
}
