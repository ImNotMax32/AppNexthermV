import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const origin = requestUrl.origin;
    const redirectTo = requestUrl.searchParams.get("redirect_to");

    if (!code) {
      console.error('No code provided in callback');
      return NextResponse.redirect(`${origin}/sign-in?error=no_code`);
    }

    const supabase = await createClient();

    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error('Error exchanging code for session:', sessionError);
      return NextResponse.redirect(`${origin}/sign-in?error=auth_error`);
    }

    if (!session) {
      console.error('No session after exchange');
      return NextResponse.redirect(`${origin}/sign-in?error=no_session`);
    }

    // Vérifier si l'utilisateur existe dans la table user
    const { data: existingUser, error: userCheckError } = await supabase
      .from('user')
      .select('id')
      .eq('id', session.user.id)
      .single();

    if (!existingUser && !userCheckError) {
      // Créer l'utilisateur s'il n'existe pas
      const { error: insertError } = await supabase
        .from('user')
        .insert([
          {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          }
        ]);

      if (insertError) {
        console.error('Error creating user profile:', insertError);
      }
    }

    // Créer la réponse avec la redirection
    const response = NextResponse.redirect(redirectTo ? `${origin}${redirectTo}` : `${origin}/protected`);

    // Ajouter des headers pour éviter le cache
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error) {
    console.error('Unexpected error in callback:', error);
    return NextResponse.redirect(`${origin}/sign-in?error=unexpected`);
  }
}
