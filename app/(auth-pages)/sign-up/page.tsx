'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormMessage } from '@/components/form-message';
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';

// Composant principal
export default function SignUp() {
  return (
    <Suspense fallback={<SignUpSkeleton />}>
      <SignUpContent />
    </Suspense>
  );
}

// Composant de chargement
function SignUpSkeleton() {
  return (
    <div className="min-h-[70dvh] flex flex-col justify-between bg-white">
      <div className="flex-1 flex flex-col justify-center py-12 px- sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse" />
              <div className="flex items-center space-x-2">
                <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
          <div className="mt-8 h-8 w-48 mx-auto bg-gray-200 rounded-lg animate-pulse" />
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="space-y-6">
            <div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-10 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-10 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="h-10 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant de contenu
function SignUpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
  
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    const supabase = createClient();
    
    try {
      // 1. Vérifier si l'email existe déjà en essayant de se connecter
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      // Si la connexion réussit, cela signifie que l'email existe et le mot de passe est correct
      if (signInData?.user) {
        // Vérifier si l'utilisateur existe dans la table user
        const { data: existingUser } = await supabase
          .from('user')
          .select()
          .eq('id', signInData.user.id)
          .single();

        if (!existingUser) {
          // Créer l'entrée dans la table user si elle n'existe pas
          const { error: profileError } = await supabase
            .from('user')
            .insert([{ 
              id: signInData.user.id,
              email: email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);

          if (profileError) {
            setError(profileError.message);
            setIsLoading(false);
            return;
          }
        }

        router.push(redirect || '/');
        return;
      }

      // Si nous arrivons ici, soit l'email n'existe pas, soit le mot de passe est incorrect
      // Dans les deux cas, nous essayons de créer un nouvel utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback${redirect ? `?redirect=${redirect}` : ''}`,
        },
      });
    
      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }
    
      if (authData.user) {
        setError(null);
        setIsLoading(false);
        router.push(`/auth/check-email?email=${encodeURIComponent(email)}`);
        return;
      }

      router.push('/sign-in?message=Vérifiez vos emails pour confirmer votre inscription');
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err);
      setError('Une erreur est survenue lors de l\'inscription');
      setIsLoading(false);
    }
  }
  return (
    <div className="min-h-[70dvh] flex flex-col justify-between bg-white">
      <div className="flex-1 flex flex-col justify-center py-12 px- sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="flex justify-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.img 
                transition={{ duration: 0.3 }}
                src="assets/img/X.png"
                alt="Nextherm Logo"
                className="h-12 w-12 object-contain"
              />
              <div className="flex items-center space-x-2">
                <span className="text-4xl font-bold text-gray-900">Nextherm</span>
                <span className="text-4xl font-medium" style={{ color: '#86BC29' }}>Applications</span>
              </div>
            </Link>
          </div>
          <h2 className="mt-8 text-center text-3xl font-extrabold text-gray-900">
            Créer un compte
          </h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={50}
                  className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#86BC29] focus:border-[#86BC29] focus:z-10 sm:text-sm"
                  placeholder="Entrez votre email"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </Label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={8}
                  maxLength={100}
                  className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#86BC29] focus:border-[#86BC29] focus:z-10 sm:text-sm"
                  placeholder="Entrez votre mot de passe"
                />
              </div>
            </motion.div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg 
                      className="h-5 w-5 text-red-500" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {error === 'Invalid login credentials' ? 'Identifiants invalides' : error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#86BC29] hover:bg-[#75a625] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#86BC29] transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Création en cours...
                  </>
                ) : (
                  'Créer un compte'
                )}
              </Button>
            </motion.div>
            <div className="flex flex-col space-y-2 text-center text-sm text-muted-foreground mt-4">
              <Link href="/confidentialite" className="hover:underline">
                Politique de confidentialité
              </Link>
              <Link href="/mentions-legales" className="hover:underline">
                Mentions légales
              </Link>
            </div>
          </form>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-6"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Déjà inscrit ?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href={`/sign-in${redirect ? `?redirect=${redirect}` : ''}`}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#86BC29] transition-colors duration-200"
              >
                Se connecter
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}