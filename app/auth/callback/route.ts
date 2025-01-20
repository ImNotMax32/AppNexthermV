import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  try {
    console.log('Callback route hit');
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    
    console.log('Search params:', Object.fromEntries(searchParams.entries()));
    
    if (!code) {
      console.error('No code provided in callback');
      return NextResponse.redirect(`${origin}/sign-in?error=No_auth_code`);
    }

    const supabase = await createClient()
    console.log('Exchanging code for session...');
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${origin}/sign-in?error=Auth_error`);
    }

    if (!session) {
      console.error('No session after exchange');
      return NextResponse.redirect(`${origin}/sign-in?error=Session_error`);
    }

    console.log('Session established, user:', session.user.email);

    // Double vérification de la session
    const { data: { session: verifiedSession }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !verifiedSession) {
      console.error('Session verification failed:', sessionError);
      return NextResponse.redirect(`${origin}/sign-in?error=Session_verification_failed`);
    }

    // Vérifier si l'utilisateur existe déjà dans la table user
    const { data: existingUser, error: userCheckError } = await supabase
      .from('user')
      .select('id')
      .eq('id', session.user.id)
      .single();

    if (userCheckError) {
      console.error('Error checking existing user:', userCheckError);
    }

    if (!existingUser && !userCheckError) {
      console.log('Creating new user profile...');
      const { error: profileError } = await supabase
        .from('user')
        .insert([{ 
          id: session.user.id,
          email: session.user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (profileError) {
        console.error('Error creating user profile:', profileError);
      } else {
        console.log('User profile created successfully');
      }
    }

    // Créer la réponse avec la redirection
    const response = NextResponse.redirect(`${origin}/protected`);

    // Ajouter des cookies de session avec une durée plus longue
    response.cookies.set('supabase-auth-completed', 'true', {
      path: '/',
      maxAge: 300, // 5 minutes au lieu de 1
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    // Forcer un rafraîchissement de la session
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');

    console.log('Redirecting to protected area...');
    return response;

  } catch (error) {
    console.error('Unexpected error in callback:', error);
    return NextResponse.redirect(`${origin}/sign-in?error=Unexpected_error`);
  }
}
