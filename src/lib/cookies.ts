// utils/cookies.ts

import Cookies from "js-cookie";

interface CookieOptions {
  expires?: number | Date;
  path?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

/**
 * Set a cookie
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Optional settings (expires, path, etc.)
 */
export const setCookie = (name: string, value: string, options?: CookieOptions): void => {
  Cookies.set(name, value, { path: "/", ...options });
};

/**
 * Get a cookie by name
 * @param name - Cookie name
 * @returns The cookie value or null if not found
 */
export const getCookie = (name: string): string | null => {
  return Cookies.get(name) ?? null;
};

/**
 * Delete a specific cookie by name
 * @param name - Cookie name
 */
export const deleteCookie = (name: string): void => {
  Cookies.remove(name, { path: "/" });
};

/**
 * Delete all cookies
 */
export const deleteAllCookies = (): void => {
  const allCookies = Cookies.get();
  Object.keys(allCookies).forEach((cookieName) => {
    Cookies.remove(cookieName, { path: "/" });
  });
};
