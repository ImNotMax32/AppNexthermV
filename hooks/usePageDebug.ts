'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook de debug pour analyser le contenu de la page
 */
export function usePageContentDebug() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('🔍 === DEBUG PAGE CONTENT ===');
      
      // Analyser le body
      console.log('📄 Body:', {
        childrenCount: document.body.children.length,
        textLength: document.body.textContent?.trim().length || 0
      });
      
      // Analyser le main
      const mainContent = document.querySelector('main');
      if (mainContent) {
        console.log('🎯 Main content:', {
          childrenCount: mainContent.children.length,
          textLength: mainContent.textContent?.trim().length || 0,
          innerHTML: mainContent.innerHTML.substring(0, 300) + '...',
          classes: mainContent.className
        });
        
        // Analyser les enfants du main
        Array.from(mainContent.children).forEach((child, index) => {
          console.log(`📦 Main child ${index}:`, {
            tagName: child.tagName,
            classes: child.className,
            textLength: child.textContent?.trim().length || 0,
            childrenCount: child.children.length
          });
        });
      } else {
        console.log('❌ Aucun élément main trouvé');
      }
      
      // Analyser la sidebar
      const sidebar = document.querySelector('aside');
      if (sidebar) {
        console.log('📋 Sidebar:', {
          childrenCount: sidebar.children.length,
          textLength: sidebar.textContent?.trim().length || 0
        });
      }
      
      console.log('🔍 === END DEBUG ===');
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);
}

/**
 * Hook amélioré qui surveille spécifiquement le contenu principal
 * avec debug détaillé
 */
export function useSmartAutoRefresh() {
  const router = useRouter();
  const hasRefreshed = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('🔍 === SMART AUTO REFRESH CHECK ===');
      
      // Chercher spécifiquement le contenu principal
      const mainContent = document.querySelector('main');
      
      if (!mainContent) {
        console.log('❌ Aucun élément main trouvé, refresh automatique...');
        if (!hasRefreshed.current) {
          hasRefreshed.current = true;
          router.refresh();
        }
        return;
      }

      // Analyser le contenu du main
      const childrenCount = mainContent.children.length;
      const textLength = mainContent.textContent?.trim().length || 0;
      
      // Chercher des éléments spécifiques de contenu
      const cards = mainContent.querySelectorAll('div[class*="card"]');
      const containers = mainContent.querySelectorAll('div[class*="container"]');
      const buttons = mainContent.querySelectorAll('button');
      const forms = mainContent.querySelectorAll('form');
      const tables = mainContent.querySelectorAll('table');
      const headings = mainContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      const contentElementsCount = cards.length + containers.length + buttons.length + forms.length + tables.length + headings.length;
      
      console.log('📊 Main content analysis:', {
        childrenCount,
        textLength,
        cards: cards.length,
        containers: containers.length,
        buttons: buttons.length,
        forms: forms.length,
        tables: tables.length,
        headings: headings.length,
        totalContentElements: contentElementsCount,
        innerHTML: mainContent.innerHTML.substring(0, 200) + '...'
      });

      // Critères pour déterminer si la page est vide
      const hasMinimalContent = childrenCount > 0 && textLength > 50;
      const hasContentElements = contentElementsCount > 0;
      
      // Si pas de contenu minimal ET pas d'éléments de contenu
      if (!hasMinimalContent && !hasContentElements && !hasRefreshed.current) {
        console.log('🔄 Page vide détectée, refresh automatique...');
        hasRefreshed.current = true;
        router.refresh();
      } else {
        console.log('✅ Page semble avoir du contenu, pas de refresh');
      }
      
      console.log('🔍 === END SMART CHECK ===');
    }, 2500); // Attendre 2.5 secondes

    return () => clearTimeout(timeout);
  }, [router]);
}
