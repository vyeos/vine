export type MemberRole = 'owner' | 'admin' | 'member';
export type InvitableRole = Exclude<MemberRole, 'owner'>;

export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
};

export interface Member {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: MemberRole;
  joinedAt: string;
}

export interface PendingInvitation {
  id: string;
  email: string;
  role: InvitableRole;
  invitedAt: string;
}

export interface InviteMemberData {
  email: string;
  role: InvitableRole;
}

export interface InviteMemberResult extends PendingInvitation {
  token: string;
}

export interface AcceptInviteResult {
  workspaceSlug: string;
  workspaceName: string;
  role: MemberRole;
}

export interface SendInviteEmailResult {
  success: boolean;
  emailId?: string;
}

export interface UpdateMemberRoleData {
  role: MemberRole;
}
