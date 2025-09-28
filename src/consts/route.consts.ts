// Only define public routes - everything else is protected by default
export const PUBLIC_ROUTES = [
    "/api/file",
    "/api/webhook",
    "/_next",
    "/favicon.ico",
    "/public",
    "/api/health",
    "/(guest)", // Guest routes
    "/",
    "/landing",
    "/auth"
];