import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, errors as joseErrors } from 'jose';

interface JwtPayload {
  id: string;
  role: 'admin' | 'dealer';
}

const JWT_SECRET = process.env.JWT_SECRET;

const getLoginRedirect = (req: NextRequest, sessionExpired = false) => {
  const loginUrl = new URL('/login', req.url);
  if (sessionExpired) {
    loginUrl.searchParams.set('sessionExpired', '1');
  }
  return NextResponse.redirect(loginUrl);
};

export async function middleware(req: NextRequest) {

  const { pathname } = req.nextUrl;

  // Public routes that do not require authentication
  const publicPaths = ['/api/auth/login', '/', '/login','/api/auth/register']; // Adjust as needed
  if (publicPaths.includes(pathname) || pathname.startsWith('/api/public')) {
    return NextResponse.next();
  }

  // Check for JWT token in cookies or Authorization header
  let token: string | undefined;

  // Option 1: Check for HTTP-only cookie (recommended)
  token = req.cookies.get('auth_token')?.value;

  // Option 2: Check Authorization header (if not using HTTP-only cookies, less secure)
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token || !JWT_SECRET) {
    // Redirect to login or return unauthorized error
    return getLoginRedirect(req);
    // return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    const decoded = payload as unknown as JwtPayload;

    // Attach user info to the request (how to do this in Next.js middleware is tricky, 
    // often handled by passing data to API routes via headers or by re-fetching user data)
    // For this example, we'll primarily use the role for route protection.

    // Role-based access control
    if (pathname.startsWith('/api/admin') && decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    if (pathname.startsWith('/api/dealer') && decoded.role !== 'dealer') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Proceed to the next handler
    return NextResponse.next();
  } catch (error) {
    if (error instanceof joseErrors.JWTExpired) {
      return getLoginRedirect(req, true);
    }
    console.error('JWT verification failed:', error);
    return getLoginRedirect(req);
    // return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}

// Configuration for the middleware matcher
export const config = {
  matcher: ['/((?!_next|favicon.ico).*)(.+)'], // Apply middleware to all paths except Next.js internals and favicon
};


