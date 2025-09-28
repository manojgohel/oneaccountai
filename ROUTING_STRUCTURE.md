# Next.js Group Routing Structure

This project implements a clear separation between guest and protected routes using Next.js 13+ App Router group routing.

## 📁 Folder Structure

```
src/app/
├── (guest)/                    # Guest routes group
│   ├── layout.tsx             # Guest layout (redirects authenticated users)
│   ├── page.tsx               # Guest home page
│   ├── auth/                  # Authentication pages
│   │   └── page.tsx
│   └── landing/               # Landing page
│       └── page.tsx
├── secure/                    # Protected routes
│   ├── layout.tsx             # Protected layout
│   ├── page.tsx               # Dashboard
│   ├── profile/               # User profile
│   ├── wallet/                # Wallet management
│   └── [conversationId]/      # Chat conversations
├── api/                       # API routes
│   ├── (secure)/              # Protected API routes
│   ├── file/                  # Public file API
│   └── webhook/               # Webhook endpoints
├── page.tsx                   # Root page (redirects based on auth status)
└── layout.tsx                 # Root layout
```

## 🔐 Route Categories

### Guest Routes `(guest)/`
- **Purpose**: Routes accessible to unauthenticated users
- **Layout**: `(guest)/layout.tsx` - Redirects authenticated users to `/secure`
- **Routes**:
  - `/` → Redirects to `/(guest)/landing` or `/secure` based on auth status
  - `/(guest)/landing` → Landing page for new users
  - `/(guest)/auth` → Authentication pages
  - `/(guest)/page.tsx` → Guest home page

### Protected Routes `/secure`
- **Purpose**: Routes requiring authentication
- **Layout**: `secure/layout.tsx` - Protected layout
- **Routes**:
  - `/secure` → Main dashboard
  - `/secure/profile` → User profile
  - `/secure/wallet` → Wallet management
  - `/secure/[conversationId]` → Chat conversations

### API Routes `/api`
- **Protected**: `/api/(secure)/`, `/api/chat`, `/api/checkout`
- **Public**: `/api/file`, `/api/webhook`

## 🛡️ Middleware Protection

The middleware (`src/middleware.ts`) handles route protection:

### Route Detection
```typescript
const isGuestRoute = pathname.startsWith("/(guest)") ||
                    pathname === "/" ||
                    pathname === "/landing";

const isProtectedRoute = pathname.startsWith("/secure") ||
                        pathname.startsWith("/api/(secure)") ||
                        pathname.startsWith("/api/chat") ||
                        pathname.startsWith("/api/checkout");

const isPublicRoute = pathname.startsWith("/api/file") ||
                     pathname.startsWith("/api/webhook") ||
                     pathname.startsWith("/_next") ||
                     pathname.startsWith("/favicon.ico");
```

### Protection Logic
1. **Protected Routes**: Require valid JWT token, redirect to `/(guest)/auth` if invalid
2. **Guest Routes**: Redirect authenticated users to `/secure`
3. **Public Routes**: Skip middleware processing

## 🔄 Authentication Flow

### Unauthenticated User
1. Visits `/` → Redirected to `/(guest)/landing`
2. Clicks "Sign In" → Goes to `/(guest)/auth`
3. After successful login → Redirected to `/secure`

### Authenticated User
1. Visits `/` → Redirected to `/secure`
2. Visits `/(guest)/*` → Redirected to `/secure`
3. Visits `/secure/*` → Allowed (with valid token)

## 🚀 Benefits

1. **Clear Separation**: Guest and protected routes are clearly separated
2. **Automatic Redirects**: Users are automatically redirected based on auth status
3. **Security**: All protected routes require authentication
4. **User Experience**: Smooth navigation without manual redirects
5. **Maintainability**: Easy to add new routes to appropriate groups

## 📝 Usage Examples

### Adding a New Guest Route
```typescript
// Create: src/app/(guest)/new-page/page.tsx
export default function NewGuestPage() {
  return <div>Guest content</div>;
}
```

### Adding a New Protected Route
```typescript
// Create: src/app/secure/new-feature/page.tsx
export default function NewProtectedPage() {
  return <div>Protected content</div>;
}
```

### Adding a New Protected API Route
```typescript
// Create: src/app/api/(secure)/new-endpoint/route.ts
export async function GET() {
  // Protected API logic
}
```

## 🔧 Configuration

The middleware configuration excludes static files and public APIs:

```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|api/file|api/webhook).*)',
  ],
};
```

This ensures optimal performance while maintaining security for all user-facing routes.
