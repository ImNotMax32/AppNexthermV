import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get('token');
  const redirect = requestUrl.searchParams.get('redirect') || '/protected';

  if (!token) {
    console.error('No token found in URL');
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=No token found`);
  }

  try {
    // Récupérer le store des cookies
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

    // Définir la session directement
    const { data, error } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: token,
    });

    if (error) {
      console.error('Error setting session:', error);
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=${encodeURIComponent(error.message)}`);
    }

    console.log('Session established successfully:', {
      user: data.session?.user.email,
      expiresAt: data.session?.expires_at,
    });

    // Rediriger vers la page finale
    const redirectUrl = new URL(`${requestUrl.origin}${redirect}`);
    redirectUrl.searchParams.set('type', 'recovery');

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Error in callback:', error);
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=Authentication failed`);
  }
}
