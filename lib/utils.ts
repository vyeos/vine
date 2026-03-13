import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;
export const LAST_WORKSPACE_COOKIE = 'lastWorkspaceSlug';

export function setCookie(
  name: string,
  value: string,
  options?: { maxAgeSeconds?: number; path?: string },
) {
  if (typeof document === 'undefined') {
    return;
  }

  const encodedValue = encodeURIComponent(value);
  const maxAge = options?.maxAgeSeconds ?? SEVEN_DAYS_IN_SECONDS;
  const path = options?.path ?? '/';
  document.cookie = `${name}=${encodedValue}; Max-Age=${maxAge}; Path=${path}`;
}

export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const cookies = document.cookie ? document.cookie.split('; ') : [];

  for (const cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === name) {
      return decodeURIComponent(value ?? '');
    }
  }

  return undefined;
}

export function deleteCookie(name: string, options?: { path?: string }) {
  if (typeof document === 'undefined') {
    return;
  }

  const path = options?.path ?? '/';
  document.cookie = `${name}=; Max-Age=0; Path=${path}`;
}

export function parseLastWorkspaceSlugs(raw?: string): {
  current?: string;
  previous?: string;
} {
  if (!raw) {
    return {};
  }

  const [current, previous] = raw.split(',').filter(Boolean);
  return { current, previous };
}

export function getLastWorkspaceSlugs(): {
  current?: string;
  previous?: string;
} {
  return parseLastWorkspaceSlugs(getCookie(LAST_WORKSPACE_COOKIE));
}

export function updateLastWorkspaceCookie(nextCurrentSlug: string) {
  const { current: previousCurrent } = getLastWorkspaceSlugs();
  const previous =
    previousCurrent && previousCurrent !== nextCurrentSlug
      ? previousCurrent
      : undefined;
  const value = previous ? `${nextCurrentSlug},${previous}` : nextCurrentSlug;

  setCookie(LAST_WORKSPACE_COOKIE, value, {
    maxAgeSeconds: SEVEN_DAYS_IN_SECONDS,
  });
}

export function getWorkspacePath(workspaceSlug: string, subpath = '') {
  const normalizedSubpath = subpath.replace(/^\/+|\/+$/g, '');
  return normalizedSubpath
    ? `/${workspaceSlug}/${normalizedSubpath}`
    : `/${workspaceSlug}`;
}

export function getWorkspacePathSuffix(
  pathname: string,
  workspaceSlug?: string,
) {
  if (!workspaceSlug) return '';

  const basePath = getWorkspacePath(workspaceSlug);
  if (pathname === basePath) {
    return '';
  }

  if (pathname.startsWith(`${basePath}/`)) {
    return pathname.slice(basePath.length);
  }

  return '';
}
