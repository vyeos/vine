'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  BellRing,
  ImageIcon,
  PencilLine,
  RefreshCcw,
  TriangleAlert,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import type { ProfileOverview as ProfileOverviewData, User } from '@/types/auth';
import { getWorkspacePath } from '@/lib/utils';

const themeOptions = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;

const settingsSections = [
  { id: 'account', label: 'Account' },
  { id: 'memberships', label: 'Memberships' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'account-actions', label: 'Account Actions' },
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
    <div className='flex items-center justify-between gap-4 py-3'>
      <div className='flex min-w-0 items-center gap-3'>
        <span className='shrink-0 text-muted-foreground'>{icon}</span>
        <div className='min-w-0'>
          <p className='text-sm font-medium'>{title}</p>
          <p className='text-sm text-muted-foreground'>{description}</p>
        </div>
      </div>
      {action && <div className='shrink-0'>{action}</div>}
    </div>
  );
}

function SettingsSection({
  id,
  title,
  description,
  children,
  last,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-6 ${last ? '' : 'border-b border-border pb-6'}`}
    >
      <div className='mb-4'>
        <h2 className='text-sm font-semibold'>{title}</h2>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
      {children}
    </section>
  );
}

export function SettingsPage() {
  const { data: user, isLoading, isError } = useAuth();
  const { data: overview, isLoading: isOverviewLoading } = useProfileOverview();
  const logoutMutation = useLogout();

  return (
    <div className='h-full overflow-y-auto scrollbar-hide'>
      {isLoading && (
        <div className='w-full max-w-4xl px-2 pb-6'>
          <div className='grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]'>
            <Skeleton className='h-48 w-full rounded-xl' />
            <Skeleton className='h-[600px] w-full rounded-xl' />
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
                  emailInvites: overview.preferences.emailInvites,
                  productUpdates: overview.preferences.productUpdates,
                  publishAlerts: overview.preferences.publishAlerts,
                  apiUsageAlerts: overview.preferences.apiUsageAlerts,
                })
              : 'settings-hub'
          }
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
  user,
  overview,
  isOverviewLoading,
  logoutMutation,
}: {
  user: User;
  overview: ProfileOverviewData | null;
  isOverviewLoading: boolean;
  logoutMutation: ReturnType<typeof useLogout>;
}) {
  const router = useRouter();
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

  const hasAvatarChanges =
    !!overview &&
    (avatarMode !== (overview.user.avatarMode ?? 'provider') ||
      avatarUrl.trim() !== (overview.user.customAvatarUrl ?? ''));

  const previewAvatar =
    avatarMode === 'custom' && avatarUrl.trim()
      ? avatarUrl.trim()
      : overview?.user.providerAvatar || user?.avatar;
  const hasNameChanges = draftName.trim() !== (overview?.user.name ?? user.name);
  const hasAccountChanges = hasNameChanges || hasAvatarChanges;
  const isSavingAccount = editProfileMutation.isPending || updateAvatarMutation.isPending;

  const persistPreferences = useCallback(
    async (next: {
      emailInvites: boolean;
      productUpdates: boolean;
      publishAlerts: boolean;
      apiUsageAlerts: boolean;
    }) => {
      await updatePreferencesMutation.mutateAsync({
        emailInvites: next.emailInvites,
        productUpdates: next.productUpdates,
        publishAlerts: next.publishAlerts,
        apiUsageAlerts: next.apiUsageAlerts,
      });
    },
    [updatePreferencesMutation],
  );

  const handleEmailInvitesChange = useCallback(
    async (checked: boolean) => {
      const previousValue = emailInvites;
      setEmailInvites(checked);

      try {
        await persistPreferences({
          emailInvites: checked,
          productUpdates,
          publishAlerts,
          apiUsageAlerts,
        });
      } catch {
        setEmailInvites(previousValue);
      }
    },
    [
      apiUsageAlerts,
      emailInvites,
      persistPreferences,
      productUpdates,
      publishAlerts,
    ],
  );

  const handleProductUpdatesChange = useCallback(
    async (checked: boolean) => {
      const previousValue = productUpdates;
      setProductUpdates(checked);

      try {
        await persistPreferences({
          emailInvites,
          productUpdates: checked,
          publishAlerts,
          apiUsageAlerts,
        });
      } catch {
        setProductUpdates(previousValue);
      }
    },
    [
      apiUsageAlerts,
      emailInvites,
      persistPreferences,
      productUpdates,
      publishAlerts,
    ],
  );

  const handlePublishAlertsChange = useCallback(
    async (checked: boolean) => {
      const previousValue = publishAlerts;
      setPublishAlerts(checked);

      try {
        await persistPreferences({
          emailInvites,
          productUpdates,
          publishAlerts: checked,
          apiUsageAlerts,
        });
      } catch {
        setPublishAlerts(previousValue);
      }
    },
    [
      apiUsageAlerts,
      emailInvites,
      persistPreferences,
      productUpdates,
      publishAlerts,
    ],
  );

  const handleApiUsageAlertsChange = useCallback(
    async (checked: boolean) => {
      const previousValue = apiUsageAlerts;
      setApiUsageAlerts(checked);

      try {
        await persistPreferences({
          emailInvites,
          productUpdates,
          publishAlerts,
          apiUsageAlerts: checked,
        });
      } catch {
        setApiUsageAlerts(previousValue);
      }
    },
    [
      apiUsageAlerts,
      emailInvites,
      persistPreferences,
      productUpdates,
      publishAlerts,
    ],
  );

  const resetAccountDialog = () => {
    setDraftName(overview?.user.name ?? user.name);
    setAvatarMode(overview?.user.avatarMode ?? 'provider');
    setAvatarUrl(overview?.user.customAvatarUrl ?? '');
    setIsEditDialogOpen(false);
  };

  const handleSaveAccount = async () => {
    try {
      if (hasNameChanges) {
        await editProfileMutation.mutateAsync({ name: draftName.trim() });
      }

      if (hasAvatarChanges) {
        await updateAvatarMutation.mutateAsync({
          avatarMode,
          avatarUrl: avatarMode === 'custom' ? avatarUrl.trim() : undefined,
        });
      }

      setIsEditDialogOpen(false);
    } catch {
      return;
    }
  };

  return (
    <div className='flex w-full max-w-4xl flex-col gap-6 px-2 pb-6'>
      <div className='grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start'>
        {/* Sidebar navigation */}
        <aside className='lg:sticky lg:top-0'>
          <nav className='flex flex-col gap-0.5'>
            {settingsSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className='rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
              >
                {section.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className='flex flex-col gap-6'>
          {/* Account */}
          <SettingsSection
            id='account'
            title='Account'
            description='Your profile and workspace overview.'
          >
            <div className='flex flex-col gap-4'>
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                  <Avatar className='size-10 rounded-lg border'>
                    <AvatarImage src={overview?.user.avatar ?? user.avatar} alt={user.name} />
                    <AvatarFallback className='rounded-lg bg-primary text-sm font-semibold text-primary-foreground'>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className='min-w-0'>
                    <p className='text-sm font-medium'>{overview?.user.name ?? user.name}</p>
                    <p className='text-sm text-muted-foreground'>
                      {overview?.user.email ?? user.email}
                    </p>
                  </div>
                </div>
                <Button variant='outline' size='sm' onClick={() => setIsEditDialogOpen(true)}>
                  <PencilLine className='mr-1.5 h-3.5 w-3.5' />
                  Edit
                </Button>
              </div>

              <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground'>
                <span>
                  {overview?.summary.workspaceCount ?? 0} workspace{(overview?.summary.workspaceCount ?? 0) !== 1 ? 's' : ''}
                </span>
                <span className='text-border'>|</span>
                <span>{overview?.summary.ownerWorkspaceCount ?? 0} owner</span>
                <span className='text-border'>|</span>
                <span>{overview?.summary.adminWorkspaceCount ?? 0} admin</span>
                <span className='text-border'>|</span>
                <span>{overview?.summary.memberWorkspaceCount ?? 0} member</span>
                {overview && (
                  <>
                    <span className='text-border'>|</span>
                    <span>Joined {formatDate(overview.summary.memberSince)}</span>
                  </>
                )}
              </div>
            </div>
          </SettingsSection>

          {/* Memberships */}
          <SettingsSection
            id='memberships'
            title='Memberships'
            description='Workspaces you belong to.'
          >
            <div className='flex flex-col gap-2'>
              {isOverviewLoading ? (
                <>
                  <Skeleton className='h-14 w-full rounded-lg' />
                  <Skeleton className='h-14 w-full rounded-lg' />
                </>
              ) : overview?.memberships.length ? (
                overview.memberships.map((membership) => (
                  <div
                    key={membership.id}
                    className='flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3'
                  >
                    <div className='min-w-0'>
                      <div className='flex items-center gap-2'>
                        <p className='truncate text-sm font-medium'>{membership.name}</p>
                        <Badge variant={getRoleBadgeVariant(membership.role)}>
                          {membership.role}
                        </Badge>
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        /{membership.slug} &middot; Joined {formatDate(membership.joinedAt)}
                      </p>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => router.push(getWorkspacePath(membership.slug))}
                    >
                      Open
                      <ArrowUpRight className='ml-1 h-3.5 w-3.5' />
                    </Button>
                  </div>
                ))
              ) : (
                <p className='py-4 text-sm text-muted-foreground'>
                  No workspace memberships found.
                </p>
              )}
            </div>
          </SettingsSection>

          {/* Preferences */}
          <SettingsSection
            id='preferences'
            title='Preferences'
            description='Notifications and appearance.'
          >
            <div className='flex flex-col gap-4'>
              <div className='grid gap-4 sm:grid-cols-1'>
                <div className='space-y-1.5'>
                  <Label htmlFor='profile-theme' className='text-xs text-muted-foreground'>
                    Theme
                  </Label>
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
              </div>

              <div className='divide-y divide-border'>
                <SettingRow
                  icon={<BellRing className='h-4 w-4' />}
                  title='Workspace invite emails'
                  description='Receive invite-related emails.'
                  action={
                    <Switch
                      checked={emailInvites}
                      onCheckedChange={handleEmailInvitesChange}
                    />
                  }
                />
                <SettingRow
                  icon={<BellRing className='h-4 w-4' />}
                  title='Product updates'
                  description='Occasional product and release updates.'
                  action={
                    <Switch
                      checked={productUpdates}
                      onCheckedChange={handleProductUpdatesChange}
                    />
                  }
                />
                <SettingRow
                  icon={<BellRing className='h-4 w-4' />}
                  title='Publishing alerts'
                  description='Publish-related notifications.'
                  action={
                    <Switch
                      checked={publishAlerts}
                      onCheckedChange={handlePublishAlertsChange}
                    />
                  }
                />
                <SettingRow
                  icon={<BellRing className='h-4 w-4' />}
                  title='API usage alerts'
                  description='Notifications when API keys are used.'
                  action={
                    <Switch
                      checked={apiUsageAlerts}
                      onCheckedChange={handleApiUsageAlertsChange}
                    />
                  }
                />
              </div>

              <p className='text-xs text-muted-foreground'>
                Preference changes save automatically.
              </p>
            </div>
          </SettingsSection>

          {/* Account Actions */}
          <SettingsSection
            id='account-actions'
            title='Account Actions'
            description='Reset settings or end your session.'
            last
          >
            <div className='divide-y divide-border'>
              <SettingRow
                icon={<RefreshCcw className='h-4 w-4' />}
                title='Reset preferences'
                description='Revert notification preferences to defaults.'
                action={
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      resetPreferencesMutation.mutate(undefined, {
                        onSuccess: () => {
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
                description='Revert to your Google profile photo.'
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
                title='Sign out'
                description='End the current session on this device.'
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

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>
              Update your name and avatar settings.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <Avatar className='size-12 rounded-lg border'>
                <AvatarImage src={previewAvatar} alt={overview?.user.name ?? user.name} />
                <AvatarFallback className='rounded-lg bg-primary text-base font-semibold text-primary-foreground'>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0'>
                <p className='text-sm font-medium'>Avatar preview</p>
                <p className='truncate text-xs text-muted-foreground'>
                  {avatarMode === 'provider' ? 'Using Google avatar' : 'Custom URL'}
                </p>
              </div>
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='display-name'>Display name</Label>
              <Input
                id='display-name'
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder='Your name'
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='profile-email'>Email</Label>
              <Input id='profile-email' value={overview?.user.email ?? user.email} disabled />
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label htmlFor='dialog-avatar-mode'>Avatar source</Label>
                <Select
                  value={avatarMode}
                  onValueChange={(value) => setAvatarMode(value as 'provider' | 'custom')}
                >
                  <SelectTrigger id='dialog-avatar-mode' className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='provider'>Google avatar</SelectItem>
                    <SelectItem value='custom'>Custom URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='dialog-avatar-url'>Custom avatar URL</Label>
                <Input
                  id='dialog-avatar-url'
                  value={avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                  placeholder='https://example.com/avatar.png'
                  disabled={avatarMode !== 'custom'}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={resetAccountDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveAccount}
              disabled={
                isSavingAccount ||
                draftName.trim().length < 2 ||
                !hasAccountChanges
              }
            >
              {isSavingAccount ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
