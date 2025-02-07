import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get('token'); // 🔥 Récupère le token
  const redirect = requestUrl.searchParams.get('redirect') || '/protected';

  if (!token) {
    console.error('No token found in URL');
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=No token found`);
  }

  try {
    // Création du client Supabase avec les cookies
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore },
      {
        cookieOptions: {
          name: 'sb',
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        },
      }
    );

    // ✅ Échanger le token PKCE contre une session
    const { data, error } = await supabase.auth.exchangeCodeForSession(token);

    if (error) {
      console.error('Error exchanging code:', error);
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=${encodeURIComponent(error.message)}`);
    }

    console.log('Session established successfully:', {
      user: data.session?.user.email,
      expiresAt: data.session?.expires_at,
    });

    // ✅ Redirection vers la page finale après le reset
    const redirectUrl = new URL(`${requestUrl.origin}${redirect}`);
    redirectUrl.searchParams.set('type', 'recovery');

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Error in callback:', error);
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=Authentication failed`);
  }
}
