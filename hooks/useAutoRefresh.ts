'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook pour détecter si une page ne se charge pas correctement
 * et faire un refresh automatique après 1 seconde
 */
export function useAutoRefreshOnEmptyContent() {
  const router = useRouter();
  const hasRefreshed = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Fonction pour vérifier si le contenu est vide
    const checkForEmptyContent = () => {
      // Attendre un peu pour que le contenu se charge
      timeoutRef.current = setTimeout(() => {
        // Vérifier si le body principal est vide ou ne contient que la sidebar
        const mainContent = document.querySelector('main') || 
                          document.querySelector('[role="main"]') ||
                          document.querySelector('.main-content') ||
                          document.querySelector('#main-content');
        
        // Si pas de contenu principal trouvé, chercher dans le body
        const bodyContent = document.body;
        const hasContent = mainContent ? 
          mainContent.children.length > 0 && 
          mainContent.textContent && 
          mainContent.textContent.trim().length > 50 : // Au moins 50 caractères de contenu
          bodyContent.children.length > 2 && // Plus que juste la sidebar et header
          bodyContent.textContent && 
          bodyContent.textContent.trim().length > 100; // Au moins 100 caractères de contenu

        // Si pas de contenu et qu'on n'a pas encore refreshé
        if (!hasContent && !hasRefreshed.current) {
          console.log('🔄 Contenu vide détecté, refresh automatique dans 1 seconde...');
          hasRefreshed.current = true;
          
          // Refresh après 1 seconde
          setTimeout(() => {
            router.refresh();
          }, 1000);
        }
      }, 1000); // Attendre 1 seconde avant de vérifier
    };

    // Vérifier immédiatement et après un délai
    checkForEmptyContent();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [router]);

  // Reset le flag si on change de page
  useEffect(() => {
    hasRefreshed.current = false;
  }, []);
}

/**
 * Hook alternatif plus simple qui vérifie juste la présence d'éléments
 */
export function useSimpleAutoRefresh() {
  const router = useRouter();
  const hasRefreshed = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Vérifier si on a du contenu visible
      const visibleElements = document.querySelectorAll('main, [role="main"], .content, .page-content');
      const hasVisibleContent = Array.from(visibleElements).some(el => 
        el.children.length > 0 && 
        el.textContent && 
        el.textContent.trim().length > 20
      );

      // Si pas de contenu visible et pas encore refreshé
      if (!hasVisibleContent && !hasRefreshed.current) {
        console.log('🔄 Aucun contenu visible détecté, refresh automatique...');
        hasRefreshed.current = true;
        router.refresh();
      }
    }, 1500); // Attendre 1.5 seconde

    return () => clearTimeout(timeout);
  }, [router]);
}
