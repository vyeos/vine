export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  providerAvatar?: string;
  customAvatarUrl?: string;
  avatarMode?: 'provider' | 'custom';
  authProvider?: 'google';
};

export type UserLandingPage = 'dashboard' | 'posts' | 'media' | 'keys';

export type UserPreferences = {
  defaultWorkspaceSlug?: string;
  defaultLandingPage: UserLandingPage;
  emailInvites: boolean;
  productUpdates: boolean;
  publishAlerts: boolean;
  apiUsageAlerts: boolean;
};

export type ProfileWorkspaceMembership = {
  id: string;
  name: string;
  slug: string;
  role: 'owner' | 'admin' | 'member';
  createdAt: string;
  joinedAt: string;
};

export type AccountSummary = {
  memberSince: string;
  workspaceCount: number;
  ownerWorkspaceCount: number;
  adminWorkspaceCount: number;
  memberWorkspaceCount: number;
};

export type ProfileOverview = {
  user: User;
  preferences: UserPreferences;
  memberships: ProfileWorkspaceMembership[];
  summary: AccountSummary;
};

export type EditProfileData = {
  name?: string;
  email?: string;
};

export type VerifyEmailData = {
  userId: string;
  token: string;
};

export type ForgotPasswordData = {
  email: string;
};

export type ResetPasswordData = {
  email: string;
  token: string;
  password: string;
};
