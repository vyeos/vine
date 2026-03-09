'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUpRight,
  BellRing,
  ImageIcon,
  Mail,
  PencilLine,
  RefreshCcw,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useAuth, useLogout } from '@/hooks/useAuth';
import {
  useEditProfile,
  useProfileOverview,
  useResetProfilePreferences,
  useUpdateAvatar,
  useUpdateProfilePreferences,
} from '@/hooks/userProfile';
import type {
  ProfileOverview as ProfileOverviewData,
  User,
  UserLandingPage,
} from '@/types/auth';
import { getWorkspacePath } from '@/lib/utils';

const landingPageOptions: Array<{ value: UserLandingPage; label: string }> = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'posts', label: 'Posts' },
  { value: 'media', label: 'Media' },
  { value: 'keys', label: 'API Keys' },
];

const themeOptions = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;

const settingsSections = [
  { id: 'account-summary', label: 'Account Summary' },
  { id: 'memberships', label: 'Workspace Memberships' },
  { id: 'avatar', label: 'Avatar Control' },
  { id: 'security', label: 'Security' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'danger-zone', label: 'Danger Zone' },
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function getRoleBadgeVariant(role: 'owner' | 'admin' | 'member') {
  if (role === 'owner') return 'default';
  if (role === 'admin') return 'secondary';
  return 'outline';
}

function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className='rounded-lg border bg-card p-4'>
      <p className='text-sm text-muted-foreground'>{label}</p>
      <p className='mt-1 text-2xl font-semibold tracking-tight'>{value}</p>
    </div>
  );
}

function SettingRow({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className='flex items-start justify-between gap-4 rounded-lg border bg-card p-4'>
      <div className='flex min-w-0 items-start gap-3'>
        <div className='mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground'>
          {icon}
        </div>
        <div className='min-w-0'>
          <p className='font-medium'>{title}</p>
          <p className='text-sm text-muted-foreground'>{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function SettingsSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className='scroll-mt-6'>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  );
}

export function SettingsPage() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useAuth();
  const { data: overview, isLoading: isOverviewLoading } = useProfileOverview();
  const logoutMutation = useLogout();

  return (
    <div className='min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8'>
      {isLoading && (
        <div className='mx-auto grid w-full max-w-6xl gap-6'>
          <Skeleton className='h-24 w-full rounded-xl' />
          <div className='grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]'>
            <Skeleton className='h-72 w-full rounded-xl' />
            <Skeleton className='h-[720px] w-full rounded-xl' />
          </div>
        </div>
      )}

      {isError && !isLoading && (
        <div className='text-center text-destructive'>
          <h2>Error Loading Settings</h2>
        </div>
      )}

      {user && (
        <SettingsHub
          key={
            overview
              ? JSON.stringify({
                  name: overview.user.name,
                  avatarMode: overview.user.avatarMode,
                  avatarUrl: overview.user.customAvatarUrl ?? '',
                  defaultWorkspaceSlug: overview.preferences.defaultWorkspaceSlug ?? 'none',
                  defaultLandingPage: overview.preferences.defaultLandingPage,
                  emailInvites: overview.preferences.emailInvites,
                  productUpdates: overview.preferences.productUpdates,
                  publishAlerts: overview.preferences.publishAlerts,
                  apiUsageAlerts: overview.preferences.apiUsageAlerts,
                })
              : 'settings-hub'
          }
          router={router}
          user={user}
          overview={overview}
          isOverviewLoading={isOverviewLoading}
          logoutMutation={logoutMutation}
        />
      )}
    </div>
  );
}

