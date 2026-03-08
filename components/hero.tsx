import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Hero({ badgeText }: { badgeText: string }) {
  const headingWords = 'A simple CMS for your next project'.split(' ');

  return (
    <div className='flex w-full flex-col items-center justify-center gap-10 px-6 py-12 md:gap-16 md:py-16 lg:py-24'>
      <div className='max-w-3xl text-center'>
        <Badge variant='secondary' className='animate-in fade-in-0 zoom-in-95 duration-500 rounded-full border-border py-1'>
          {badgeText}
        </Badge>
        <h1
          className='hero-heading mt-4 items-center justify-center text-4xl font-semibold leading-[1.1] tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl'
        >
          {headingWords.map((word, i) => (
            <span
              key={i}
              className='hero-word'
              style={{ '--wd': `${i * 80}ms` } as React.CSSProperties}
            >
              {word}
            </span>
          ))}
        </h1>
        <p className='mt-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 fill-mode-both text-foreground/80 md:text-lg' style={{ animationDelay: '500ms' }}>
          Write content in one place and fetch it from any frontend with a
          straightforward API, so your team can focus on what to say instead of
          how to wire it up.
        </p>
        <div className='mt-10 flex items-center justify-center gap-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 fill-mode-both' style={{ animationDelay: '650ms' }}>
          <Button size='lg' className='text-base' asChild>
            <Link href='/sign-in'>
              Get Started <ArrowUpRight className='h-5! w-5!' />
            </Link>
          </Button>
          <Button
            variant='outline'
            size='lg'
            className='text-base shadow-none'
            asChild
          >
            <Link href='/docs'>
              <BookOpen className='h-5! w-5!' /> Read Docs
            </Link>
          </Button>
        </div>
      </div>
      <div className='relative mx-auto aspect-video w-full max-w-(--breakpoint-xl) overflow-hidden rounded-xl border border-border shadow-lg animate-in fade-in-0 slide-in-from-bottom-8 duration-1000 fill-mode-both' style={{ animationDelay: '400ms' }}>
        <Image
          src='/vine-dashboard.png'
          alt='Vine Dashboard Dark'
          className='hidden object-cover dark:block'
          fill
          priority
          sizes='(max-width: 1280px) 100vw, 1280px'
        />
        <Image
          src='/vine-dashboard-light.png'
          alt='Vine Dashboard Light'
          className='block object-cover dark:hidden'
          fill
          priority
          sizes='(max-width: 1280px) 100vw, 1280px'
        />
      </div>
    </div>
  );
}
