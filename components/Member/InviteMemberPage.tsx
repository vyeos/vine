'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Link2, Mail, Shield, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { inviteMemberSchema } from '@/lib/validations/member';
import { useInviteMember, useSendInviteEmail } from '@/hooks/useMember';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';
import { useWorkspaceVerification } from '@/hooks/useWorkspace';
import type { InvitableRole, InviteMemberData, InviteMemberResult, MemberRole } from '@/types/member';
import { ROLE_HIERARCHY } from '@/types/member';
import { getAcceptInvitePath } from '@/lib/invitations';
import { getWorkspacePath } from '@/lib/utils';

export default function InviteMemberPage() {
  type InviteDeliveryState = 'sending' | 'sent' | 'failed';

  const workspaceSlug = useWorkspaceSlug();
  const { data: workspace } = useWorkspaceVerification(workspaceSlug);
  const router = useRouter();
  const inviteMemberMutation = useInviteMember(workspaceSlug);
  const sendInviteEmail = useSendInviteEmail();
  const [latestInvite, setLatestInvite] = useState<InviteMemberResult | null>(null);
  const [inviteDeliveryState, setInviteDeliveryState] = useState<InviteDeliveryState | null>(null);

  const currentUserRole = (workspace?.role || 'member') as MemberRole;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<InviteMemberData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  useEffect(() => {
    if (workspaceSlug && currentUserRole === 'member') {
      router.replace(getWorkspacePath(workspaceSlug, 'members'));
    }
  }, [currentUserRole, router, workspaceSlug]);

  const availableRoles: InvitableRole[] = (['admin', 'member'] as InvitableRole[]).filter(
    (role) => ROLE_HIERARCHY[role] < ROLE_HIERARCHY[currentUserRole],
  );
  const selectedRole = useWatch({ control, name: 'role' });

  const onFormSubmit = handleSubmit((data) => {
    inviteMemberMutation.mutate(data, {
      onSuccess: (result) => {
        setLatestInvite(result);
        setInviteDeliveryState('sending');
        reset();
        if (workspaceSlug) {
          void sendInviteEmail.mutate({
            workspaceSlug,
            invitationId: result.id,
          }, {
            onSuccess: () => setInviteDeliveryState('sent'),
            onError: () => setInviteDeliveryState('failed'),
          });
        }
      },
    });
  });

  const getRoleIcon = (role: MemberRole) => {
    switch (role) {
      case 'admin':
        return <Shield className='h-4 w-4' />;
      case 'member':
        return <Users className='h-4 w-4' />;
      case 'owner':
        return <Shield className='h-4 w-4' />;
    }
  };

  const getRoleDescription = (role: MemberRole) => {
    switch (role) {
      case 'admin':
        return 'Can manage members and workspace settings';
      case 'member':
        return 'Can view and contribute to workspace content';
      case 'owner':
        return 'Full access to manage workspace and all members';
    }
  };

  const inviteLink =
    latestInvite && typeof window !== 'undefined'
      ? `${window.location.origin}${getAcceptInvitePath(latestInvite.token)}`
      : '';

  const copyInviteLink = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Invite link copied');
    } catch {
      toast.error('Unable to copy invite link');
    }
  };

  return (
    <div className='p-6'>
      <Card className='mx-auto max-w-2xl animate-in fade-in-50 zoom-in-95 duration-300'>
        <CardHeader>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => router.push(getWorkspacePath(workspaceSlug!, 'members'))}
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                <UserPlus className='h-5 w-5 text-primary' />
              </div>
              <div>
                <CardTitle>Invite Member</CardTitle>
                <CardDescription>Send an invitation to join this workspace</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onFormSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='email' className='flex items-center gap-2'>
                <Mail className='h-4 w-4 text-muted-foreground' />
                Email Address
              </Label>
              <Input
                id='email'
                type='email'
                placeholder='user@example.com'
                {...register('email')}
                className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                autoFocus
              />
              {errors.email?.message && (
                <p className='text-sm font-medium text-destructive animate-in fade-in-50 slide-in-from-top-1'>
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='role'>Role</Label>
              <div className='space-y-2'>
                <Controller
                  name='role'
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id='role'
                        className={
                          errors.role
                            ? 'border-destructive focus-visible:ring-destructive w-full'
                            : 'w-full'
                        }
                      >
                        <SelectValue placeholder='Select a role' />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            <div className='flex items-center gap-2'>
                              {getRoleIcon(role)}
                              <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {selectedRole && (
                  <div className='flex items-start gap-2 rounded-md border bg-muted/50 p-3 text-sm'>
                    <div className='mt-0.5 text-muted-foreground'>{getRoleIcon(selectedRole as MemberRole)}</div>
                    <div className='flex-1'>
                      <div className='font-medium'>
                        {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {getRoleDescription(selectedRole as MemberRole)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {errors.role?.message && (
                <p className='text-sm font-medium text-destructive animate-in fade-in-50 slide-in-from-top-1'>
                  {errors.role.message}
                </p>
              )}
            </div>
            {latestInvite && (
              <div className='space-y-3 rounded-lg border bg-muted/40 p-4'>
                <div className='flex items-start gap-3'>
                  <div className='mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-primary/10'>
                    <Link2 className='h-4 w-4 text-primary' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='font-medium'>
                      {inviteDeliveryState === 'sent'
                        ? `Invitation email sent to ${latestInvite.email}`
                        : inviteDeliveryState === 'sending'
                          ? `Sending invitation email to ${latestInvite.email}`
                          : `Invitation ready for ${latestInvite.email}`}
                    </p>
                    {inviteDeliveryState === 'sent' && (
                      <p className='text-sm text-muted-foreground'>
                        The mail has been sent. If you want, you can also send this link to the user.
                      </p>
                    )}
                    {inviteDeliveryState === 'sending' && (
                      <p className='text-sm text-muted-foreground'>
                        We&apos;re sending the invite email now. You can still copy the link below if needed.
                      </p>
                    )}
                    {inviteDeliveryState === 'failed' && (
                      <p className='text-sm text-muted-foreground'>
                        We couldn&apos;t send the email, so you can share this link with the user directly.
                      </p>
                    )}
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Input value={inviteLink} readOnly className='font-mono text-xs' />
                  <Button type='button' variant='outline' onClick={copyInviteLink}>
                    <Copy className='mr-2 h-4 w-4' />
                    Copy
                  </Button>
                </div>
              </div>
            )}
            <div className='flex justify-end gap-3 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push(getWorkspacePath(workspaceSlug!, 'members'))}
                disabled={inviteMemberMutation.isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={inviteMemberMutation.isPending}>
                <UserPlus size={16} className={`mr-2 ${inviteMemberMutation.isPending ? 'opacity-50' : ''}`} />
                {inviteMemberMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
