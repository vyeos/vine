export const INVITE_TOKEN_KEY = 'vine-invite-token';

export function getAcceptInvitePath(token: string) {
  return `/accept-invite?token=${encodeURIComponent(token)}`;
}
