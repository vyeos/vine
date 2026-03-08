'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const icon =
    theme === 'dark' ? (
      <Moon className='h-4 w-4' />
    ) : theme === 'light' ? (
      <Sun className='h-4 w-4' />
    ) : (
      <Monitor className='h-4 w-4' />
    );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className={cn('h-9 w-9', className)}
          aria-label='Toggle theme'
        >
          {icon}
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' side='top' className='w-auto p-1'>
        <div className='flex items-center gap-0.5'>
          <Button
            variant={theme === 'light' ? 'secondary' : 'ghost'}
            size='icon'
            className='h-8 w-8'
            onClick={() => setTheme('light')}
            aria-label='Light theme'
          >
            <Sun className='h-4 w-4' />
          </Button>
          <Button
            variant={theme === 'dark' ? 'secondary' : 'ghost'}
            size='icon'
            className='h-8 w-8'
            onClick={() => setTheme('dark')}
            aria-label='Dark theme'
          >
            <Moon className='h-4 w-4' />
          </Button>
          <Button
            variant={theme === 'system' ? 'secondary' : 'ghost'}
            size='icon'
            className='h-8 w-8'
            onClick={() => setTheme('system')}
            aria-label='System theme'
          >
            <Monitor className='h-4 w-4' />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
