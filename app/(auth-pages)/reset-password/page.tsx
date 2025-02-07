'use client';

import { useState } from 'react';
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
            flowType: 'implicit',
            detectSessionInUrl: true,
            autoRefreshToken: false,
            persistSession: true,
            // storage: memoryLocalStorageAdapter(store),
            storage: localStorage,
          }
        }
      );
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/sign-in&type=recovery`,
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Réinitialisation du mot de passe
          </h1>
          <p className="text-sm text-muted-foreground">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <p className="text-center text-green-600">
              Un email de réinitialisation a été envoyé. Veuillez vérifier votre boîte de réception.
            </p>
            <Button
              className="w-full"
              onClick={() => router.push('/sign-in')}
            >
              Retour à la connexion
            </Button>
          </div>
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
