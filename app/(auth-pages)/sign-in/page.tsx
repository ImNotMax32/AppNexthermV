'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormMessage, Message } from '@/components/form-message';
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';
import { toast } from 'sonner';

// Ne pas exporter ce composant, le garder interne au fichier
function LoginForm() {
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
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      toast.error(error.message);
      setIsLoading(false);
      return;
    }
    
    toast.success('Connexion réussie');

    router.push(redirect || '/protected');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Votre formulaire existant */}
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
        <div className="flex justify-between items-center">
          <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Mot de passe
          </Label>
          <Link className="text-xs text-[#86BC29] hover:text-[#75a625] underline" href="/forgot-password">
            Mot de passe oublié ?
          </Link>
        </div>
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
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
              Chargement...
            </>
          ) : (
            'Se connecter'
          )}
        </Button>
      </motion.div>

      <Link
        href={`/sign-up${redirect ? `?redirect=${redirect}` : ''}`}
        className="w-full flex justify-center mt-4 py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#86BC29] transition-colors duration-200"
      >
        Créer un compte
      </Link>

      <div className="flex flex-col space-y-2 text-center text-sm text-muted-foreground mt-4">
        <Link href="/confidentialite" className="hover:underline">
          Politique de confidentialité
        </Link>
        <Link href="/mentions-legales" className="hover:underline">
          Mentions légales
        </Link>
      </div>
    </form>
  );
}

// Seul export autorisé : le default export de la page
export default function Page() {
  return (
    <div className="min-h-[70dvh] flex flex-col justify-between bg-white">
      <div className="container mx-auto max-w-screen-lg flex-1 flex flex-col justify-center py-8 px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="flex justify-center">
            <Link href="/" className="inline-flex items-center space-x-4 group">
              <motion.img 
                transition={{ duration: 0.3 }}
                src="assets/img/X.png"
                alt="Nextherm Logo"
                className="h-12 w-12 object-contain mr-3"
              />
              <div className="flex items-center space-x-2">
                <span className="text-4xl font-bold text-gray-900">Nextherm</span>
                <span className="text-4xl font-medium" style={{ color: '#86BC29' }}>Applications</span>
              </div>
            </Link>
          </div>
          <h2 className="mt-12 text-center text-3xl font-extrabold text-gray-900">
            Connexion à votre compte
          </h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 mx-auto w-full max-w-md bg-white p-6 sm:p-8"
        >
          <Suspense 
            fallback={
              <div className="flex justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-[#86BC29]" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}