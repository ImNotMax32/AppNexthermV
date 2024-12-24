'use client';

import { Mail } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { useState, Suspense } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

// Composant principal qui utilise useSearchParams
function CheckEmailContent() {
  const [isResending, setIsResending] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("Email non trouvé. Veuillez réessayer de vous inscrire.");
      return;
    }

    setIsResending(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        toast.error("Erreur lors de l'envoi de l'email : " + error.message);
      } else {
        toast.success("Un nouvel email de confirmation a été envoyé !");
      }
    } catch (err) {
      toast.error("Une erreur est survenue lors de l'envoi de l'email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[70dvh] flex flex-col justify-between bg-white">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6"
          >
            {/* Icône et titre */}
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#86BC29]/10">
                <Mail className="h-6 w-6 text-[#86BC29]" aria-hidden="true" />
              </div>
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 text-2xl font-bold tracking-tight text-gray-900"
              >
                Vérifiez votre email
              </motion.h2>
            </div>

            {/* Message détaillé */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center space-y-4"
            >
              <p className="text-sm text-gray-500">
                Un email de confirmation vient d'être envoyé à{' '}
                <span className="font-medium text-gray-900">{email}</span>.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Pour finaliser votre inscription, veuillez :</p>
                <ol className="list-decimal list-inside space-y-1 text-left pl-4">
                  <li>Ouvrir l'email de confirmation</li>
                  <li>Cliquer sur le lien de vérification</li>
                  <li>Revenir sur cette page et cliquer sur "Retour à la connexion"</li>
                  <li>Vous connecter avec vos identifiants</li>
                </ol>
              </div>
              <p className="text-sm text-gray-500 pt-2">
                Si vous ne trouvez pas l'email, vérifiez votre dossier spam.
              </p>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 space-y-4"
            >
              <Button
                variant="outline"
                className="w-full rounded-full border-[#86BC29] text-[#86BC29] hover:bg-[#86BC29]/10"
                onClick={handleResendEmail}
                disabled={isResending || !email}
              >
                {isResending ? (
                  <>
                    <Mail className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Renvoyer l'email"
                )}
              </Button>
              <Button
                asChild
                className="w-full rounded-full bg-[#86BC29] text-white hover:bg-[#86BC29]/90"
              >
                <Link href="/sign-in">
                  Retour à la connexion
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Composant de chargement
function LoadingState() {
  return (
    <div className="min-h-[70dvh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#86BC29]"></div>
    </div>
  );
}

// Export par défaut qui enveloppe le contenu dans Suspense
export default function CheckEmail() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CheckEmailContent />
    </Suspense>
  );
}
