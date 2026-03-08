'use client';

import { useState, useTransition } from 'react';
import { Chrome } from 'lucide-react';
import { useAuthActions } from '@convex-dev/auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export function GoogleSignInForm() {
  const { signIn } = useAuthActions();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className='flex flex-col gap-6'>
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Welcome back to Vine</CardTitle>
          <CardDescription>
            Sign in with Google to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-6'>
            {error && (
              <div className='rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
                {error}
              </div>
            )}
            <Button
              className='w-full'
              disabled={isPending}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  try {
                    await signIn('google', { redirectTo: '/workspaces' });
                  } catch {
                    setError(
                      'Unable to sign in. Please check your connection and try again.',
                    );
                  }
                });
              }}
              type='button'
            >
              {isPending ? <Spinner /> : <Chrome className='size-4' />}
              {isPending ? 'Redirecting to Google...' : 'Sign in with Google'}
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className='text-muted-foreground text-center text-xs text-balance'>
        By clicking continue, you agree to our{' '}
        <a className='underline underline-offset-4 hover:text-foreground' href='/terms'>
          Terms of Service
        </a>{' '}
        and{' '}
        <a className='underline underline-offset-4 hover:text-foreground' href='/privacy'>
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
