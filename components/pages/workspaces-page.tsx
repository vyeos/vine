'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { CreateWorkspaceDialog } from '@/components/Workspace/CreateWorkspaceDialog';
import { useUserWorkspaces } from '@/hooks/useWorkspace';
import { Badge } from '@/components/ui/badge';
import { getWorkspacePath } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

function getRoleBadgeVariant(role: string) {
  if (role === 'owner') return 'default';
  if (role === 'admin') return 'secondary';
  return 'outline';
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const workspaceSurfaceClasses = [
  'bg-primary/90 text-primary-foreground shadow-[0_18px_50px_-22px_hsl(var(--primary)/0.75)]',
  'bg-secondary text-secondary-foreground shadow-[0_18px_50px_-22px_hsl(var(--secondary)/0.7)]',
  'bg-accent text-accent-foreground shadow-[0_18px_50px_-22px_hsl(var(--accent)/0.7)]',
  'bg-muted text-foreground shadow-[0_18px_50px_-22px_hsl(var(--foreground)/0.18)]',
];

export function WorkspacesPage() {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: workspaces, isLoading } = useUserWorkspaces();
  const hasWorkspaces = workspaces.length > 0;

  return (
    <>
      <main className='relative box-border min-h-dvh overflow-x-hidden bg-background px-4 py-8 sm:px-6 sm:py-12'>
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsla(var(--primary),0.12),transparent_30%),radial-gradient(circle_at_bottom,hsla(var(--accent),0.08),transparent_28%)]' />
        <div className='pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(hsl(var(--foreground))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground))_1px,transparent_1px)] [background-size:40px_40px]' />

        <div className='relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center'>
          <div className='w-full max-w-3xl space-y-10 text-center'>
            <div className='space-y-3'>
              <div className='space-y-2'>
                <h1 className='text-4xl font-semibold tracking-tight text-foreground sm:text-5xl'>
                  Select a workspace
                </h1>
                <p className='mx-auto max-w-xl text-sm leading-6 text-muted-foreground sm:text-base'>
                  Choose where you want to work, or spin up a new workspace for another team,
                  brand, or project.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className='space-y-4'>
                    <Skeleton className='aspect-square w-full rounded-[2rem]' />
                    <Skeleton className='mx-auto h-5 w-40 rounded-md' />
                    <Skeleton className='mx-auto h-4 w-24 rounded-md' />
                  </div>
                ))}
              </div>
            ) : (
              <div className='grid grid-cols-1 justify-center gap-3.5 sm:grid-cols-2 lg:grid-cols-3'>
                {workspaces.map((workspace, index) => (
                  <button
                    key={workspace.id}
                    type='button'
                    onClick={() => router.push(getWorkspacePath(workspace.slug))}
                    className='group flex flex-col items-center text-center'
                  >
                    <div
                      className={`flex aspect-square w-full max-w-[172px] items-center justify-center rounded-[1.35rem] border border-border/40 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-[1.01] group-hover:border-border/80 ${workspaceSurfaceClasses[index % workspaceSurfaceClasses.length]}`}
                    >
                      <span className='text-3xl font-semibold tracking-tight sm:text-4xl'>
                        {getInitials(workspace.name)}
                      </span>
                    </div>
                    <div className='mt-3 space-y-1'>
                      <p className='text-sm font-medium tracking-tight text-foreground sm:text-[15px]'>
                        {workspace.name}
                      </p>
                      <p className='text-sm text-muted-foreground'>/{workspace.slug}</p>
                      <div className='flex justify-center'>
                        <Badge variant={getRoleBadgeVariant(workspace.role)}>
                          {workspace.role}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}

                <button
                  type='button'
                  onClick={() => setCreateDialogOpen(true)}
                  className='group flex flex-col items-center text-center'
                >
                  <div className='flex aspect-square w-full max-w-[172px] items-center justify-center rounded-[1.35rem] border border-dashed border-border/70 bg-card/40 text-muted-foreground transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:bg-card/70 group-hover:text-foreground'>
                    <Plus className='h-10 w-10 stroke-[1.5]' />
                  </div>
                  <div className='mt-3 space-y-1'>
                    <p className='text-sm font-medium tracking-tight text-foreground sm:text-[15px]'>
                      Add Workspace
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Create a fresh space for new content.
                    </p>
                  </div>
                </button>
              </div>
            )}

            {!isLoading && !hasWorkspaces && (
              <p className='text-sm text-muted-foreground'>
                You don&apos;t have any workspaces yet. Start by creating your first one.
              </p>
            )}
          </div>
        </div>
      </main>

      <CreateWorkspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={(workspaceSlug) => {
          router.replace(getWorkspacePath(workspaceSlug));
        }}
      />
    </>
  );
}
