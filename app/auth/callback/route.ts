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
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Laisser le client gérer l'échange du code
    // Le middleware s'occupera du code verifier
    await supabase.auth.exchangeCodeForSession(code);

    // Rediriger vers la page finale
    return NextResponse.redirect(`${requestUrl.origin}${finalRedirect}`);
  } catch (error) {
    console.error('Error in callback:', error);
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=Authentication failed`);
  }
}
