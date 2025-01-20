import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Créer le client Supabase avec une gestion explicite des cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            value,
            ...options,
            name,
          });
          response.cookies.set({
            value,
            ...options,
            name,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.delete(name);
          response.cookies.delete(name);
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Ajouter des headers anti-cache
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Pragma', 'no-cache');

  // Autoriser l'accès à /auth/callback
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return response;
  }

  // Rediriger vers /protected si déjà connecté et sur les pages d'auth
  if (session && (request.nextUrl.pathname === '/sign-in' || request.nextUrl.pathname === '/sign-up')) {
    return NextResponse.redirect(new URL('/protected', request.url));
  }

  // Protéger les routes /protected
  if (!session && request.nextUrl.pathname.startsWith('/protected')) {
    // Sauvegarder l'URL de redirection
    const redirectUrl = new URL('/sign-in', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Permettre l'accès à /api/calculations seulement si authentifié
  if (request.nextUrl.pathname.startsWith("/api/calculations") && !session) {
    return NextResponse.json(
      { error: "Non autorisé" },
      { status: 401 }
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    '/api/:path*'
  ],
};