'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chrome, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const INVITE_TOKEN_KEY = 'vine-invite-token';

/**
 * Stores the invite token in sessionStorage so that after Google sign-in,
 * the app can look it up and call the acceptance mutation.
 */
export function AcceptInviteClient({ token }: { token: string }) {
  const router = useRouter();
  const [stored, setStored] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(INVITE_TOKEN_KEY, token);
      setStored(true);
    } catch {
      // sessionStorage unavailable (e.g., private browsing limits)
    }
  }, [token]);

  return (
    <main className='grid min-h-screen place-items-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Workspace Invitation</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join a workspace on Vine.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center gap-2 rounded-md border border-border bg-muted/30 p-3 text-sm'>
            {stored ? (
              <>
                <CheckCircle2 className='h-4 w-4 shrink-0 text-primary' />
                <span className='text-muted-foreground'>
                  Invitation token ready. Sign in with the invited email to join.
                </span>
              </>
            ) : (
              <>
                <Loader2 className='h-4 w-4 shrink-0 animate-spin text-muted-foreground' />
                <span className='text-muted-foreground'>Preparing invitation...</span>
              </>
            )}
          </div>
          <Button
            className='w-full'
            onClick={() => router.push('/sign-in')}
          >
            <Chrome className='size-4' />
            Continue with Google
          </Button>
          <Button
            variant='outline'
            className='w-full'
            onClick={() => router.push('/workspaces')}
          >
            Go to Workspaces
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
