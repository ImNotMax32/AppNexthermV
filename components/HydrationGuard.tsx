'use client';

import { useEffect, useState } from 'react';

/**
 * Composant de chargement qui s'affiche pendant l'hydratation
 * pour éviter les pages blanches sur Vercel
 */
export function HydrationGuard({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Marquer comme hydraté après le premier rendu côté client
    setIsHydrated(true);
  }, []);

  // Pendant l'hydratation, afficher un loader
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#86BC29] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement...</p>
          <p className="text-gray-500 text-sm mt-2">Préparation de la page</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Hook pour détecter si l'hydratation est terminée
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
