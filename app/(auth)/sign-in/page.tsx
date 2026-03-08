import { redirect } from 'next/navigation';
import { isAuthenticatedNextjs } from '@convex-dev/auth/nextjs/server';
import Image from 'next/image';
import { GoogleSignInForm } from '@/components/google-sign-in-form';

export default async function SignInPage() {
  if (await isAuthenticatedNextjs()) {
    redirect('/workspaces');
  }

  return (
    <div className='grid h-screen w-screen place-items-center bg-muted/30 p-4'>
      <div className='flex w-full max-w-sm flex-col items-center gap-8'>
        <div className='flex items-center gap-3'>
          <Image
            src='/vine.png'
            alt='Vine Logo'
            width={36}
            height={36}
            className='object-contain'
          />
          <span className='text-xl font-semibold tracking-tight'>Vine</span>
        </div>
        <GoogleSignInForm />
      </div>
    </div>
  );
}
