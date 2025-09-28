// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { validateToken } from "./lib/session";
import { PUBLIC_ROUTES } from "./consts/route.consts";



function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some(route => {
        if (route.startsWith("(")) {
            // Handle route groups like "/(guest)"
            return pathname.startsWith(route);
        } else {
            // Handle exact matches or prefix matches
            return pathname === route || pathname.startsWith(route + "/");
        }
    });
}

// Enhanced security headers
function addSecurityHeaders(response: NextResponse): void {
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Enhanced CSP header
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https: blob:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' https: wss:; " +
        "frame-ancestors 'none';"
    );
}

// Enhanced authentication validation
async function validateAuthentication(request: NextRequest): Promise<{ isValid: boolean; sessionData?: any; error?: string }> {
    const token = request.cookies.get("session")?.value;

    if (!token) {
        return { isValid: false, error: "No session token found" };
    }

    try {
        const sessionData = await validateToken(token);
        if (!sessionData) {
            return { isValid: false, error: "Invalid or expired token" };
        }
        return { isValid: true, sessionData };
    } catch (error) {
        return {
            isValid: false,
            error: `Token validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

// This function runs before every request
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const response = NextResponse.next();

    // Add security headers to all responses
    addSecurityHeaders(response);

    // Debug logging
    console.log(`🔍 Middleware processing: ${pathname}`);

    // Handle specific redirects first
    if (pathname === "/(guest)/auth") {
        console.log(`🔄 Redirecting /(guest)/auth to /auth`);
        const authUrl = new URL("/auth", request.url);
        return NextResponse.redirect(authUrl);
    }

    // Skip middleware for public routes
    if (isPublicRoute(pathname)) {
        console.log(`🌐 Public route accessed: ${pathname}`);

        // Handle guest routes - redirect authenticated users to secure area
        if (pathname.startsWith("/(guest)") || pathname === "/" || pathname === "/landing" || pathname === "/auth") {
            const authResult = await validateAuthentication(request);
            if (authResult.isValid && authResult.sessionData) {
                console.log(`✅ Authenticated user accessing guest route, redirecting to secure area`);
                const secureUrl = new URL("/secure", request.url);
                return NextResponse.redirect(secureUrl);
            }
        }
        return response;
    }

    // Everything else is protected - require authentication
    console.log(`🔒 Protected route accessed: ${pathname}`);
    const authResult = await validateAuthentication(request);

    if (!authResult.isValid) {
        console.log(`❌ Authentication failed for protected route ${pathname}: ${authResult.error}`);
        const loginUrl = new URL("/(guest)/auth", request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Add user information to headers for API routes
    if (pathname.startsWith("/api/") && authResult.sessionData) {
        response.headers.set('X-User-ID', authResult.sessionData.userId);
        if (authResult.sessionData.mobile) {
            response.headers.set('X-User-Mobile', authResult.sessionData.mobile);
        }
        if (authResult.sessionData.email) {
            response.headers.set('X-User-Email', authResult.sessionData.email);
        }
    }

    console.log(`✅ Valid session for user: ${authResult.sessionData?.userId} on route: ${pathname}`);
    return response;
}

// Enhanced middleware configuration
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         * - static assets
         * - public API routes (file, webhook, health)
         */
        '/((?!_next/static|_next/image|favicon.ico|public/|static/|images/|icons/|api/file|api/webhook|api/health).*)',
    ],
};
