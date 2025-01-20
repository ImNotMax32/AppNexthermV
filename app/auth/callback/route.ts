import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirect = requestUrl.searchParams.get('redirect') || '/protected';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      const { data: { user }, error: authError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (authError) {
        console.error('Erreur d\'authentification:', authError);
        return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=${encodeURIComponent(authError.message)}`);
      }

      if (user) {
        // Vérifier si l'utilisateur existe déjà dans la table user
        const { data: existingUser, error: userError } = await supabase
          .from('user')
          .select()
          .eq('id', user.id)
          .single();

        if (userError && userError.code !== 'PGRST116') { // PGRST116 = not found
          console.error('Erreur lors de la vérification de l\'utilisateur:', userError);
        }

        if (!existingUser) {
          // Créer l'entrée dans la table user
          const { error: insertError } = await supabase
            .from('user')
            .insert([{
              id: user.id,
              email: user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              full_name: user.user_metadata?.full_name || null,
              avatar_url: user.user_metadata?.avatar_url || null
            }]);

          if (insertError) {
            console.error('Erreur lors de la création du profil:', insertError);
          }
        } else {
          // Mettre à jour les informations de l'utilisateur si nécessaire
          const { error: updateError } = await supabase
            .from('user')
            .update({
              updated_at: new Date().toISOString(),
              full_name: user.user_metadata?.full_name || existingUser.full_name,
              avatar_url: user.user_metadata?.avatar_url || existingUser.avatar_url
            })
            .eq('id', user.id);

          if (updateError) {
            console.error('Erreur lors de la mise à jour du profil:', updateError);
          }
        }
      }

      return NextResponse.redirect(`${requestUrl.origin}${redirect}`);
    } catch (error) {
      console.error('Erreur inattendue:', error);
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=${encodeURIComponent('Une erreur est survenue')}`);
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=${encodeURIComponent('Code d\'authentification manquant')}`);
}
