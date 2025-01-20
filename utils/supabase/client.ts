import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
            ?.split('=')[1]
        },
        set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string; secure?: boolean; sameSite?: 'strict' | 'lax' | 'none' }) {
          let cookie = `${name}=${value}; path=${options.path || '/'}`;
          if (options.maxAge) cookie += `; max-age=${options.maxAge}`;
          if (options.domain) cookie += `; domain=${options.domain}`;
          cookie += `; secure`;
          cookie += `; samesite=lax`;
          document.cookie = cookie;
        },
        remove(name: string, options: { path?: string; domain?: string }) {
          document.cookie = `${name}=; path=${options.path || '/'}; max-age=0; secure; samesite=lax`;
        },
      },
      auth: {
        storageKey: 'supabase.auth.token',
        storage: {
          getItem: (key: string) => {
            try {
              const value = window.localStorage.getItem(key);
              return value;
            } catch {
              // Fallback pour Edge si localStorage n'est pas disponible
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
              // Fallback pour Edge
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
