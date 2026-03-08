'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LandingThemeToggle() {
  const { theme, setTheme } = useTheme();

  const icon =
    theme === 'dark' ? (
      <Moon className='h-5 w-5' />
    ) : theme === 'light' ? (
      <Sun className='h-5 w-5' />
    ) : (
      <Monitor className='h-5 w-5' />
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size='icon' variant='outline' aria-label='Toggle theme'>
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='min-w-[120px] p-1'>
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className='cursor-pointer gap-2 px-2 py-1.5'
        >
          <Sun className='h-4 w-4' />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className='cursor-pointer gap-2 px-2 py-1.5'
        >
          <Moon className='h-4 w-4' />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className='cursor-pointer gap-2 px-2 py-1.5'
        >
          <Monitor className='h-4 w-4' />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
