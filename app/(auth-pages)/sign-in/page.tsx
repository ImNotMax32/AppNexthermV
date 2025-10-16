'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormMessage, Message } from '@/components/form-message';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState<number | null>(null);

  // Nettoyer le timer si le composant est démonté
  useEffect(() => {
    return () => {
      if (redirectTimer !== null) {
        clearTimeout(redirectTimer);
      }
    };
  }, [redirectTimer]);

  useEffect(() => {
    const errorCode = searchParams.get('error');
    if (errorCode) {
      switch (errorCode) {
        case 'unauthorized':
          setError('Votre session a expiré. Veuillez vous reconnecter.');
          break;
        case 'invalid_request':
          setError('Requête invalide. Veuillez réessayer.');
          break;
        default:
          setError('Une erreur est survenue. Veuillez réessayer.');
      }
    }
  }, [searchParams]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        toast.error(error.message);
        return;
      }

      // Marquer la connexion comme réussie
      setLoginSuccess(true);
      toast.success('Connexion réussie');
      
      // Redirection immédiate
      router.refresh();
      router.push(redirect || '/protected');
      
      // Si pas de redirection après 3 secondes, rafraîchir la page
      const timer = window.setTimeout(() => {
        // Vérifier si nous sommes toujours sur la page de connexion
        if (window.location.pathname.includes('/sign-in')) {
          console.log('Redirection automatique après délai...');
          window.location.href = redirect || '/protected';
        }
      }, 3000);
      
      setRedirectTimer(timer as unknown as number);
      
    } catch (error) {
      setError('Une erreur est survenue lors de la connexion');
      toast.error('Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setIsLoading(true);
      setError(null);
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        setError(error.message);
        toast.error(error.message);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Erreur de connexion avec Google:', err);
      setError('Une erreur est survenue lors de la connexion avec Google');
      toast.error('Une erreur est survenue lors de la connexion avec Google');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base font-medium">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="exemple@email.com"
            required
            className="w-full px-5 py-4 text-lg border rounded-md"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-base font-medium">Mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="w-full px-5 py-4 text-lg border rounded-md"
          />
          <div className="text-sm text-right">
            <Link href="/reset-password" className="text-primary hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
        </div>
      </div>

      {error && <FormMessage type="error" message={{ error: error }} />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="space-y-4">
          <Button
            type="submit"
            className="w-full flex justify-center items-center py-4 px-8 border border-transparent rounded-full shadow-sm text-lg font-medium text-white bg-[#86BC29] hover:bg-[#75a625] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#86BC29] transition-colors duration-200"
            disabled={isLoading || loginSuccess}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Chargement...
              </>
            ) : loginSuccess ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Redirection...
              </>
            ) : (
              'Se connecter'
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continuer avec
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full py-4 px-8 text-lg"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Image
                src="/google.svg"
                alt="Google"
                width={20}
                height={20}
                className="mr-2"
              />
            )}
            Google
          </Button>
        </div>
      </motion.div>
      
      {/* Section inscription supprimée car doublon avec la partie droite */}
    </form>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-[95dvh] bg-white">
      <div className="flex flex-col md:flex-row min-h-[95dvh] max-w-6xl mx-auto">
        {/* Colonne gauche - Section connexion */}
        <div className="md:w-1/2 flex flex-col justify-center items-center py-12 px-4 sm:px-6 md:px-12 lg:px-16 relative">
          <div className="pt-4 max-w-md mx-auto w-full">
            {/* Pas de logo - supprimé */}
            
            {/* Titre principal de la connexion */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-[#333333] mb-2">
                Connexion
              </h2>
              <div className="w-32 h-1.5 bg-[#86BC29] rounded-full mx-auto mb-3"></div>
              <p className="text-lg text-gray-600 mb-6">
                Utilisateurs déjà inscrits
              </p>
            </div>
            
            <Suspense
              fallback={
                <div className="flex justify-center">
                  <Loader2 className="animate-spin h-8 w-8 text-[#86BC29]" />
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
          
          {/* Barre verticale de séparation */}
          <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 h-4/5 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
        </div>
        
        {/* Colonne droite - Section inscription */}
        <div className="md:w-1/2 bg-[#f5fbea] flex flex-col justify-center items-center p-8 md:p-12 shadow-inner">
          <div className="pt-4 max-w-xs mx-auto w-full text-center space-y-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#333333] mb-2">Inscription</h2>
              <div className="w-32 h-1.5 bg-[#86BC29] rounded-full mx-auto mb-3"></div>
              <p className="text-gray-600 mb-6 text-lg">Nouveaux utilisateurs</p>
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link 
                  href="/sign-up"
                  className="inline-flex items-center justify-center w-full px-8 py-4 text-lg font-medium text-white bg-[#86BC29] rounded-lg shadow-md hover:shadow-lg hover:bg-[#75a625] transition-all duration-300"
                >
                  S'inscrire gratuitement
                </Link>
              </motion.div>
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Avantages de l'inscription :</h3>
              <ul className="text-base text-gray-600 text-left space-y-4">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-[#86BC29] mr-3" /> Sauvegardez vos projets
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-[#86BC29] mr-3" /> Accédez aux analyses comparatives
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-[#86BC29] mr-3" /> Générez des rapports PDF
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-[#86BC29] mr-3" /> Contactez un conseiller
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}