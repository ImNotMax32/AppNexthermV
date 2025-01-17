import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

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
        // Définir un cookie pour indiquer que l'authentification est réussie
        const cookieStore = cookies()
        cookieStore.set('supabase-auth-completed', 'true', {
          path: '/',
          maxAge: 60, // 1 minute
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })

        // Rediriger vers la page protégée
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      }
    }
  }

  // En cas d'erreur, rediriger vers la page de connexion
  return NextResponse.redirect(`${origin}/sign-in?error=auth-code-error`)
}
