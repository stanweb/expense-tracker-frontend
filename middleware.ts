import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('JSESSIONID');
  let isAuthenticated = false;

  // If a session cookie exists, validate it with the backend
  if (sessionCookie) {
    try {
      // The global axios client has a baseURL of 'http://localhost:8080/api/'
      const validationUrl = 'http://localhost:8080/api/auth/validate-session';
      
      // Forward the cookie to the backend validation endpoint
      const response = await fetch(validationUrl, {
        headers: {
          'Cookie': `JSESSIONID=${sessionCookie.value}`,
        },
      });

      // If the backend confirms the session is valid, mark as authenticated
      if (response.ok) {
        isAuthenticated = true;
      }
    } catch (error) {
      console.error('[Middleware] Error validating session:', error);
      // If validation fails, user remains unauthenticated
    }
  }

  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/register'];

  // If the user is not authenticated and trying to access a protected path, redirect to login
  if (!isAuthenticated && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is authenticated and trying to access login/register, redirect to home
  if (isAuthenticated && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
