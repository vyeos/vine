'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { useAuthActions } from '@convex-dev/auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getLastWorkspaceSlugs, getWorkspacePath } from '@/lib/utils';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z'
        fill='#4285F4'
      />
      <path
        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z'
        fill='#34A853'
      />
      <path
        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z'
        fill='#FBBC05'
      />
      <path
        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z'
        fill='#EA4335'
      />
    </svg>
  );
}

export function GoogleSignInForm() {
  const { signIn } = useAuthActions();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className='flex w-full flex-col gap-6'>
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
              <Alert variant='destructive'>
                <AlertCircle className='size-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              className='w-full transition-colors'
              disabled={isPending}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  try {
                    const { current: lastUsedWorkspaceSlug } = getLastWorkspaceSlugs();
                    const redirectTo = lastUsedWorkspaceSlug
                      ? getWorkspacePath(lastUsedWorkspaceSlug, 'dashboard')
                      : '/';

                    await signIn('google', { redirectTo });
                  } catch {
                    setError(
                      'Unable to sign in. Please check your connection and try again.',
                    );
                  }
                });
              }}
              type='button'
            >
              {isPending ? <Spinner /> : <GoogleIcon className='size-4' />}
              {isPending ? 'Redirecting to Google...' : 'Sign in with Google'}
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className='text-muted-foreground text-center text-xs text-balance'>
        By clicking continue, you agree to our{' '}
        <Link
          className='underline underline-offset-4 transition-colors hover:text-foreground'
          href='/terms'
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          className='underline underline-offset-4 transition-colors hover:text-foreground'
          href='/privacy'
        >
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}
