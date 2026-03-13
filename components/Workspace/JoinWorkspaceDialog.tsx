'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAcceptInvitePath, getInviteTokenFromUrl } from '@/lib/invitations';

interface JoinWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinWorkspaceDialog({
  open,
  onOpenChange,
}: JoinWorkspaceDialogProps) {
  const router = useRouter();
  const [invitationUrl, setInvitationUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setInvitationUrl('');
      setError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const token = getInviteTokenFromUrl(invitationUrl);

    if (!token) {
      setError('Paste a valid invitation URL to continue.');
      return;
    }

    setError(null);
    handleOpenChange(false);
    router.push(getAcceptInvitePath(token));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <Link2 className='h-5 w-5 text-primary' />
            </div>
            <div>
              <DialogTitle>Join Workspace</DialogTitle>
              <DialogDescription>
                Paste an invitation URL from email to open the secure join flow.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div className='space-y-2'>
            <Label htmlFor='invitation-url'>Invitation URL</Label>
            <Input
              id='invitation-url'
              value={invitationUrl}
              onChange={(event) => {
                setInvitationUrl(event.target.value);
                if (error) {
                  setError(null);
                }
              }}
              placeholder='https://app.example.com/accept-invite?token=...'
              autoComplete='off'
              autoFocus
              aria-invalid={Boolean(error)}
            />
            <p className='text-xs text-muted-foreground'>
              Use the same email address the invitation was sent to when you continue.
            </p>
            {error && (
              <p className='text-sm font-medium text-destructive'>{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={!invitationUrl.trim()}>
              Continue
              <ArrowRight className='size-4' />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
