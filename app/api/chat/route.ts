import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Contexte pour l'IA
const systemContext = `
Tu es l'assistant virtuel de Nextherm, une entreprise spécialisée dans les solutions de chauffage écologiques, notamment la géothermie et l'aérothermie.

DIFFÉRENCE ENTRE GÉOTHERMIE ET AÉROTHERMIE:
- La géothermie capte la chaleur du sol via des capteurs enterrés (capteurs horizontaux ou sondes verticales). Elle fonctionne avec un fluide caloporteur qui circule dans ces capteurs et transmet la chaleur à une pompe à chaleur. La géothermie n'utilise PAS de ventilateurs extérieurs.
- L'aérothermie capte la chaleur de l'air extérieur via une unité extérieure équipée d'un ventilateur. Elle est plus simple à installer mais généralement moins efficace par temps très froid.

CARACTÉRISTIQUES TECHNIQUES:
- La géothermie présente un COP (Coefficient de Performance) généralement entre 4 et 5.
- L'aérothermie a un COP qui varie davantage selon la température extérieure, typiquement entre 3 et 4.5.
- La géothermie nécessite des travaux de terrassement importants mais offre une durée de vie plus longue (environ 50 ans pour les capteurs).
- L'aérothermie est moins coûteuse à l'installation mais a une durée de vie plus limitée (15-20 ans).

Adapte tes réponses en fonction du système concerné et évite de confondre les deux technologies. Sois précis et technique dans tes explications tout en restant pédagogue.
`;

// Fonction pour charger les produits depuis le fichier JSON
async function loadProducts(): Promise<any> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'products.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Erreur lors du chargement des produits:", error);
    return { products: [] };
  }
}

// Fonction pour charger le guide d'installation
async function loadInstallationGuide(guideURL: string): Promise<string> {
  try {
    if (!guideURL) return "";
    
    // Enlever le "/" initial s'il existe
    const relativePath = guideURL.startsWith('/') ? guideURL.substring(1) : guideURL;
    const filePath = path.join(process.cwd(), 'public', relativePath);
    
    if (!fs.existsSync(filePath)) {
      console.error(`Le guide d'installation ${filePath} n'existe pas`);
      return "";
    }
    
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error("Erreur lors du chargement du guide d'installation:", error);
    return "";
  }
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API Key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const { message, threadId, productId, powerOption } = await req.json() as { 
      message: string;
      threadId: string | null;
      productId: string | null;
      powerOption?: string | null;
    };

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Créer un modèle Gemini avec configuration de sécurité
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Générer un nouvel ID de conversation si nécessaire
    let conversationId = threadId;
    if (!conversationId) {
      conversationId = Math.random().toString(36).substring(2, 15);
    }

    // Construire le prompt en fonction du produit sélectionné
    let contextualPrompt = systemContext;
    let installationGuide = "";
    
    // Si un produit spécifique est demandé, ajouter ses informations au contexte
    if (productId) {
      // Charger les produits depuis le fichier JSON
      const productsData = await loadProducts();
      const products = productsData.products || [];
      
      // Extraire l'index du produit (format: "product-X")
      const productIndex = productId.split('-')[1];
      if (productIndex && products[parseInt(productIndex)]) {
        const product = products[parseInt(productIndex)];
        
        // Construire le contexte produit
        contextualPrompt += `\n\nINFORMATIONS PRODUIT SPÉCIFIQUE:
Produit: ${product.Nom}
Catégorie: ${product.Particularites.join(', ')}
Spécifications techniques:
- Puissance: ${product.Puissance.min} - ${product.Puissance.max} kW
- COP max: ${product.Cop?.max || 'Non spécifié'}
- Etas max: ${product.Etas?.max || 'Non spécifié'}
- Freecooling: ${product.Freecooling ? 'Oui' : 'Non'}
- Kit Piscine: ${product.Kit_Piscine ? 'Oui' : 'Non'}
`;

        // Ajouter les informations de puissance spécifique si disponibles
        if (powerOption && product.Puissance.disponibles) {
          const selectedPower = product.Puissance.disponibles.find((p: any) => p.modele === powerOption);
          if (selectedPower) {
            contextualPrompt += `\nOption de puissance sélectionnée:
- Modèle: ${selectedPower.modele}
- Puissance calorifique: ${selectedPower.puissance_calo} kW
- Puissance frigorifique: ${selectedPower.puissance_frigo || 'Non spécifiée'} kW
- COP: ${selectedPower.cop}
- Etas: ${selectedPower.etas}
`;
          }
        }

        contextualPrompt += `\nDescription: ${product.Description || 'Non disponible'}`;
        
        // Vérifier si un guide d'installation est disponible
        if (product.GuideInstallationURL) {
          installationGuide = await loadInstallationGuide(product.GuideInstallationURL);
          if (installationGuide) {
            contextualPrompt += `\n\nGUIDE D'INSTALLATION COMPLET:\nVoici le guide d'installation complet du produit. Utilise-le comme référence pour répondre précisément aux questions techniques et d'installation:\n\n${installationGuide}`;
          }
        }
        
        contextualPrompt += `\n\nPour ce produit spécifique, fournis des informations précises et adaptées à ses caractéristiques. Si la question porte sur l'installation, réfère-toi au guide d'installation fourni et cite précisément les sections pertinentes.`;
      }
    }

    // Ajouter le contexte système directement dans la requête utilisateur
    const enhancedPrompt = `${contextualPrompt}\n\nQUESTION DE L'UTILISATEUR: ${message}\n\nRÉPONSE:`;

    // Créer une requête simple (sans historique pour cette version)
    const result = await model.generateContent(enhancedPrompt);
    const responseText = result.response.text();
    
    return NextResponse.json({ 
      response: responseText,
      threadId: conversationId
    });

  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}