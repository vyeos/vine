import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className='grid min-h-screen place-items-center p-4'>
      <Card className='w-full max-w-3xl'>
        <CardHeader>
          <CardTitle>Workspace invite</CardTitle>
          <CardDescription>
            This route preserves the existing invite URL while the acceptance flow moves to Convex.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <p className='text-sm text-muted-foreground'>
            The signed-in Google email will need to match the invited email before membership is created.
          </p>
          <div className='rounded-md border border-border bg-muted/30 p-4 font-mono text-sm'>
            <div>invite token</div>
            <div className='mt-2 break-all text-muted-foreground'>
              {token ?? 'missing token'}
            </div>
          </div>
          <div className='flex flex-wrap gap-3'>
            <Button asChild>
              <Link href='/sign-in'>Continue with Google</Link>
            </Button>
            <Button asChild variant='outline'>
              <Link href='/workspaces'>Go to workspaces</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
