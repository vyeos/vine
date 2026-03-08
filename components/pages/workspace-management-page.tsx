'use client';

import { useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { CreateWorkspaceDialog } from '@/components/Workspace/CreateWorkspaceDialog';
import { UpdateWorkspaceDialog } from '@/components/Workspace/UpdateWorkspaceDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteWorkspace, useUserWorkspaces } from '@/hooks/useWorkspace';
import { cn, getLastWorkspaceSlugs, updateLastWorkspaceCookie } from '@/lib/utils';

export function WorkspaceManagementPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<{
    id: string;
    name: string;
    slug: string;
  } | null>(null);
  const [workspaceToUpdate, setWorkspaceToUpdate] = useState<{
    slug: string;
    name: string;
  } | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ workspaceSlug?: string }>();
  const workspaceSlug = params.workspaceSlug;
  const { data: workspaces = [], isLoading } = useUserWorkspaces();
  const { current: lastUsedSlug } = getLastWorkspaceSlugs();
  const deleteWorkspace = useDeleteWorkspace();

  const getCurrentRoutePath = () => {
    if (!workspaceSlug) return '';
    const basePath = `/dashboard/${workspaceSlug}`;
    if (pathname.startsWith(basePath)) {
      const remainingPath = pathname.slice(basePath.length);
      return remainingPath || '';
    }
    return '';
  };

  const handleNavigateToWorkspace = (slug: string) => {
    updateLastWorkspaceCookie(slug);
    const currentRoutePath = getCurrentRoutePath();
    const targetPath = currentRoutePath
      ? `/dashboard/${slug}${currentRoutePath}`
      : `/dashboard/${slug}`;
    router.push(targetPath);
  };

  const confirmDelete = async () => {
    if (!workspaceToDelete) return;

    try {
      await deleteWorkspace.mutateAsync(workspaceToDelete.slug);
      setDeleteDialogOpen(false);
      setWorkspaceToDelete(null);
      router.push('/workspaces');
    } catch (error) {
      console.error('Error deleting workspace:', error);
    }
  };

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

  return (
    <div className='flex min-h-screen w-full flex-col items-center justify-center bg-background p-4'>
      <h1 className='mb-12 text-3xl text-foreground md:text-4xl'>Select a workspace</h1>

      <div className='mb-12 flex max-w-6xl flex-wrap justify-center gap-8'>
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className='flex flex-col items-center'>
                <Skeleton className='mb-4 h-48 w-48' />
                <Skeleton className='h-6 w-32' />
              </div>
            ))}
          </>
        ) : workspaces.length === 0 ? (
          <AddWorkspaceCard setShowCreateDialog={setShowCreateDialog} />
        ) : (
          <>
            {workspaces.map((workspace, index) => {
              const colorClass = workspaceColors[index % workspaceColors.length];
              const initials = workspace.name
                .split(' ')
                .map((part) => part[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={workspace.id}
                  role='button'
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNavigateToWorkspace(workspace.slug);
                    }
                  }}
                  className='group relative flex cursor-pointer flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl'
                  onClick={() => handleNavigateToWorkspace(workspace.slug)}
                >
                  <div
                    className={cn(
                      'mb-4 flex h-48 w-48 items-center justify-center rounded-xl transition-transform shadow-lg group-hover:scale-105 group-hover:shadow-2xl hover:shadow-2xl',
                      colorClass,
                    )}
                  >
                    {workspace.slug === lastUsedSlug && (
                      <Badge className='pointer-events-none absolute top-2 left-2 h-5 bg-accent-foreground px-1.5 text-[10px]'>
                        Last used
                      </Badge>
                    )}
                    <span className='text-6xl font-bold text-background'>{initials}</span>
                    {workspace.role === 'owner' && (
                      <>
                        <Button
                          variant='default'
                          size='icon'
                          className='absolute top-2 right-2 h-8 w-8 rounded-full bg-background/90 shadow-lg opacity-0 transition-opacity hover:bg-background group-hover:opacity-100'
                          onClick={(event) => {
                            event.stopPropagation();
                            setWorkspaceToUpdate({
                              slug: workspace.slug,
                              name: workspace.name,
                            });
                            setUpdateDialogOpen(true);
                          }}
                        >
                          <PencilIcon className='h-4 w-4 text-foreground' />
                        </Button>
                        <Button
                          variant='destructive'
                          size='icon'
                          className='absolute top-2 right-12 h-8 w-8 rounded-full shadow-lg opacity-0 transition-opacity group-hover:opacity-100'
                          onClick={(event) => {
                            event.stopPropagation();
                            setWorkspaceToDelete(workspace);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <TrashIcon className='h-4 w-4' />
                        </Button>
                      </>
                    )}
                  </div>
                  <span className='max-w-48 text-center text-lg text-muted-foreground transition-colors group-hover:text-foreground'>
                    {workspace.name}
                  </span>
                  <div className='mt-2 flex flex-col items-center gap-2'>
                    <Badge variant='outline' className='text-xs'>
                      {workspace.slug}
                    </Badge>
                    <Badge variant='secondary' className='text-xs'>
                      {workspace.role}
                    </Badge>
                  </div>
                </div>
              );
            })}

            <AddWorkspaceCard setShowCreateDialog={setShowCreateDialog} />
          </>
        )}
      </div>

      <Button
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push('/');
          }
        }}
        variant='outline'
        className='border-border text-foreground hover:border-border hover:bg-muted'
      >
        Back
      </Button>

      <CreateWorkspaceDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />

      {workspaceToUpdate && (
        <UpdateWorkspaceDialog
          open={updateDialogOpen}
          onOpenChange={(open) => {
            setUpdateDialogOpen(open);
            if (!open) setWorkspaceToUpdate(null);
          }}
          workspaceSlug={workspaceToUpdate.slug}
          currentName={workspaceToUpdate.name}
        />
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{workspaceToDelete?.name}&quot;? This action cannot be undone and will permanently delete all workspace data including:
              <ul className='mt-2 list-inside list-disc space-y-1'>
                <li>All posts</li>
                <li>All categories</li>
                <li>All tags</li>
                <li>All authors</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setDeleteDialogOpen(false);
                setWorkspaceToDelete(null);
              }}
              disabled={deleteWorkspace.isPending}
            >
              Cancel
            </Button>
            <Button variant='destructive' onClick={confirmDelete} disabled={deleteWorkspace.isPending}>
              {deleteWorkspace.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddWorkspaceCard({
  setShowCreateDialog,
}: {
  setShowCreateDialog: (open: boolean) => void;
}) {
  return (
    <div
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setShowCreateDialog(true);
        }
      }}
      className='group flex cursor-pointer flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl'
      onClick={() => setShowCreateDialog(true)}
    >
      <div className='mb-4 flex h-48 w-48 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/40 transition-all group-hover:border-primary group-hover:bg-muted/60'>
        <PlusIcon className='h-16 w-16 text-muted-foreground transition-colors group-hover:text-primary' />
      </div>
      <span className='text-lg text-muted-foreground transition-colors group-hover:text-foreground'>
        Add Workspace
      </span>
    </div>
  );
}
