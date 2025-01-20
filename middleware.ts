import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Ajouter des headers pour éviter le cache
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value;
          },
          set(name, value, options) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name, options) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            });
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    // Double vérification de la session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (sessionError) {
      console.error('Session error in middleware:', sessionError);
    }

    if (userError) {
      console.error('User error in middleware:', userError);
    }

    const hasValidSession = session && user && session.user.id === user.id;

    // Si nous sommes sur la route de callback, laisser passer
    if (request.nextUrl.pathname === '/auth/callback') {
      return response;
    }

    // Si nous sommes sur la page de connexion et que nous avons une session valide
    if ((request.nextUrl.pathname === '/sign-in' || request.nextUrl.pathname === '/sign-up') && hasValidSession) {
      return NextResponse.redirect(new URL('/protected', request.url));
    }

    // Si nous essayons d'accéder à une route protégée sans session valide
    if (request.nextUrl.pathname.startsWith('/protected') && !hasValidSession) {
      // Nettoyer les cookies de session potentiellement invalides
      response.cookies.set('supabase-auth-completed', '', {
        path: '/',
        maxAge: 0,
      });

      // Stocker l'URL actuelle pour la redirection après connexion
      const redirectUrl = new URL('/sign-in', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch (e) {
    console.error('Middleware error:', e);
    // En cas d'erreur, rediriger vers la page de connexion
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    '/api/:path*'
  ],
};