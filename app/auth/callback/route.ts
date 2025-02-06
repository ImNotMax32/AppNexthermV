import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { parseSupabaseUrl } from '@/utils/supabase-url';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const parsedUrl = parseSupabaseUrl(request.url);
  const params = new URL(parsedUrl).searchParams;
  
  // Récupère les paramètres de l'URL parsée
  const code = params.get('code');
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  const type = params.get('type');
  const next = params.get('next');
  const redirect = params.get('redirect');
  const finalRedirect = redirect || next || '/protected';

  console.log('URL parameters:', { code, access_token, refresh_token, type, next, redirect });

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    if (access_token && refresh_token) {
      // Si nous avons des tokens, les utiliser directement
      console.log('Setting session with tokens...');
      await supabase.auth.setSession({
        access_token,
        refresh_token
      });
      return NextResponse.redirect(`${requestUrl.origin}${finalRedirect}`);
    } else if (code) {
      // Sinon, échanger le code contre une session
      console.log('Exchanging code for session...');
      const { data: { user }, error: authError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (authError) {
        console.error('Auth error:', authError);
        return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=${encodeURIComponent(authError.message)}`);
      }

      if (user) {
        console.log('Session created for:', user.email);
        return NextResponse.redirect(`${requestUrl.origin}${finalRedirect}`);
      }
    }

    console.error('No authentication parameters found');
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=Invalid authentication parameters`);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=${encodeURIComponent('An unexpected error occurred')}`);
  }
}
