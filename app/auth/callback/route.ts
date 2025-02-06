import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const redirect = requestUrl.searchParams.get('redirect');
  const finalRedirect = redirect || next || '/protected';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      console.log('Échange du code pour une session...');
      const { data: { user }, error: authError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (authError) {
        console.error('Erreur d\'authentification:', authError);
        return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=${encodeURIComponent(authError.message)}`);
      }

      if (user) {
        console.log('Session créée avec succès pour:', user.email);
        return NextResponse.redirect(`${requestUrl.origin}${finalRedirect}`);
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=${encodeURIComponent('Une erreur est survenue')}`);
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=${encodeURIComponent('Code d\'authentification manquant')}`);
}
