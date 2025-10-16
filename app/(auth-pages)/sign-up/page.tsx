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
import { toast } from 'sonner';
import Image from 'next/image';

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

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        toast.error(error.message);
        return;
      }

      toast.success('Vérifiez votre email pour confirmer votre compte');
      router.push('/sign-in');
    } catch (error) {
      setError('Une erreur est survenue lors de l\'inscription');
      toast.error('Une erreur est survenue lors de l\'inscription');
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
    <div className="min-h-[95dvh] flex flex-col justify-between bg-white">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-[#333333] mb-2">
              Inscription
            </h2>
            <div className="w-32 h-1.5 bg-[#86BC29] rounded-full mx-auto mb-3"></div>
            <p className="text-lg text-gray-600 mb-6">
              Créez votre compte Nextherm
            </p>
          </div>
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
              </div>
            </div>

            {error && <FormMessage message={{ error }} type="error" />}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="space-y-4">
                <Button
                  type="submit"
                  className="w-full flex justify-center items-center py-4 px-8 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-[#86BC29] hover:bg-[#75a625] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#86BC29] transition-all duration-300"
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
                  className="w-full py-3 text-lg flex items-center justify-center"
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

            <div className="text-center mt-6">
              <Link
                href="/sign-in"
                className="text-base text-gray-600 hover:text-[#86BC29] hover:underline transition-colors"
              >
                Déjà un compte ? Connectez-vous
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}