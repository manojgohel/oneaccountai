"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "server-only";

// Types based on User model
interface User {
    _id: string;
    name?: string;
    email?: string;
    mobile: string;
    status?: boolean;
}

interface SessionPayload {
    userId: string;
    expires: Date;
    mobile?: string;
}

interface CookieConfig {
    name: string;
    options: {
        httpOnly: boolean;
        secure: boolean;
        sameSite: "lax" | "strict" | "none";
        path: string;
    };
    duration: number;
}

// Constants
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
}

const ENCODED_KEY: Uint8Array = new TextEncoder().encode(SESSION_SECRET);

const COOKIE_CONFIG: CookieConfig = {
    name: "session",
    options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    },
    duration: 6 * 30 * 24 * 60 * 60 * 1000, // 6 months in milliseconds
};

const USER_ID_COOKIE = "_id";
const JWT_EXPIRY = "7d";
const JWT_ALGORITHM = "HS256";

/**
 * Encrypts payload into a JWT token
 * @param payload - Data to encrypt
 * @returns Promise<string> - JWT token
 */
export async function encrypt(payload: any): Promise<string> {
    try {
        return await new SignJWT(payload)
            .setProtectedHeader({ alg: JWT_ALGORITHM })
            .setIssuedAt()
            .setExpirationTime(JWT_EXPIRY)
            .sign(ENCODED_KEY);
    } catch (error) {
        console.error("Failed to encrypt session:", error);
        throw new Error("Session encryption failed");
    }
}

/**
 * Decrypts JWT token to extract payload
 * @param session - JWT token to decrypt
 * @returns Promise<SessionPayload | null> - Decrypted payload or null if invalid
 */
export async function decrypt(session: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(session, ENCODED_KEY, {
            algorithms: [JWT_ALGORITHM],
        });
        return payload as any;
    } catch (error) {
        console.error("Failed to verify session:", error);
        return null;
    }
}

/**
 * Creates session cookies without redirecting
 * @param updatedUser - User object containing user data
 * @returns Promise<void> - Only creates session, no redirect
 */
export async function createSessionOnly(updatedUser: User): Promise<any> {
    try {
        const cookieStore = await cookies();
        const expires = new Date(Date.now() + COOKIE_CONFIG.duration);

        // Build session payload with only User model fields
        const sessionPayload: SessionPayload = {
            userId: updatedUser._id,
            expires,
            mobile: updatedUser.mobile,
        };

        // Encrypt the session payload
        const sessionToken = await encrypt(sessionPayload);

        // Set session cookie
        cookieStore.set(COOKIE_CONFIG.name, sessionToken, {
            ...COOKIE_CONFIG.options,
            expires
        });

        // Set user ID cookie for quick access
        cookieStore.set(USER_ID_COOKIE, updatedUser._id, {
            ...COOKIE_CONFIG.options,
            expires
        });

        console.log("✅ Session created successfully for user:", updatedUser._id);
        return { session: sessionToken, _id: updatedUser._id };

    } catch (error) {
        console.error("❌ Failed to create session:", error);
        throw new Error("Session creation failed");
    }
}

/**
 * Creates a new session for the user and redirects to home page
 * @param updatedUser - User object containing user data
 * @returns Promise<never> - Redirects to home page
 */
export async function createSession(updatedUser: User): Promise<never> {
    await createSessionOnly(updatedUser);
    redirect("/chat");
}

/**
 * Verifies the current session
 * @returns Promise<SessionPayload | null> - Session data or null if invalid
 */
export async function verifySession(): Promise<SessionPayload | null> {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get(COOKIE_CONFIG.name)?.value;

        if (!sessionCookie) {
            console.log("No session cookie found");
            return null;
        }

        // Decrypt and verify the session
        const session = await decrypt(sessionCookie);

        if (!session?.userId) {
            console.log("Invalid session: missing userId");
            return null;
        }

        // Check if session has expired
        if (session.expires && new Date() > new Date(session.expires)) {
            console.log("Session has expired");
            await deleteSession();
            return null;
        }

        return session;

    } catch (error) {
        console.error("❌ Session verification failed:", error);
        return null;
    }
}

/**
 * Deletes the current session and redirects to login page
 * @returns Promise<never> - Redirects to login page
 */
export async function deleteSession(): Promise<never> {
    try {
        const cookieStore = await cookies();

        // Delete session cookie
        cookieStore.delete(COOKIE_CONFIG.name);

        // Delete user ID cookie
        cookieStore.delete(USER_ID_COOKIE);

        console.log("✅ Session deleted successfully");

    } catch (error) {
        console.error("❌ Failed to delete session:", error);
    }

    // Redirect to login page
    redirect("/login");
}

/**
 * Deletes session cookies without redirecting
 * @returns Promise<void> - Only deletes session, no redirect
 */
export async function deleteSessionOnly(): Promise<void> {
    try {
        const cookieStore = await cookies();

        // Delete session cookie
        cookieStore.delete(COOKIE_CONFIG.name);

        // Delete user ID cookie
        cookieStore.delete(USER_ID_COOKIE);

        console.log("✅ Session deleted successfully");

    } catch (error) {
        console.error("❌ Failed to delete session:", error);
        throw new Error("Session deletion failed");
    }
}

/**
 * Gets the current user ID from session
 * @returns Promise<string | null> - User ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
    const session = await verifySession();
    return session?.userId || null;
}

/**
 * Checks if user is authenticated
 * @returns Promise<boolean> - True if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
    const session = await verifySession();
    return !!session?.userId;
}

/**
 * Updates session with new data (extends session duration)
 * @param updates - Partial session data to update
 * @returns Promise<void>
 */
export async function updateSession(updates: Partial<SessionPayload>): Promise<void> {
    try {
        const currentSession = await verifySession();

        if (!currentSession) {
            throw new Error("No active session to update");
        }

        const cookieStore = await cookies();
        const expires = new Date(Date.now() + COOKIE_CONFIG.duration);

        // Merge current session with updates
        const updatedPayload: SessionPayload = {
            ...currentSession,
            ...updates,
            expires, // Always update expiry
        };

        // Encrypt and set updated session
        const sessionToken = await encrypt(updatedPayload);

        cookieStore.set(COOKIE_CONFIG.name, sessionToken, {
            ...COOKIE_CONFIG.options,
            expires
        });

        console.log("✅ Session updated successfully");

    } catch (error) {
        console.error("❌ Failed to update session:", error);
        throw new Error("Session update failed");
    }
}

/**
 * Refreshes session expiry without changing data
 * @returns Promise<void>
 */
export async function refreshSession(): Promise<void> {
    const currentSession = await verifySession();
    if (currentSession) {
        await updateSession({});
    }
}