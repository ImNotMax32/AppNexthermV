import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code'); // 🔥 Récupération du code d'auth
  const redirect = requestUrl.searchParams.get('redirect') || '/protected';

  if (!code) {
    console.error('No code found in URL');
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=No code found`);
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code:', error);
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=${encodeURIComponent(error.message)}`);
    }

    console.log('Session established successfully:', {
      user: data.session?.user.email,
      expiresAt: data.session?.expires_at,
    });

    const redirectUrl = new URL(`${requestUrl.origin}${redirect}`);
    redirectUrl.searchParams.set('type', 'recovery');

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Error in callback:', error);
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=Authentication failed`);
  }
}
