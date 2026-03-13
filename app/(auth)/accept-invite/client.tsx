'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chrome, CheckCircle2, LoaderCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAcceptInvite } from '@/hooks/useMember';
import { INVITE_TOKEN_KEY } from '@/lib/invitations';
import { getWorkspacePath } from '@/lib/utils';

/**
 * Stores the invite token in sessionStorage so that after Google sign-in,
 * the app can look it up and call the acceptance mutation.
 */
export function AcceptInviteClient({ token }: { token: string }) {
  const router = useRouter();
  const { data: user, isLoading } = useAuth();
  const { isPending, mutate } = useAcceptInvite();
  const attemptedRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(INVITE_TOKEN_KEY, token);
    } catch {
      // sessionStorage unavailable (e.g., private browsing limits)
    }
  }, [token]);

  useEffect(() => {
    if (isLoading || !user?.email || isPending || attemptedRef.current) {
      return;
    }

    attemptedRef.current = true;

    mutate(token, {
      onSuccess: (result) => {
        try {
          sessionStorage.removeItem(INVITE_TOKEN_KEY);
        } catch {
          // Ignore sessionStorage failures.
        }

        router.replace(getWorkspacePath(result.workspaceSlug));
      },
      onError: (error) => {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to accept this invitation.');
      },
    });
  }, [isLoading, isPending, mutate, router, token, user?.email]);

  const isSignedIn = Boolean(user?.email);

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
            {isSignedIn && isPending ? (
              <LoaderCircle className='h-4 w-4 shrink-0 animate-spin text-primary' />
            ) : (
              <CheckCircle2 className='h-4 w-4 shrink-0 text-primary' />
            )}
            <span className='text-muted-foreground'>
              {isSignedIn
                ? isPending
                  ? 'Accepting your invitation now.'
                  : errorMessage ?? 'Invitation token ready.'
                : 'Invitation token ready. Sign in with the invited email to join.'}
            </span>
          </div>
          {!isSignedIn && (
            <Button
              className='w-full'
              onClick={() => router.push('/sign-in')}
            >
              <Chrome className='size-4' />
              Continue with Google
            </Button>
          )}
          <Button
            variant='outline'
            className='w-full'
            onClick={() => router.push('/')}
          >
            Go to app
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
