import {
  convexAuthNextjsMiddleware,
  nextjsMiddlewareRedirect,
} from '@convex-dev/auth/nextjs/server';

const protectedPrefixes = ['/workspaces', '/dashboard', '/profile', '/accept-invite'];
const workspaceReservedSegments = new Set([
  'accept-invite',
  'api',
  'dashboard',
  'docs',
  'llms-full.txt',
  'og',
  'profile',
  'sign-in',
  'workspaces',
]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const pathname = request.nextUrl.pathname;
  const [firstSegment] = pathname.split('/').filter(Boolean);
  const isProtectedRoute = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  ) || (
    Boolean(firstSegment) &&
    !workspaceReservedSegments.has(firstSegment)
  );

  if (isProtectedRoute && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, '/sign-in');
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
