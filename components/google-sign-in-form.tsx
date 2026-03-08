'use client';

import { useTransition } from 'react';
import { Chrome } from 'lucide-react';
import { useAuthActions } from '@convex-dev/auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export function GoogleSignInForm() {
  const { signIn } = useAuthActions();
  const [isPending, startTransition] = useTransition();

  return (
    <div className='flex flex-col gap-6'>
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>🌿 Welcome back to Vine</CardTitle>
          <CardDescription>
            Sign in with Google to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-6'>
            <Button
              className='w-full'
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  await signIn('google', { redirectTo: '/workspaces' });
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
        <a className='underline underline-offset-4' href='#'>
          Terms of Service
        </a>{' '}
        and{' '}
        <a className='underline underline-offset-4' href='#'>
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
