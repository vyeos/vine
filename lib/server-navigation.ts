import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { UserLandingPage } from "@/types/auth";
import {
  getWorkspacePath,
  LAST_WORKSPACE_COOKIE,
  parseLastWorkspaceSlugs,
} from "@/lib/utils";

const DEFAULT_LANDING_PAGE: UserLandingPage = "dashboard";

type NavigationPreferences = {
  defaultWorkspaceSlug?: string;
  defaultLandingPage: UserLandingPage;
  memberships: Array<{ slug: string }>;
};

function toWorkspaceLandingPath(
  workspaceSlug: string,
  landingPage: UserLandingPage,
) {
  return getWorkspacePath(workspaceSlug, landingPage);
}

function getValidWorkspaceSlug(
  memberships: NavigationPreferences["memberships"],
  candidates: Array<string | undefined>,
) {
  const membershipSlugs = new Set(
    memberships.map((membership) => membership.slug),
  );

  return candidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" && membershipSlugs.has(candidate),
  );
}

function getPreferenceLandingPage(preferences: NavigationPreferences | null) {
  return preferences?.defaultLandingPage ?? DEFAULT_LANDING_PAGE;
}

function getLandingDestination(
  workspaceSlug: string | undefined,
  landingPage: UserLandingPage,
) {
  if (!workspaceSlug) {
    return null;
  }

  return toWorkspaceLandingPath(workspaceSlug, landingPage);
}

async function getLastUsedWorkspaceSlug() {
  const cookieStore = await cookies();
  return parseLastWorkspaceSlugs(cookieStore.get(LAST_WORKSPACE_COOKIE)?.value)
    .current;
}

export const getViewerNavigationPreferences = cache(
  async (): Promise<NavigationPreferences | null> => {
    const overview = await fetchQuery(api.users.profileOverview, {});

    if (!overview) {
      return null;
    }

    return {
      defaultWorkspaceSlug: overview.preferences.defaultWorkspaceSlug,
      defaultLandingPage: overview.preferences.defaultLandingPage,
      memberships: overview.memberships.map((membership) => ({
        slug: membership.slug,
      })),
    };
  },
);

export const getViewerPreferredDestination = cache(async () => {
  const preferences = await getViewerNavigationPreferences();

  if (!preferences) {
    return null;
  }

  const workspaceSlug = getValidWorkspaceSlug(preferences.memberships, [
    preferences.defaultWorkspaceSlug,
    preferences.memberships[0]?.slug,
  ]);

  return getLandingDestination(workspaceSlug, preferences.defaultLandingPage);
});

export const getViewerDashboardDestination = cache(async () => {
  const preferences = await getViewerNavigationPreferences();

  if (!preferences) {
    return null;
  }

  const workspaceSlug = getValidWorkspaceSlug(preferences.memberships, [
    await getLastUsedWorkspaceSlug(),
    preferences.defaultWorkspaceSlug,
    preferences.memberships[0]?.slug,
  ]);

  return getLandingDestination(workspaceSlug, DEFAULT_LANDING_PAGE);
});

export const getViewerDefaultWorkspaceDestination = cache(async () => {
  const preferences = await getViewerNavigationPreferences();

  if (!preferences?.defaultWorkspaceSlug) {
    return null;
  }

  return getLandingDestination(
    preferences.defaultWorkspaceSlug,
    preferences.defaultLandingPage,
  );
});

export const getViewerWorkspaceLandingDestination = cache(
  async (workspaceSlug: string) => {
    const preferences = await getViewerNavigationPreferences();
    return toWorkspaceLandingPath(
      workspaceSlug,
      getPreferenceLandingPage(preferences),
    );
  },
);
