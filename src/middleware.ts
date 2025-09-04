// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// This function runs before every request
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Example: Protect routes starting with /dashboard
    if (pathname.startsWith("/secure") || pathname.startsWith("/api")) {
        const token = request.cookies.get("session")?.value;

        if (!token) {
            // Redirect to login if not authenticated
            const loginUrl = new URL("/auth", request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Continue to the requested page
    return NextResponse.next();
}

// Apply middleware only to these routes
export const config = {
    matcher: ["/secure/:path*", "/api/:path*"],
};
