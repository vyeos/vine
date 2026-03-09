'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { useLogout } from '@/hooks/useAuth';

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}) {
  const router = useRouter();
  const logoutMutation = useLogout();

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className='flex w-full items-stretch gap-2'>
          <Popover>
            <PopoverTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='flex-1 justify-center group-data-[state=expanded]:justify-start'
                aria-label='User menu'
                title='User menu'
              >
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className='rounded-lg bg-primary text-primary-foreground'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden'>
                  <span className='truncate font-medium'>{user.name}</span>
                  <span className='truncate text-xs text-muted-foreground'>{user.email}</span>
                </div>
              </SidebarMenuButton>
            </PopoverTrigger>

            <PopoverContent side='top' align='start' className='w-48 p-1'>
              <button
                onClick={() => router.push('/settings')}
                className='flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-sm transition-colors hover:bg-accent'
              >
                <Settings className='size-4 text-muted-foreground' />
                Settings
              </button>
              <button
                onClick={() => logoutMutation.mutate(undefined, { onSuccess: () => router.push('/sign-in') })}
                disabled={logoutMutation.isPending}
                className='flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50'
              >
                <LogOut className='size-4' />
                {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
              </button>
            </PopoverContent>
          </Popover>

          <div className='hidden group-data-[state=expanded]:flex'>
            <ThemeToggle className='h-12 w-12 rounded-md' />
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
