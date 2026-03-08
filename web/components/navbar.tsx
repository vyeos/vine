import Image from 'next/image';
import Link from 'next/link';
import { LandingThemeToggle } from '@/components/landing-theme-toggle';
import { NavMenu } from '@/components/nav-menu';
import { NavigationSheet } from '@/components/navigation-sheet';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  return (
    <nav className='sticky top-0 z-50 h-16 border-b bg-background/80 backdrop-blur-md'>
      <div className='mx-auto flex h-full max-w-(--breakpoint-xl) items-center justify-between px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-12'>
          <div className='flex items-center justify-center p-2'>
            <Image
              src='/hive.png'
              alt='Hive Logo'
              width={32}
              height={32}
              className='object-contain'
            />
          </div>
          <NavMenu className='hidden md:block' />
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
