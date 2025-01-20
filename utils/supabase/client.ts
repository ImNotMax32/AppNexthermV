import { createBrowserClient } from "@supabase/ssr";
import { CookieOptions } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'sb-auth-token',
        lifetime: 60 * 60 * 8, // 8 heures
        domain: process.env.NEXT_PUBLIC_DOMAIN,
        path: '/',
        sameSite: 'lax'
      },
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        storage: {
          getItem: (key: string) => {
            try {
              const value = window.localStorage.getItem(key);
              return value;
            } catch {
              try {
                return window.sessionStorage.getItem(key);
              } catch {
                return null;
              }
            }
          },
          setItem: (key: string, value: string) => {
            try {
              window.localStorage.setItem(key, value);
            } catch {
              try {
                window.sessionStorage.setItem(key, value);
              } catch {
                console.warn('Unable to store auth state');
              }
            }
          },
          removeItem: (key: string) => {
            try {
              window.localStorage.removeItem(key);
            } catch {
              try {
                window.sessionStorage.removeItem(key);
              } catch {
                console.warn('Unable to remove auth state');
              }
            }
          },
        },
      },
    }
  );
