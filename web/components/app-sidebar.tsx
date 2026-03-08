'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { FileText, Image, Key, Layers, SquareTerminal, Tag, UserCog, Users } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { WorkspaceSwitcher } from '@/components/Workspace/workspaceSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Dashboard', url: '', icon: SquareTerminal },
  { title: 'Posts', url: 'posts', icon: FileText },
  { title: 'Authors', url: 'authors', icon: Users },
  { title: 'Categories', url: 'categories', icon: Layers },
  { title: 'Tags', url: 'tags', icon: Tag },
  { title: 'Media', url: 'media', icon: Image },
  { title: 'Members', url: 'members', icon: UserCog },
];

const developerItems = [{ title: 'API Keys', url: 'keys', icon: Key }];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { data: user, isLoading } = useAuth();
  const params = useParams<{ workspaceSlug?: string }>();
  const workspaceSlug = params.workspaceSlug;

  const navMainItems = navItems.map((item) => ({
    ...item,
    url: workspaceSlug
      ? item.url
        ? `/dashboard/${workspaceSlug}/${item.url}`
        : `/dashboard/${workspaceSlug}`
      : item.url
        ? `/dashboard/${item.url}`
        : '/dashboard',
  }));

  const navDeveloperItems = developerItems.map((item) => ({
    ...item,
    url: workspaceSlug
      ? `/dashboard/${workspaceSlug}/${item.url}`
      : `/dashboard/${item.url}`,
  }));

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
        <NavMain items={navDeveloperItems} label='Developers' />
      </SidebarContent>
      <SidebarFooter>
        {isLoading ? (
          <Skeleton className='h-14 w-full' />
        ) : user ? (
          <NavUser user={user} />
        ) : null}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
