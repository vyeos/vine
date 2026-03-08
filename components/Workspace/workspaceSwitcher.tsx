'use client';

import { useMemo, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { ChevronsUpDown, Settings } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useUserWorkspaces } from '@/hooks/useWorkspace';
import {
  getLastWorkspaceSlugs,
  getWorkspacePath,
  getWorkspacePathSuffix,
  updateLastWorkspaceCookie,
} from '@/lib/utils';

function RoleBadge({ role }: { role: string }) {
  return (
    <span className='inline-flex shrink-0 items-center rounded-full bg-secondary/80 px-1.5 py-0 text-[10px] font-medium text-secondary-foreground'>
      {role}
    </span>
  );
}

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ workspaceSlug?: string }>();
  const workspaceSlug = params.workspaceSlug;
  const { data: workspaces = [], isLoading } = useUserWorkspaces();
  const { previous: lastUsedSlug } = getLastWorkspaceSlugs();

  const getCurrentRoutePath = () => {
    return getWorkspacePathSuffix(pathname, workspaceSlug);
  };

  const currentWorkspace = useMemo(() => {
    if (!workspaceSlug) return null;
    return workspaces.find((workspace) => workspace.slug === workspaceSlug) ?? null;
  }, [workspaceSlug, workspaces]);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const workspaceColors = [
    'bg-chart-1',
    'bg-chart-2',
    'bg-chart-3',
    'bg-chart-4',
    'bg-chart-5',
    'bg-primary',
    'bg-secondary',
    'bg-accent',
  ];

  const getWorkspaceColor = (index: number) =>
    workspaceColors[index % workspaceColors.length];

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size='lg'
            className='justify-center group-data-[state=expanded]:justify-start'
          >
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted' />
            <div className='grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden'>
              <span className='truncate font-medium'>Loading...</span>
              <span className='truncate text-xs'>Please wait</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!currentWorkspace) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='justify-center group-data-[state=expanded]:justify-start'
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted'>
                  <span className='text-sm font-semibold'>?</span>
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden'>
                  <span className='truncate font-medium'>Select Workspace</span>
                  <span className='truncate text-xs'>Choose a workspace</span>
                </div>
                <ChevronsUpDown className='ml-auto group-data-[state=collapsed]:hidden' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='w-[280px]'>
              <DropdownMenuLabel>Your Workspaces</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {workspaces.map((workspace) => {
                const currentRoutePath = getCurrentRoutePath();
                const targetPath = currentRoutePath
                  ? `${getWorkspacePath(workspace.slug)}${currentRoutePath}`
                  : getWorkspacePath(workspace.slug, 'dashboard');

                return (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => {
                      setOpen(false);
                      router.push(targetPath);
                    }}
                    className='flex min-w-0 flex-col items-start gap-1.5'
                  >
                    <div className='flex w-full min-w-0 items-center gap-2'>
                      <span className='truncate text-sm font-medium'>{workspace.name}</span>
                      <RoleBadge role={workspace.role} />
                      {workspace.slug === lastUsedSlug && (
                        <Badge className='h-4 px-1.5 text-[10px]'>Last used</Badge>
                      )}
                    </div>
                    <span className='truncate text-xs text-muted-foreground'>
                      {workspace.slug}
                    </span>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  setOpen(false);
                  router.push('/workspaces');
                }}
              >
                <Settings className='mr-2 h-4 w-4' />
                Manage Workspaces
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const initials = getInitials(currentWorkspace.name);
  const currentIndex = workspaces.findIndex((workspace) => workspace.id === currentWorkspace.id);
  const colorClass = getWorkspaceColor(currentIndex);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='justify-center data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[state=expanded]:justify-start'
            >
              <div className={`flex aspect-square h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}>
                <span className='text-sm font-bold text-background'>{initials}</span>
              </div>
              <div className='grid min-w-0 flex-1 gap-1.5 text-left leading-relaxed group-data-[state=collapsed]:hidden'>
                <div className='flex min-w-0 items-center gap-2'>
                  <span className='truncate text-sm font-medium'>{currentWorkspace.name}</span>
                  <RoleBadge role={currentWorkspace.role} />
                </div>
                <span className='truncate text-xs text-muted-foreground'>
                  {currentWorkspace.slug}
                </span>
              </div>
              <ChevronsUpDown className='ml-auto group-data-[state=collapsed]:hidden' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            align='start'
            side='right'
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              Your Workspaces
            </DropdownMenuLabel>
            {workspaces.map((workspace) => {
              const wsInitials = getInitials(workspace.name);
              const wsIndex = workspaces.findIndex((item) => item.id === workspace.id);
              const wsColor = getWorkspaceColor(wsIndex);
              const isActive = workspace.id === currentWorkspace.id;
              const currentRoutePath = getCurrentRoutePath();
              const targetPath = currentRoutePath
                ? `${getWorkspacePath(workspace.slug)}${currentRoutePath}`
                : getWorkspacePath(workspace.slug, 'dashboard');

              return (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => {
                    if (!isActive) {
                      setOpen(false);
                      updateLastWorkspaceCookie(workspace.slug);
                      router.push(targetPath);
                    }
                  }}
                  className='gap-2 p-2'
                  disabled={isActive}
                >
                  <div className={`flex size-8 items-center justify-center rounded-md border ${wsColor}`}>
                    <span className='text-sm font-bold text-background'>{wsInitials}</span>
                  </div>
                  <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
                    <div className='flex min-w-0 items-center gap-2'>
                      <span className='truncate text-sm font-medium'>{workspace.name}</span>
                      <RoleBadge role={workspace.role} />
                      {workspace.slug === lastUsedSlug && (
                        <Badge className='h-4 px-1.5 text-[10px]'>Last used</Badge>
                      )}
                    </div>
                    <span className='truncate text-xs text-muted-foreground'>
                      {workspace.slug}
                    </span>
                  </div>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setOpen(false);
                router.push('/workspaces');
              }}
            >
              <Settings className='mr-2 h-4 w-4' />
              Manage Workspaces
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
