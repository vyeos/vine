import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import {
  getWorkspacePath,
  LAST_WORKSPACE_COOKIE,
  parseLastWorkspaceSlugs,
} from "@/lib/utils";
import { DEFAULT_WORKSPACE_ROUTE } from "@/lib/navigation";

type NavigationPreferences = {
  memberships: Array<{ slug: string }>;
};

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

function getWorkspaceAppDestination(workspaceSlug: string | undefined) {
  if (!workspaceSlug) {
    return '/workspaces';
  }

  return getWorkspacePath(workspaceSlug, DEFAULT_WORKSPACE_ROUTE);
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
      memberships: overview.memberships.map((membership) => ({
        slug: membership.slug,
      })),
    };
  },
);

export const getViewerAppDestination = cache(async () => {
  const preferences = await getViewerNavigationPreferences();

  if (!preferences) {
    return null;
  }

  const workspaceSlug = getValidWorkspaceSlug(preferences.memberships, [
    await getLastUsedWorkspaceSlug(),
    preferences.memberships[0]?.slug,
  ]);

  return getWorkspaceAppDestination(workspaceSlug);
});
