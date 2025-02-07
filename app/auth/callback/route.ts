import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const redirect = requestUrl.searchParams.get('redirect') || '/protected';

  try {
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

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      console.error('No session found after redirection:', error);
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=No session found`);
    }

    console.log('Session retrieved successfully:', {
      user: session.user.email,
      expiresAt: session.expires_at,
    });

    const redirectUrl = new URL(`${requestUrl.origin}${redirect}`);
    redirectUrl.searchParams.set('type', 'recovery');

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Error in callback:', error);
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=Authentication failed`);
  }
}
