import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const origin = requestUrl.origin;
    const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

    if (!code) {
      console.error('No code provided in callback');
      return NextResponse.redirect(`${origin}/sign-in?error=No_auth_code`);
    }

    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError || !session) {
      console.error('Error exchanging code for session:', sessionError);
      return NextResponse.redirect(`${origin}/sign-in?error=Auth_error`);
    }

    // Vérifier si l'utilisateur existe déjà dans la table user
    const { data: existingUser, error: userCheckError } = await supabase
      .from('user')
      .select('id')
      .eq('id', session.user.id)
      .single();

    if (!existingUser && !userCheckError) {
      // L'utilisateur n'existe pas encore, on le crée
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
        // On continue quand même car l'authentification a réussi
      }
    }

    // Vérifier que la session est bien active
    const { data: { session: currentSession }, error: sessionCheckError } = await supabase.auth.getSession();
    
    if (!currentSession || sessionCheckError) {
      console.error('Session check failed:', sessionCheckError);
      return NextResponse.redirect(`${origin}/sign-in?error=Session_error`);
    }

    // Tout est bon, on redirige vers la destination souhaitée
    if (redirectTo) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }

    return NextResponse.redirect(`${origin}/protected`);
  } catch (error) {
    console.error('Unexpected error in callback:', error);
    return NextResponse.redirect(`${origin}/sign-in?error=Unexpected_error`);
  }
}
