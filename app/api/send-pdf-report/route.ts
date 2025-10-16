import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { 
      buildingData, 
      pdfBase64, 
      comparatifPdfBase64, 
      docCommercialBase64,
      docCommercialUrl, 
      fileName, 
      agentEmail, 
      agentName, 
      userEmail,
      correspondants,
      includeDimensionnement,
      includeComparatif,
      includeDocCommercial
    } = await request.json();

    if (!userEmail) {
      return NextResponse.json({ error: 'Email du destinataire principal manquant' }, { status: 400 });
    }
    
    // Vérifier qu'au moins un document est sélectionné
    if ((!includeDimensionnement || !pdfBase64) && 
        (!includeComparatif || !comparatifPdfBase64) && 
        (!includeDocCommercial || (!docCommercialBase64 && !docCommercialUrl))) {
      return NextResponse.json({ error: 'Aucun document valide à envoyer' }, { status: 400 });
    }

    // Extraire la partie base64 du dataURI pour le dimensionnement (si sélectionné)
    let dimensionnementBase64 = null;
    if (includeDimensionnement && pdfBase64) {
      dimensionnementBase64 = pdfBase64.split(',')[1] || pdfBase64;
    }
    
    // Extraire la partie base64 du dataURI pour le comparatif (si sélectionné)
    let comparatifBase64 = null;
    if (includeComparatif && comparatifPdfBase64) {
      comparatifBase64 = comparatifPdfBase64.split(',')[1] || comparatifPdfBase64;
    }
    
    // Extraire la partie base64 du dataURI pour la documentation commerciale (si sélectionnée)
    let documentationBase64 = null;
    if (includeDocCommercial && docCommercialBase64) {
      documentationBase64 = docCommercialBase64.split(',')[1] || docCommercialBase64;
    }
    
    // URL publique du logo NEXTHERM
    const logoUrl = 'https://www.nextherm.fr/wp-content/uploads/2023/02/logo-nextherm.png';

    // Préparer le contenu HTML pour le corps de l'email avec un design plus professionnel
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Dossier NEXTHERM</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
            
            body { 
              font-family: 'Roboto', Arial, sans-serif; 
              line-height: 1.6; 
              color: #333;
              max-width: 650px;
              margin: 0 auto;
              background-color: #f5f5f5;
              padding: 20px;
            }
            .email-container {
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
            }
            .header { 
              padding: 30px 20px;
              text-align: center;
              background-color: #ffffff;
              border-bottom: 3px solid #86BC29;
            }
            .header img {
              max-width: 280px;
              height: auto;
            }
            .banner {
              background-color: #86BC29;
              color: white;
              text-align: center;
              padding: 15px;
              font-size: 22px;
              font-weight: 300;
            }
            .content {
              padding: 30px;
              background-color: #ffffff;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
              color: #444;
            }
            .documents-title {
              font-weight: 500;
              color: #86BC29;
              margin-top: 25px;
              margin-bottom: 15px;
              font-size: 16px;
            }
            .document-list {
              background-color: #f9f9f9;
              border-left: 4px solid #86BC29;
              padding: 15px 20px;
              border-radius: 0 4px 4px 0;
              margin-bottom: 25px;
            }
            .document-list li {
              padding: 5px 0;
              list-style-type: none;
              position: relative;
              padding-left: 20px;
            }
            .document-list li:before {
              content: '✓';
              position: absolute;
              left: 0;
              color: #86BC29;
              font-weight: bold;
            }
            .link-section {
              margin-top: 25px;
              background-color: #f0f8e6;
              padding: 15px;
              border-radius: 5px;
            }
            .button {
              display: inline-block;
              background-color: #86BC29;
              color: white;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 4px;
              font-weight: 500;
              margin-top: 5px;
              text-align: center;
              transition: background-color 0.3s;
            }
            .button:hover {
              background-color: #759e23;
            }
            .note {
              margin-top: 25px;
              padding-top: 15px;
              border-top: 1px solid #eaeaea;
              font-style: italic;
              color: #555;
            }
            .footer { 
              background-color: #333;
              color: #fff;
              padding: 20px;
              text-align: center;
              font-size: 13px;
              border-radius: 0 0 8px 8px;
            }
            .social-links {
              margin-top: 15px;
            }
            .social-links a {
              color: #fff;
              margin: 0 10px;
              text-decoration: none;
            }
            @media only screen and (max-width: 480px) {
              body {
                padding: 10px;
              }
              .content {
                padding: 20px;
              }
              .header img {
                max-width: 220px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <img src="${logoUrl}" alt="NEXTHERM" style="max-width: 280px; height: auto;" />
            </div>
            <div class="banner">
              Votre dossier personnalisé
            </div>
            <div class="content">
              <p class="greeting">Bonjour,</p>
              
              <p>Nous avons le plaisir de vous transmettre votre dossier NEXTHERM personnalisé pour votre projet.</p>
              
              <p class="documents-title">DOCUMENTS JOINTS :</p>
              <ul class="document-list">
                ${includeDimensionnement ? '<li>Dimensionnement pompe à chaleur</li>' : ''}
                ${includeComparatif ? '<li>Comparatif des solutions de chauffage</li>' : ''}
                ${includeDocCommercial ? '<li>Documentation technique du produit sélectionné</li>' : ''}
              </ul>
              
              ${(includeDocCommercial && !documentationBase64 && docCommercialUrl) ? 
                `<div class="link-section">
                  <p>Pour consulter la documentation complète du produit :</p>
                  <a href="${docCommercialUrl}" class="button">Accéder à la documentation</a>
                </div>` : ''}
              
              <p class="note">Pour toute information complémentaire concernant votre projet ou pour planifier une visite technique, n'hésitez pas à contacter votre conseiller NEXTHERM.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} NEXTHERM - Solutions thermiques de qualité</p>
              <div class="social-links">
                <a href="https://www.facebook.com/nextherm">Facebook</a> | 
                <a href="https://www.linkedin.com/company/nextherm">LinkedIn</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Préparer les destinataires
    const recipients = [userEmail]; // L'email de l'utilisateur est désormais le destinataire principal
    
    // Ajouter les correspondants supplémentaires s'il y en a
    if (correspondants && Array.isArray(correspondants)) {
      correspondants.forEach(corr => {
        if (corr && corr.email && typeof corr.email === 'string') {
          recipients.push(corr.email);
        }
      });
    }

    // Vérifier si nous sommes en environnement de développement
    const isDev = process.env.NODE_ENV === 'development';
    
    // Préparer les pièces jointes
    const attachments = [];
    
    // Le logo est maintenant référencé directement depuis son URL publique
    
    // Ajouter le PDF de dimensionnement si sélectionné
    if (includeDimensionnement && dimensionnementBase64) {
      attachments.push({
        filename: `${fileName || 'dimensionnement_nextherm'}.pdf`,
        content: dimensionnementBase64
      });
    }
    
    // Ajouter le PDF comparatif si sélectionné
    if (includeComparatif && comparatifBase64) {
      attachments.push({
        filename: `comparatif_solutions_nextherm.pdf`,
        content: comparatifBase64
      });
    }
    
    // Ajouter la documentation commerciale si sélectionnée et disponible en base64
    if (includeDocCommercial && documentationBase64) {
      // Vérifier si la documentation n'est pas vide ou corrompue
      if (documentationBase64.length > 100) { // Taille minimale pour un PDF valide en base64
        attachments.push({
          filename: `documentation_commerciale_nextherm.pdf`,
          content: documentationBase64
        });
        console.log('Documentation commerciale jointe avec succès');
      } else {
        console.warn('La documentation commerciale en base64 semble corrompue ou vide');
      }
    } else if (includeDocCommercial) {
      console.warn('Documentation commerciale demandée mais aucun contenu base64 n\'est disponible');
    }
    
    // Déterminer le sujet de l'email en fonction des documents inclus
    let emailSubject = '';
    if (includeDimensionnement && includeComparatif) {
      emailSubject = `Dossier de dimensionnement et comparatif NEXTHERM - ${buildingData.totalSurface}m²`;
    } else if (includeDimensionnement) {
      emailSubject = `Dossier de dimensionnement NEXTHERM - ${buildingData.totalSurface}m²`;
    } else if (includeComparatif) {
      emailSubject = `Comparatif des solutions de chauffage NEXTHERM - ${buildingData.totalSurface}m²`;
    } else {
      emailSubject = `Documentation NEXTHERM - ${buildingData.totalSurface}m²`;
    }
    
    // Envoyer l'email avec Resend
    const { data, error } = await resend.emails.send({
      from: 'devis@nexthermapplications.fr',
      to: recipients,
      subject: emailSubject,
      html: htmlContent,
      attachments: attachments,
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'email' }, { status: 500 });
    }

    // Log pour le développement
    console.log('Email envoyé avec succès, ID:', data?.id);
    
    return NextResponse.json({ 
      success: true, 
      messageId: data?.id,
      // Pour la compatibilité avec le code existant qui attend une URL de prévisualisation
      // Resend fournit une interface web pour voir les emails envoyés
      previewUrl: isDev ? 'https://resend.com/emails' : undefined
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'envoi du rapport' },
      { status: 500 }
    );
  }
}
