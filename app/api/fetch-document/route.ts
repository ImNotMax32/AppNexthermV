import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { documentUrl } = await request.json();
    
    if (!documentUrl) {
      return NextResponse.json({ error: 'URL de document non fournie' }, { status: 400 });
    }

    console.log(`Récupération du document depuis: ${documentUrl}`);
    
    // Télécharger le document depuis l'URL
    const response = await axios.get(documentUrl, {
      responseType: 'arraybuffer',
      headers: {
        // En-têtes pour simuler une requête de navigateur
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/pdf'
      },
      // Augmenter le timeout pour les documents volumineux
      timeout: 10000
    });

    // Vérifier que nous avons bien reçu un PDF
    const contentType = response.headers['content-type'];
    if (contentType && !contentType.includes('pdf') && !contentType.includes('octet-stream')) {
      console.warn(`Type de contenu non PDF: ${contentType}`);
    }
    
    // Convertir le document en base64
    const base64Document = Buffer.from(response.data).toString('base64');
    
    // Créer un data URI complet pour l'utilisation directe en pièce jointe
    const dataUri = `data:application/pdf;base64,${base64Document}`;
    
    return NextResponse.json({ success: true, documentBase64: dataUri });
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération du document', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
