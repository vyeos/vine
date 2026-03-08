'use client';

import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PingingDotChart } from '@/components/ui/pinging-dot-chart';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardHeatmap } from '@/hooks/useDashboardHeatmap';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useWorkspaceVerification } from '@/hooks/useWorkspace';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';
import type { DashboardRecentPost } from '@/types/dashboard';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function StatsSkeleton() {
  return (
    <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className='space-y-4 rounded-md border border-border/40 bg-muted/10 p-6'>
          <Skeleton className='h-10 w-24' />
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-4 w-20' />
        </div>
      ))}
    </div>
  );
}

function HeatmapSkeleton() {
  return (
    <div className='space-y-4 rounded-md border border-dashed border-border/40 bg-background/80 px-8 py-16 shadow-sm'>
      <Skeleton className='mx-auto h-6 w-48' />
      <div className='flex flex-wrap justify-center gap-2'>
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className='h-6 w-6 rounded-md' />
        ))}
      </div>
    </div>
  );
}

function RecentPostsSkeleton() {
  return (
    <div className='rounded-md bg-card/30 p-1'>
      <div className='flex flex-col'>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index}>
            <div className='flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='space-y-1'>
                <Skeleton className='h-5 w-48' />
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-4 w-full' />
              </div>
            </div>
            {index < 2 && <Separator className='bg-accent/50 text-border/60' />}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const greeting = getGreeting();
  const router = useRouter();
  const workspaceSlug = useWorkspaceSlug();
  const { data: user, isLoading: userLoading } = useAuth();
  const { data: workspace } = useWorkspaceVerification(workspaceSlug);
  const { data, isLoading } = useDashboardStats(workspaceSlug);
  const { data: heatmapData, isLoading: heatmapLoading } = useDashboardHeatmap(workspaceSlug);

  const workspaceName = workspace?.name ?? data?.workspaceName ?? workspaceSlug ?? 'workspace';
  const username = user?.name ?? '';
  const stats = data?.stats ?? [];
  const recentPosts = data?.recentPosts ?? [];
  const heatmap = heatmapData?.heatmap ?? [];
  const totalActivity = heatmap.reduce((sum, item) => sum + item.activity, 0);
  const activitySummary =
    totalActivity > 0
      ? `${totalActivity} items created in the last 15 days`
      : 'No activity in the last 15 days';

  const renderRecentPost = (post: DashboardRecentPost, index: number, total: number) => (
    <div key={post.id ?? post.title}>
      <div
        role='button'
        tabIndex={0}
        onClick={() => {
          if (workspaceSlug && post.slug) {
            router.push(`/dashboard/${workspaceSlug}/editor/${post.slug}`);
          }
        }}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && workspaceSlug && post.slug) {
            e.preventDefault();
            router.push(`/dashboard/${workspaceSlug}/editor/${post.slug}`);
          }
        }}
        className='flex flex-col gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:flex-row sm:items-center sm:justify-between'
      >
        <div className='space-y-1'>
          <p className='text-base font-medium text-foreground'>{post.title}</p>
          <div className='flex flex-wrap items-center gap-2'>
            <p className='text-sm text-muted-foreground'>{post.publishedAt}</p>
            <Separator orientation='vertical' className='h-4' />
            <span className='text-xs uppercase tracking-wide text-muted-foreground'>
              {post.status}
            </span>
          </div>
          {post.excerpt && (
            <p className='line-clamp-2 text-sm leading-relaxed text-muted-foreground/80'>
              {post.excerpt}
            </p>
          )}
        </div>
      </div>
      {index < total - 1 && <Separator className='bg-accent/50 text-border/60' />}
    </div>
  );

  return (
    <ScrollArea className='h-full p-8'>
      <div className='flex flex-col gap-10 pb-16 pr-4'>
        <section className='space-y-2 px-4'>
          <div className='flex items-center gap-2 text-3xl font-semibold tracking-tight'>
            <span>{greeting}</span>
            {userLoading ? (
              <Skeleton className='h-8 w-24 rounded-md' />
            ) : (
              <span>{username}!</span>
            )}
          </div>
          <div className='flex items-center gap-2 text-base text-muted-foreground'>
            <span>Here’s what’s happening in</span>
            {userLoading ? (
              <Skeleton className='h-6 w-32 rounded-md' />
            ) : (
              <span>{workspaceName}</span>
            )}
          </div>
        </section>

        <section className='space-y-4 px-4'>
          <p className='text-sm font-medium text-muted-foreground'>{workspaceName} has:</p>
          {isLoading ? (
            <StatsSkeleton />
          ) : (
            <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
              {stats.map((item, index) => (
                <div
                  key={item.label}
                  className='animate-in fade-in-50 zoom-in-95 rounded-3xl border border-foreground/10 bg-muted/20 p-6 duration-300'
                  style={{ animationDelay: `${Math.min(index, 3) * 100}ms` }}
                >
                  <div className='text-4xl font-semibold leading-tight'>{item.value}</div>
                  <div className='mt-3 text-sm uppercase tracking-widest text-muted-foreground'>
                    {item.label}
                  </div>
                </div>
              ))}
              {stats.length === 0 && (
                <p className='col-span-full text-sm text-muted-foreground'>No stats available yet.</p>
              )}
            </div>
          )}
        </section>

        <section className='space-y-4 px-4'>
          {heatmapLoading ? (
            <HeatmapSkeleton />
          ) : (
            <div className='animate-in fade-in-50 zoom-in-95 rounded-md border border-foreground/10 bg-background/80 p-1 shadow-sm duration-300'>
              <PingingDotChart
                data={heatmap}
                title={`Activity in ${workspaceName}`}
                description={activitySummary}
              />
            </div>
          )}
        </section>

        <section className='space-y-4 px-4'>
          <p className='text-sm font-medium text-muted-foreground'>Recent Posts in {workspaceName}:</p>
          {isLoading ? (
            <RecentPostsSkeleton />
          ) : recentPosts.length === 0 ? (
            <div className='animate-in fade-in-50 zoom-in-95 rounded-md border border-foreground/10 bg-card/30 p-1 duration-300'>
              <div className='px-5 py-6 text-center text-sm text-muted-foreground'>
                No recent posts found.
              </div>
            </div>
          ) : (
            <div className='animate-in fade-in-50 zoom-in-95 rounded-md border border-foreground/10 bg-card/30 p-1 duration-300'>
              <div className='flex flex-col'>
                {recentPosts.map((post, index) => renderRecentPost(post, index, recentPosts.length))}
              </div>
            </div>
          )}
        </section>
      </div>
    </ScrollArea>
  );
}
