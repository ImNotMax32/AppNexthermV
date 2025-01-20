import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'sb-auth-token',
        secure: true,
        maxAge: 60 * 60 * 8, // 8 heures
        path: '/',
        sameSite: 'lax'
      },
      auth: {
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
