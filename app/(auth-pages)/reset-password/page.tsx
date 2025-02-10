'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormMessage, Message } from '@/components/form-message';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';
import { store, memoryLocalStorageAdapter } from '@/utils/store';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Message | null>(null);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setIsRecovery(searchParams.get('type') === 'recovery');
    console.log(searchParams.get('type'));
  }, []);

  console.log(isRecovery);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            flowType: 'pkce',
            detectSessionInUrl: true,
            autoRefreshToken: false,
            persistSession: true,
            storage: memoryLocalStorageAdapter(store),
          }
        }
      );
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/reset-password&type=recovery`,
      });

      if (error) {
        setError({ error: error.message });
        toast.error(error.message);
        return;
      }

      setSuccess(true);
      toast.success('Un email de réinitialisation a été envoyé à votre adresse');
    } catch (error) {
      setError({ error: 'Une erreur est survenue' });
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePasswordReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const password = formData.get('password') as string;

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            flowType: 'pkce',
            detectSessionInUrl: true,
            autoRefreshToken: false,
            persistSession: true,
            storage: memoryLocalStorageAdapter(store),
          }
        }
      );

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError({ error: error.message });
        toast.error(error.message);
        return;
      }

      setSuccess(true);
      toast.success('Mot de passe mis à jour avec succès');
      setTimeout(() => router.push('/'), 2000);
    } catch (error) {
      setError({ error: 'Une erreur est survenue' });
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {isRecovery ? 'Nouveau mot de passe' : 'Réinitialisation du mot de passe'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRecovery
              ? 'Entrez votre nouveau mot de passe'
              : 'Entrez votre adresse email pour recevoir un lien de réinitialisation'}
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <p className="text-center text-green-600">
              {isRecovery
                ? 'Votre mot de passe a été modifié avec succès.'
                : 'Un email de réinitialisation a été envoyé. Veuillez vérifier votre boîte de réception.'}
            </p>
            <Button
              className="w-full"
              onClick={() => router.push('/sign-in')}
            >
              Retour à la connexion
            </Button>
          </div>
        ) : isRecovery ? (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="w-full"
                minLength={6}
              />
            </div>
            {error && <FormMessage type="error" message={error} />}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Changer le mot de passe
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="exemple@email.com"
                required
                className="w-full"
              />
            </div>
            {error && <FormMessage type="error" message={error} />}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer le lien de réinitialisation
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push('/sign-in')}
            >
              Retour à la connexion
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
