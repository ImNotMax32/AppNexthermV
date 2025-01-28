import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (elementId: string, reference: string, onSuccess: () => void, onError: (error: any) => void) => {
  const element = document.getElementById(elementId);
  if (!element) {
    onError(new Error("Impossible de trouver l'élément à imprimer"));
    return;
  }

  try {
    // Ajouter une variable globale pour indiquer qu'on est en mode PDF
    (window as any).htmlToPdf = true;

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pages = element.children;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i] as HTMLElement;
      const clone = page.cloneNode(true) as HTMLElement;

      // Préserver les retours à la ligne dans les textareas
      clone.querySelectorAll('textarea').forEach(textarea => {
        const div = document.createElement('div');
        div.style.whiteSpace = 'pre-wrap';
        div.style.wordBreak = 'break-word';
        div.innerHTML = textarea.value;
        textarea.parentNode?.replaceChild(div, textarea);
      });

      // Ajouter une marge en bas du dernier élément
      const lastElement = clone.querySelector('[data-last-element]') as HTMLElement;
      if (lastElement) {
        lastElement.style.marginBottom = '0px';
      }

      // Supprimer les boutons comme avant
      clone.querySelectorAll('.delete-button, .x-button, button').forEach(el => el.remove());

      const container = document.createElement('div');
      container.appendChild(clone);
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.width = '793px';
      // Ne pas fixer la hauteur pour permettre le contenu de s'étendre
      container.style.minHeight = '1122px';
      document.body.appendChild(container);


      const contentHeight = clone.scrollHeight;
      const numberOfPages = Math.ceil(contentHeight / 1122);

      for (let j = 0; j < numberOfPages; j++) {
        if (i > 0 || j > 0) {
          pdf.addPage();
        }

        const canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 793,
          height: 1122,
          windowHeight: 1122,
          y: j * 1122
        });

        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          margin,
          margin,
          pageWidth - (margin * 2),
          pageHeight - (margin * 2)
        );

        const currentPage = i * numberOfPages + j + 1;
        const totalPages = pages.length * numberOfPages;
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128); // Gris clair
        pdf.text(
          `Page ${currentPage}/${totalPages}`,
          pageWidth - (margin / 2),
          pageHeight - (margin / 2),
          { align: 'right' }
        );
      }

      document.body.removeChild(container);
    }

    // Nettoyer la variable globale
    (window as any).htmlToPdf = false;

    pdf.save(`devis_${reference || 'sans_reference'}.pdf`);
    onSuccess();
  } catch (error) {
    // Nettoyer la variable globale même en cas d'erreur
    (window as any).htmlToPdf = false;
    console.error('Erreur lors de la génération du PDF:', error);
    onError(error);
  }
};
