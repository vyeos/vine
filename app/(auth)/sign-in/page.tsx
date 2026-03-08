import { redirect } from 'next/navigation';
import { isAuthenticatedNextjs } from '@convex-dev/auth/nextjs/server';
import { GoogleSignInForm } from '@/components/google-sign-in-form';

export default async function SignInPage() {
  if (await isAuthenticatedNextjs()) {
    redirect('/workspaces');
  }

  return (
    <div className='grid h-screen w-screen place-items-center p-4'>
      <GoogleSignInForm />
    </div>
  );
}
