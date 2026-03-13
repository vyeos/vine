'use client';

import { useAction, useQuery } from 'convex/react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { useMutationState } from '@/hooks/useMutationState';
import { getErrorMessage } from '@/lib/error-utils';
import type {
  AcceptInviteResult,
  InviteMemberData,
  InviteMemberResult,
  Member,
  PendingInvitation,
  SendInviteEmailResult,
  UpdateMemberRoleData,
} from '@/types/member';

export function useMembers(workspaceSlug: string | undefined) {
  const data = useQuery(api.members.list, workspaceSlug ? { workspaceSlug } : 'skip') as
    | { members: Member[]; invitations: PendingInvitation[] }
    | undefined;

  return {
    data: data ?? { members: [], invitations: [] },
    isLoading: !!workspaceSlug && data === undefined,
    isError: false,
  };
}

export function useInviteMember(workspaceSlug: string | undefined) {
  const mutation = useMutationState<
    { workspaceSlug: string; data: InviteMemberData },
    InviteMemberResult
  >(api.members.invite);

  return {
    ...mutation,
    mutate: (
      data: InviteMemberData,
      options?: { onSuccess?: (result: InviteMemberResult) => void; onError?: (error: unknown) => void },
    ) => {
      if (!workspaceSlug) return;
      void mutation
        .mutateAsync({ workspaceSlug, data })
        .then((result) => {
          toast.success('Invitation sent');
          options?.onSuccess?.(result);
        })
        .catch((error) => {
          toast.error(getErrorMessage(error, 'Failed to send invitation'));
          options?.onError?.(error);
        });
    },
  };
}

export function useAcceptInvite() {
  const mutation = useMutationState<{ token: string }, AcceptInviteResult>(api.members.acceptInvite);

  return {
    ...mutation,
    mutate: (
      token: string,
      options?: { onSuccess?: (result: AcceptInviteResult) => void; onError?: (error: unknown) => void },
    ) => {
      void mutation
        .mutateAsync({ token })
        .then((result) => {
          toast.success(`Joined ${result.workspaceName}`);
          options?.onSuccess?.(result);
        })
        .catch((error) => {
          toast.error(getErrorMessage(error, 'Failed to accept invitation'));
          options?.onError?.(error);
        });
    },
  };
}

export function useSendInviteEmail() {
  const sendInviteEmail = useAction(api.members.sendInviteEmail);

  return {
    mutate: async (
      args: { workspaceSlug: string; invitationId: string },
      options?: { onSuccess?: (result: SendInviteEmailResult) => void; onError?: (error: unknown) => void },
    ) => {
      try {
        const result = (await sendInviteEmail({
          workspaceSlug: args.workspaceSlug,
          invitationId: args.invitationId as never,
        })) as SendInviteEmailResult;
        options?.onSuccess?.(result);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Invitation created, but the email could not be sent'));
        options?.onError?.(error);
      }
    },
  };
}

export function useUpdateMemberRole(workspaceSlug: string | undefined) {
  const mutation = useMutationState<
    { workspaceSlug: string; userId: string; data: UpdateMemberRoleData },
    Member
  >(api.members.updateRole);

  return {
    ...mutation,
    mutate: (
      payload: { userId: string; data: UpdateMemberRoleData },
      options?: { onSuccess?: (member: Member) => void; onError?: (error: unknown) => void },
    ) => {
      if (!workspaceSlug) return;
      void mutation
        .mutateAsync({ workspaceSlug, userId: payload.userId as never, data: payload.data })
        .then((result) => {
          toast.success('Member role updated');
          options?.onSuccess?.(result);
        })
        .catch((error) => {
          toast.error(getErrorMessage(error, 'Failed to update member role'));
          options?.onError?.(error);
        });
    },
  };
}

export function useRemoveMember(workspaceSlug: string | undefined) {
  const mutation = useMutationState<
    { workspaceSlug: string; userId: string },
    { success: boolean }
  >(api.members.remove);

  return {
    ...mutation,
    mutate: (userId: string, options?: { onSuccess?: () => void; onError?: (error: unknown) => void }) => {
      if (!workspaceSlug) return;
      void mutation
        .mutateAsync({ workspaceSlug, userId: userId as never })
        .then(() => {
          toast.success('Member removed');
          options?.onSuccess?.();
        })
        .catch((error) => {
          toast.error(getErrorMessage(error, 'Failed to remove member'));
          options?.onError?.(error);
        });
    },
  };
}

export function useRevokeInvitation(workspaceSlug: string | undefined) {
  const mutation = useMutationState<
    { workspaceSlug: string; invitationId: string },
    { success: boolean }
  >(api.members.revokeInvitation);

  return {
    ...mutation,
    mutate: (
      invitationId: string,
      options?: { onSuccess?: () => void; onError?: (error: unknown) => void },
    ) => {
      if (!workspaceSlug) return;
      void mutation
        .mutateAsync({ workspaceSlug, invitationId: invitationId as never })
        .then(() => {
          toast.success('Invitation revoked');
          options?.onSuccess?.();
        })
        .catch((error) => {
          toast.error(getErrorMessage(error, 'Failed to revoke invitation'));
          options?.onError?.(error);
        });
    },
  };
}

export function useLeaveWorkspace(workspaceSlug: string | undefined) {
  const mutation = useMutationState<{ workspaceSlug: string }, { success: boolean }>(api.members.leave);

  return {
    ...mutation,
    mutate: (
      _args: undefined,
      options?: { onSuccess?: () => void; onError?: (error: unknown) => void },
    ) => {
      if (!workspaceSlug) return;
      void mutation
        .mutateAsync({ workspaceSlug })
        .then(() => {
          toast.success('Left workspace');
          options?.onSuccess?.();
        })
        .catch((error) => {
          toast.error(getErrorMessage(error, 'Failed to leave workspace'));
          options?.onError?.(error);
        });
    },
  };
}
