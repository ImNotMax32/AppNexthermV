import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const redirect = requestUrl.searchParams.get('redirect');
  const finalRedirect = redirect || next || '/protected';

  // Si nous n'avons pas de code, rediriger vers la page de connexion
  if (!code) {
    console.error('No code found in URL');
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=No code found`);
  }

  try {
    // Créer le client avec les cookies
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore
    }, {
      cookieOptions: {
        name: 'sb',
        path: '/',
        domain: "https://app-nextherm-v.vercel.app/", // @TODO: Loïc: mettre en place dans les variables d'environnement plutot que d'être en dur
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      }
    });

    // Échanger le code contre une session
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code:', error);
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=${encodeURIComponent(error.message)}`);
    }

    if (!session) {
      console.error('No session established');
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=No session established`);
    }

    console.log('Session established successfully:', {
      user: session.user.email,
      expiresAt: session.expires_at
    });

    // Rediriger vers la page finale avec le type recovery
    const redirectUrl = new URL(`${requestUrl.origin}${finalRedirect}`);
    redirectUrl.searchParams.set('type', 'recovery');

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Error in callback:', error);
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=Authentication failed`);
  }
}
