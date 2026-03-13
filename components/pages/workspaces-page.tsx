'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderPlus } from 'lucide-react';
import { CreateWorkspaceDialog } from '@/components/Workspace/CreateWorkspaceDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getWorkspacePath } from '@/lib/utils';

export function WorkspacesPage() {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <>
      <main className='grid min-h-screen place-items-center bg-muted/20 p-4'>
        <Card className='w-full max-w-lg border-border/60 shadow-sm'>
          <CardHeader className='space-y-3 text-center'>
            <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
              <FolderPlus className='h-6 w-6' />
            </div>
            <div className='space-y-1'>
              <CardTitle>Create your first workspace</CardTitle>
              <CardDescription>
                Workspaces help you organize posts, media, members, and API keys in one place.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <Button
              className='w-full'
              onClick={() => setCreateDialogOpen(true)}
            >
              <FolderPlus className='mr-2 h-4 w-4' />
              Create Workspace
            </Button>
            <p className='text-center text-sm text-muted-foreground'>
              You&apos;ll be taken straight into the workspace once it&apos;s created.
            </p>
          </CardContent>
        </Card>
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
