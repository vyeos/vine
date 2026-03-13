export const INVITE_TOKEN_KEY = 'vine-invite-token';

export function getAcceptInvitePath(token: string) {
  return `/accept-invite?token=${encodeURIComponent(token)}`;
}

export function getInviteTokenFromUrl(invitationUrl: string) {
  const trimmedUrl = invitationUrl.trim();

  if (!trimmedUrl) {
    return null;
  }

  const tokenMatch = trimmedUrl.match(/[?&]token=([^&#\s]+)/i);

  if (tokenMatch?.[1]) {
    return decodeURIComponent(tokenMatch[1]).trim() || null;
  }

  try {
    return new URL(trimmedUrl).searchParams.get('token')?.trim() || null;
  } catch {
    return null;
  }
}
