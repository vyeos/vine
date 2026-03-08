'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LandingThemeToggle } from '@/components/landing-theme-toggle';
import { NavMenu } from '@/components/nav-menu';
import { NavigationSheet } from '@/components/navigation-sheet';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 h-16 border-b bg-background/80 backdrop-blur-md transition-[border-color,box-shadow] duration-300 ${
        scrolled
          ? 'border-border shadow-sm'
          : 'border-transparent shadow-none'
      }`}
    >
      <div className='mx-auto flex h-full max-w-(--breakpoint-xl) items-center justify-between px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-12'>
          <Link href='/' className='flex items-center justify-center p-2'>
            <Image
              src='/vine.png'
              alt='Vine Logo'
              width={32}
              height={32}
              className='object-contain'
            />
          </Link>
          <div className='hidden md:block'>
            <NavMenu />
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <Button asChild>
            <Link href='/sign-in'>Get Started</Link>
          </Button>
          <LandingThemeToggle />
          <div className='md:hidden'>
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
