'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook spécialement conçu pour la page comparatif
 * qui vérifie si le contenu spécifique de la page est présent
 */
export function useComparatifAutoRefresh() {
  const router = useRouter();
  const hasRefreshed = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('🔍 === COMPARATIF AUTO REFRESH CHECK ===');
      
      // Chercher des éléments spécifiques à la page comparatif
      const comparatifTitle = document.querySelector('h1, h2, h3')?.textContent?.toLowerCase();
      const hasComparatifContent = comparatifTitle?.includes('comparatif') || 
                                  comparatifTitle?.includes('solutions') ||
                                  comparatifTitle?.includes('produit');
      
      // Chercher le sélecteur de produit (élément clé de la page)
      const productSelector = document.querySelector('[class*="select"], [class*="dropdown"], button[class*="product"]');
      
      // Chercher des cards ou conteneurs de contenu
      const contentCards = document.querySelectorAll('div[class*="card"], div[class*="container"], div[class*="content"]');
      
      // Chercher des boutons spécifiques à la page
      const actionButtons = document.querySelectorAll('button');
      const hasActionButtons = actionButtons.length > 5; // Plus que juste la navigation
      
      console.log('📊 Comparatif content analysis:', {
        hasComparatifTitle: !!hasComparatifContent,
        comparatifTitle: comparatifTitle,
        hasProductSelector: !!productSelector,
        contentCardsCount: contentCards.length,
        actionButtonsCount: actionButtons.length,
        hasActionButtons: hasActionButtons
      });

      // Critères spécifiques pour la page comparatif
      const hasPageContent = hasComparatifContent || 
                           (productSelector && contentCards.length > 0) ||
                           (contentCards.length > 2 && hasActionButtons);
      
      if (!hasPageContent && !hasRefreshed.current) {
        console.log('🔄 Page comparatif vide détectée, refresh automatique...');
        hasRefreshed.current = true;
        router.refresh();
      } else {
        console.log('✅ Page comparatif semble avoir du contenu, pas de refresh');
      }
      
      console.log('🔍 === END COMPARATIF CHECK ===');
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);
}

/**
 * Hook spécialement conçu pour la page fichiers sauvegardés
 */
export function useSavedFilesAutoRefresh() {
  const router = useRouter();
  const hasRefreshed = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('🔍 === SAVED FILES AUTO REFRESH CHECK ===');
      
      // Chercher des éléments spécifiques à la page fichiers sauvegardés
      const savedFilesTitle = document.querySelector('h1, h2, h3')?.textContent?.toLowerCase();
      const hasSavedFilesContent = savedFilesTitle?.includes('sauvegard') || 
                                  savedFilesTitle?.includes('fichier') ||
                                  savedFilesTitle?.includes('projet');
      
      // Chercher des tables ou listes de fichiers
      const fileTables = document.querySelectorAll('table, [class*="table"], [class*="list"]');
      
      // Chercher des boutons d'action spécifiques
      const actionButtons = document.querySelectorAll('button');
      const hasFileActions = Array.from(actionButtons).some(btn => 
        btn.textContent?.toLowerCase().includes('ouvrir') ||
        btn.textContent?.toLowerCase().includes('supprimer') ||
        btn.textContent?.toLowerCase().includes('télécharger')
      );
      
      console.log('📊 Saved files content analysis:', {
        hasSavedFilesTitle: !!hasSavedFilesContent,
        savedFilesTitle: savedFilesTitle,
        fileTablesCount: fileTables.length,
        actionButtonsCount: actionButtons.length,
        hasFileActions: hasFileActions
      });

      // Critères spécifiques pour la page fichiers sauvegardés
      const hasPageContent = hasSavedFilesContent || 
                           (fileTables.length > 0) ||
                           (actionButtons.length > 3 && hasFileActions);
      
      if (!hasPageContent && !hasRefreshed.current) {
        console.log('🔄 Page fichiers sauvegardés vide détectée, refresh automatique...');
        hasRefreshed.current = true;
        router.refresh();
      } else {
        console.log('✅ Page fichiers sauvegardés semble avoir du contenu, pas de refresh');
      }
      
      console.log('🔍 === END SAVED FILES CHECK ===');
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);
}