function SettingsHub({
  router,
  user,
  overview,
  isOverviewLoading,
  logoutMutation,
}: {
  router: ReturnType<typeof useRouter>;
  user: User;
  overview: ProfileOverviewData | null;
  isOverviewLoading: boolean;
  logoutMutation: ReturnType<typeof useLogout>;
}) {
  const { theme, setTheme } = useTheme();
  const editProfileMutation = useEditProfile();
  const updateAvatarMutation = useUpdateAvatar();
  const updatePreferencesMutation = useUpdateProfilePreferences();
  const resetPreferencesMutation = useResetProfilePreferences();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [draftName, setDraftName] = useState(overview?.user.name ?? user.name);
  const [avatarMode, setAvatarMode] = useState<'provider' | 'custom'>(
    overview?.user.avatarMode ?? 'provider',
  );
  const [avatarUrl, setAvatarUrl] = useState(overview?.user.customAvatarUrl ?? '');
  const [defaultWorkspaceSlug, setDefaultWorkspaceSlug] = useState(
    overview?.preferences.defaultWorkspaceSlug ?? 'none',
  );
  const [defaultLandingPage, setDefaultLandingPage] = useState<UserLandingPage>(
    overview?.preferences.defaultLandingPage ?? 'dashboard',
  );
  const [emailInvites, setEmailInvites] = useState(
    overview?.preferences.emailInvites ?? true,
  );
  const [productUpdates, setProductUpdates] = useState(
    overview?.preferences.productUpdates ?? false,
  );
  const [publishAlerts, setPublishAlerts] = useState(
    overview?.preferences.publishAlerts ?? true,
  );
  const [apiUsageAlerts, setApiUsageAlerts] = useState(
    overview?.preferences.apiUsageAlerts ?? true,
  );

  const initials = useMemo(() => {
    return user.name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [user.name]);

  const hasPreferenceChanges =
    !!overview &&
    (defaultWorkspaceSlug !== (overview.preferences.defaultWorkspaceSlug ?? 'none') ||
      defaultLandingPage !== overview.preferences.defaultLandingPage ||
      emailInvites !== overview.preferences.emailInvites ||
      productUpdates !== overview.preferences.productUpdates ||
      publishAlerts !== overview.preferences.publishAlerts ||
      apiUsageAlerts !== overview.preferences.apiUsageAlerts);

  const hasAvatarChanges =
    !!overview &&
    (avatarMode !== (overview.user.avatarMode ?? 'provider') ||
      avatarUrl.trim() !== (overview.user.customAvatarUrl ?? ''));

  const previewAvatar =
    avatarMode === 'custom' && avatarUrl.trim()
      ? avatarUrl.trim()
      : overview?.user.providerAvatar || user?.avatar;

  return (
    <div className='mx-auto flex w-full max-w-6xl flex-col gap-6'>
      <div className='flex flex-wrap items-center justify-between gap-3 border-b pb-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Settings</h1>
          <p className='text-sm text-muted-foreground'>
            Manage your account, memberships, preferences, and security controls.
          </p>
        </div>
        <Button variant='ghost' className='gap-2' onClick={() => router.back()}>
          <ArrowLeft className='h-4 w-4' />
          Back
        </Button>
      </div>

      <div className='grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start'>
        <aside className='lg:sticky lg:top-6'>
          <Card>
            <CardHeader className='space-y-4'>
              <div className='flex items-center gap-3'>
                <Avatar className='size-12 rounded-lg border'>
                  <AvatarImage src={overview?.user.avatar ?? user.avatar} alt={user.name} />
                  <AvatarFallback className='rounded-lg bg-primary text-base font-semibold text-primary-foreground'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0'>
                  <CardTitle className='truncate text-base'>
                    {overview?.user.name ?? user.name}
                  </CardTitle>
                  <CardDescription className='truncate'>
                    {overview?.user.email ?? user.email}
                  </CardDescription>
                </div>
              </div>
              <div className='flex flex-wrap gap-2'>
                <Badge variant='outline'>{overview?.user.authProvider ?? 'google'}</Badge>
                <Badge variant='outline'>
                  {overview?.summary.workspaceCount ?? 0} workspaces
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-1'>
              {settingsSections.map((section) => (
                <Button key={section.id} asChild variant='ghost' className='w-full justify-start'>
                  <a href={`#${section.id}`}>{section.label}</a>
                </Button>
              ))}
            </CardContent>
          </Card>
        </aside>

        <div className='space-y-6'>
          <SettingsSection
            id='account-summary'
            title='Account Summary'
            description='Basic account information and your current workspace footprint.'
          >
            <div className='space-y-6'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                <div className='flex items-center gap-4'>
                  <Avatar className='size-16 rounded-lg border'>
                    <AvatarImage src={overview?.user.avatar ?? user.avatar} alt={user.name} />
                    <AvatarFallback className='rounded-lg bg-primary text-xl font-semibold text-primary-foreground'>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className='space-y-1'>
                    <p className='text-xl font-semibold'>{overview?.user.name ?? user.name}</p>
                    <p className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Mail className='h-4 w-4' />
                      {overview?.user.email ?? user.email}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Member since {overview ? formatDate(overview.summary.memberSince) : '...'}
                    </p>
                  </div>
                </div>
                <Button variant='outline' onClick={() => setIsEditDialogOpen(true)}>
                  <PencilLine className='mr-2 h-4 w-4' />
                  Edit account
                </Button>
              </div>

              <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                <SummaryMetric
                  label='Total memberships'
                  value={String(overview?.summary.workspaceCount ?? 0)}
                />
                <SummaryMetric
                  label='Owner roles'
                  value={String(overview?.summary.ownerWorkspaceCount ?? 0)}
                />
                <SummaryMetric
                  label='Admin roles'
                  value={String(overview?.summary.adminWorkspaceCount ?? 0)}
                />
                <SummaryMetric
                  label='Member roles'
                  value={String(overview?.summary.memberWorkspaceCount ?? 0)}
                />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            id='memberships'
            title='Workspace Memberships'
            description='Review the workspaces you belong to and open them directly.'
          >
            <div className='space-y-3'>
              {isOverviewLoading ? (
                <>
                  <Skeleton className='h-20 w-full rounded-lg' />
                  <Skeleton className='h-20 w-full rounded-lg' />
                </>
              ) : overview?.memberships.length ? (
                overview.memberships.map((membership) => (
                  <div
                    key={membership.id}
                    className='flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between'
                  >
                    <div className='min-w-0'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <p className='truncate font-medium'>{membership.name}</p>
                        <Badge variant={getRoleBadgeVariant(membership.role)}>
                          {membership.role}
                        </Badge>
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        /{membership.slug} • Joined {formatDate(membership.joinedAt)}
                      </p>
                    </div>
                    <Button
                      variant='outline'
                      className='shrink-0'
                      onClick={() => router.push(getWorkspacePath(membership.slug, 'dashboard'))}
                    >
                      Open workspace
                      <ArrowUpRight className='ml-2 h-4 w-4' />
                    </Button>
                  </div>
                ))
              ) : (
                <div className='rounded-lg border border-dashed p-6 text-sm text-muted-foreground'>
                  No workspace memberships were found for this account.
                </div>
              )}
            </div>
          </SettingsSection>

          <SettingsSection
            id='avatar'
            title='Avatar Control'
            description='Use your Google photo or override it with a custom image URL.'
          >
            <div className='space-y-4'>
              <div className='flex items-center gap-4 rounded-lg border bg-card p-4'>
                <Avatar className='size-16 rounded-lg border'>
                  <AvatarImage src={previewAvatar} alt={overview?.user.name ?? user.name} />
                  <AvatarFallback className='rounded-lg bg-primary text-xl font-semibold text-primary-foreground'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='font-medium'>Current avatar</p>
                  <p className='text-sm text-muted-foreground'>
                    Source: {avatarMode === 'provider' ? 'Google account' : 'Custom URL'}
                  </p>
                </div>
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='avatar-mode'>Avatar source</Label>
                  <Select
                    value={avatarMode}
                    onValueChange={(value) => setAvatarMode(value as 'provider' | 'custom')}
                  >
                    <SelectTrigger id='avatar-mode' className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='provider'>Google avatar</SelectItem>
                      <SelectItem value='custom'>Custom URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='avatar-url'>Custom avatar URL</Label>
                  <Input
                    id='avatar-url'
                    value={avatarUrl}
                    onChange={(event) => setAvatarUrl(event.target.value)}
                    placeholder='https://example.com/avatar.png'
                    disabled={avatarMode !== 'custom'}
                  />
                </div>
              </div>

              <div className='flex flex-wrap gap-2'>
                <Button
                  onClick={() =>
                    updateAvatarMutation.mutate({
                      avatarMode,
                      avatarUrl: avatarMode === 'custom' ? avatarUrl.trim() : undefined,
                    })
                  }
                  disabled={updateAvatarMutation.isPending || !hasAvatarChanges}
                >
                  <ImageIcon className='mr-2 h-4 w-4' />
                  {updateAvatarMutation.isPending ? 'Saving...' : 'Save avatar'}
                </Button>
                <Button
                  variant='outline'
                  onClick={() => {
                    setAvatarMode('provider');
                    setAvatarUrl('');
                  }}
                  disabled={updateAvatarMutation.isPending}
                >
                  Use Google avatar
                </Button>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            id='security'
            title='Security'
            description='Your current sign-in method and account protection details.'
          >
            <div className='space-y-3'>
              <SettingRow
                icon={<ShieldCheck className='h-4 w-4' />}
                title='Sign-in provider'
                description='Google is the only active authentication provider for this account.'
                action={<Badge variant='secondary'>Google</Badge>}
              />
              <SettingRow
                icon={<Mail className='h-4 w-4' />}
                title='Primary email'
                description={overview?.user.email ?? user.email}
              />
              <SettingRow
                icon={<RefreshCcw className='h-4 w-4' />}
                title='Current session'
                description='You are signed in on this device. Use sign out if you need to end the session.'
                action={
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      logoutMutation.mutate(undefined, {
                        onSuccess: () => router.push('/sign-in'),
                      })
                    }
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
                  </Button>
                }
              />
            </div>
          </SettingsSection>

          <SettingsSection
            id='preferences'
            title='Preferences'
            description='Control your default workspace flow, notifications, and local theme.'
          >
            <div className='space-y-4'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='profile-theme'>Theme</Label>
                  <Select value={theme ?? 'system'} onValueChange={setTheme}>
                    <SelectTrigger id='profile-theme' className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='default-workspace'>Default workspace</Label>
                  <Select value={defaultWorkspaceSlug} onValueChange={setDefaultWorkspaceSlug}>
                    <SelectTrigger id='default-workspace' className='w-full'>
                      <SelectValue placeholder='Choose a workspace' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>No preference</SelectItem>
                      {(overview?.memberships ?? []).map((membership) => (
                        <SelectItem key={membership.id} value={membership.slug}>
                          {membership.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='default-landing-page'>Default landing page</Label>
                <Select
                  value={defaultLandingPage}
                  onValueChange={(value) => setDefaultLandingPage(value as UserLandingPage)}
                >
                  <SelectTrigger id='default-landing-page' className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {landingPageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-3'>
                <SettingRow
                  icon={<BellRing className='h-4 w-4' />}
                  title='Workspace invite emails'
                  description='Receive invite-related account emails.'
                  action={<Switch checked={emailInvites} onCheckedChange={setEmailInvites} />}
                />
                <SettingRow
                  icon={<BellRing className='h-4 w-4' />}
                  title='Product updates'
                  description='Allow occasional VineCMS product and release updates.'
                  action={<Switch checked={productUpdates} onCheckedChange={setProductUpdates} />}
                />
                <SettingRow
                  icon={<BellRing className='h-4 w-4' />}
                  title='Publishing alerts'
                  description='Keep publish-related notifications enabled.'
                  action={<Switch checked={publishAlerts} onCheckedChange={setPublishAlerts} />}
                />
                <SettingRow
                  icon={<BellRing className='h-4 w-4' />}
                  title='API usage alerts'
                  description='Get notified when your workspace API keys are used.'
                  action={<Switch checked={apiUsageAlerts} onCheckedChange={setApiUsageAlerts} />}
                />
              </div>

              <div className='flex flex-wrap gap-2'>
                <Button
                  onClick={() =>
                    updatePreferencesMutation.mutate({
                      defaultWorkspaceSlug:
                        defaultWorkspaceSlug === 'none' ? undefined : defaultWorkspaceSlug,
                      defaultLandingPage,
                      emailInvites,
                      productUpdates,
                      publishAlerts,
                      apiUsageAlerts,
                    })
                  }
                  disabled={updatePreferencesMutation.isPending || !hasPreferenceChanges}
                >
                  {updatePreferencesMutation.isPending ? 'Saving...' : 'Save preferences'}
                </Button>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            id='danger-zone'
            title='Danger Zone'
            description='Revert account-level settings if you want to roll back customization quickly.'
          >
            <div className='space-y-3'>
              <SettingRow
                icon={<RefreshCcw className='h-4 w-4' />}
                title='Reset preferences'
                description='Remove your saved workspace and notification preferences and fall back to defaults.'
                action={
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      resetPreferencesMutation.mutate(undefined, {
                        onSuccess: () => {
                          setDefaultWorkspaceSlug('none');
                          setDefaultLandingPage('dashboard');
                          setEmailInvites(true);
                          setProductUpdates(false);
                          setPublishAlerts(true);
                          setApiUsageAlerts(true);
                        },
                      })
                    }
                    disabled={resetPreferencesMutation.isPending}
                  >
                    {resetPreferencesMutation.isPending ? 'Resetting...' : 'Reset'}
                  </Button>
                }
              />
              <SettingRow
                icon={<ImageIcon className='h-4 w-4' />}
                title='Clear custom avatar'
                description='Switch back to your Google profile photo and discard any custom override.'
                action={
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      updateAvatarMutation.mutate(
                        { avatarMode: 'provider' },
                        {
                          onSuccess: () => {
                            setAvatarMode('provider');
                            setAvatarUrl('');
                          },
                        },
                      )
                    }
                    disabled={updateAvatarMutation.isPending}
                  >
                    Revert avatar
                  </Button>
                }
              />
              <SettingRow
                icon={<TriangleAlert className='h-4 w-4' />}
                title='Sign out of this device'
                description='End the current session if you are stepping away from this browser.'
                action={
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() =>
                      logoutMutation.mutate(undefined, {
                        onSuccess: () => router.push('/sign-in'),
                      })
                    }
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
                  </Button>
                }
              />
            </div>
          </SettingsSection>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>
              Update the display name shown across your workspaces.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='display-name'>Display name</Label>
              <Input
                id='display-name'
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder='Your name'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='profile-email'>Email</Label>
              <Input id='profile-email' value={overview?.user.email ?? user.email} disabled />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setDraftName(overview?.user.name ?? user.name);
                setIsEditDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                editProfileMutation.mutate(
                  { name: draftName.trim() },
                  {
                    onSuccess: () => setIsEditDialogOpen(false),
                  },
                )
              }
              disabled={
                editProfileMutation.isPending ||
                draftName.trim().length < 2 ||
                draftName.trim() === (overview?.user.name ?? user.name)
              }
            >
              {editProfileMutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
