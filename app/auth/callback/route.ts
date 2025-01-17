import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/protected'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Vérifier que la session est bien établie
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (session) {
        // Créer la réponse avec la redirection
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        let redirectUrl: string
        if (isLocalEnv) {
          redirectUrl = `${origin}${next}`
        } else if (forwardedHost) {
          redirectUrl = `https://${forwardedHost}${next}`
        } else {
          redirectUrl = `${origin}${next}`
        }

        const response = NextResponse.redirect(redirectUrl)

        // Ajouter le cookie à la réponse
        response.cookies.set('supabase-auth-completed', 'true', {
          path: '/',
          maxAge: 60, // 1 minute
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })

        return response
      }
    }
  }

  // En cas d'erreur, rediriger vers la page de connexion
  return NextResponse.redirect(`${origin}/sign-in?error=auth-code-error`)
}
