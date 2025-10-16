'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook pour détecter si une page ne se charge pas correctement
 * et faire un refresh automatique après 1 seconde
 * Version améliorée qui surveille spécifiquement le contenu principal
 */
export function useAutoRefreshOnEmptyContent() {
  const router = useRouter();
  const hasRefreshed = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Fonction pour vérifier si le contenu principal est vide
    const checkForEmptyMainContent = () => {
      // Attendre un peu pour que le contenu se charge
      timeoutRef.current = setTimeout(() => {
        // Chercher spécifiquement le contenu principal (motion.main)
        const mainContent = document.querySelector('main') || 
                          document.querySelector('[role="main"]') ||
                          document.querySelector('.main-content') ||
                          document.querySelector('#main-content');
        
        if (!mainContent) {
          console.log('🔄 Aucun contenu principal trouvé, refresh automatique...');
          if (!hasRefreshed.current) {
            hasRefreshed.current = true;
            router.refresh();
          }
          return;
        }

        // Vérifier si le contenu principal a du contenu significatif
        const hasSignificantContent = 
          mainContent.children.length > 0 && 
          mainContent.textContent && 
          mainContent.textContent.trim().length > 100; // Au moins 100 caractères

        // Vérifier aussi s'il y a des éléments visuels (cards, buttons, etc.)
        const hasVisualElements = mainContent.querySelectorAll(
          'div[class*="card"], button, form, table, .content, .page-content, [class*="container"]'
        ).length > 0;

        // Si pas de contenu significatif ET pas d'éléments visuels
        if (!hasSignificantContent && !hasVisualElements && !hasRefreshed.current) {
          console.log('🔄 Contenu principal vide détecté, refresh automatique...');
          console.log('📊 Debug:', {
            childrenCount: mainContent.children.length,
            textLength: mainContent.textContent?.trim().length || 0,
            visualElements: mainContent.querySelectorAll('div[class*="card"], button, form, table').length
          });
          hasRefreshed.current = true;
          
          // Refresh après 1 seconde
          setTimeout(() => {
            router.refresh();
          }, 1000);
        }
      }, 2000); // Attendre 2 secondes avant de vérifier
    };

    // Vérifier immédiatement et après un délai
    checkForEmptyMainContent();

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
 * Hook alternatif plus simple qui vérifie juste la présence d'éléments dans le main
 */
export function useSimpleAutoRefresh() {
  const router = useRouter();
  const hasRefreshed = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Chercher spécifiquement le contenu principal
      const mainContent = document.querySelector('main');
      
      if (!mainContent) {
        console.log('🔄 Aucun élément main trouvé, refresh automatique...');
        if (!hasRefreshed.current) {
          hasRefreshed.current = true;
          router.refresh();
        }
        return;
      }

      // Vérifier si le main a du contenu visible
      const hasVisibleContent = 
        mainContent.children.length > 0 && 
        mainContent.textContent && 
        mainContent.textContent.trim().length > 50;

      // Vérifier s'il y a des éléments spécifiques de contenu
      const hasContentElements = mainContent.querySelectorAll(
        'div[class*="card"], div[class*="container"], div[class*="content"], button, form, table, h1, h2, h3'
      ).length > 0;

      // Si pas de contenu visible ET pas d'éléments de contenu
      if (!hasVisibleContent && !hasContentElements && !hasRefreshed.current) {
        console.log('🔄 Contenu principal vide détecté, refresh automatique...');
        console.log('📊 Debug main content:', {
          childrenCount: mainContent.children.length,
          textLength: mainContent.textContent?.trim().length || 0,
          contentElements: mainContent.querySelectorAll('div[class*="card"], div[class*="container"], button, form, table').length,
          innerHTML: mainContent.innerHTML.substring(0, 200) + '...'
        });
        hasRefreshed.current = true;
        router.refresh();
      }
    }, 2000); // Attendre 2 secondes

    return () => clearTimeout(timeout);
  }, [router]);
}
