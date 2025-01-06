
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (elementId: string, reference: string, onSuccess: () => void, onError: (error: any) => void) => {
  const element = document.getElementById(elementId);
  if (!element) {
    onError(new Error("Impossible de trouver l'élément à imprimer"));
    return;
  }

  try {
    // Créer le PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Récupérer toutes les pages
    const pages = element.children;
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i] as HTMLElement;
      
      // Créer une copie de la page pour la manipulation
      const clone = page.cloneNode(true) as HTMLElement;
      
      // Supprimer les éléments interactifs
      clone.querySelectorAll('.delete-button, .x-button, button').forEach(el => el.remove());
      
      // Créer un conteneur temporaire hors écran avec les mêmes dimensions que l'original
      const container = document.createElement('div');
      container.appendChild(clone);
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.width = page.offsetWidth + 'px';
      container.style.height = page.offsetHeight + 'px';
      document.body.appendChild(container);

      // Configurer les options de html2canvas
      const canvas = await html2canvas(clone, {
        scale: 2, // Meilleure qualité
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: page.offsetWidth,
        height: page.offsetHeight
      });

      // Supprimer le conteneur temporaire
      document.body.removeChild(container);

      // Calculer les dimensions pour ajuster l'image au format A4
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Ajouter l'image au PDF
      const imgData = canvas.toDataURL('image/png');
      
      // Si ce n'est pas la première page, ajouter une nouvelle page
      if (i > 0) {
        pdf.addPage();
      }
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    }

    // Sauvegarder le PDF
    pdf.save(`devis_${reference || 'sans_reference'}.pdf`);

    onSuccess();
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    onError(error);
  }
};
