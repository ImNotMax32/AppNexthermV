import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { description, images, isReplacement, replacementBrand, installerName, department, clientEmail } = await request.json();

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'La description est requise' },
        { status: 400 }
      );
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'Au moins une photo est requise' },
        { status: 400 }
      );
    }

    if (!isReplacement) {
      return NextResponse.json(
        { error: 'Veuillez indiquer si c\'est un remplacement' },
        { status: 400 }
      );
    }

    if (isReplacement === 'oui' && !replacementBrand) {
      return NextResponse.json(
        { error: 'Veuillez indiquer la marque remplacée' },
        { status: 400 }
      );
    }

    // Convertir les images base64 en attachments pour Resend
    const attachments = images.map((img: { filename: string; base64: string }, index: number) => {
      // Déterminer le type MIME à partir de l'extension du fichier
      const extension = img.filename.split('.').pop()?.toLowerCase();
      let contentType = 'image/jpeg'; // Par défaut
      
      if (extension === 'png') {
        contentType = 'image/png';
      } else if (extension === 'gif') {
        contentType = 'image/gif';
      } else if (extension === 'webp') {
        contentType = 'image/webp';
      }

      return {
        filename: img.filename || `photo-${index + 1}.jpg`,
        content: Buffer.from(img.base64, 'base64'),
        content_type: contentType,
      };
    });

    // Créer le contenu HTML de l'email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #86BC29 0%, #6fa01f 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content {
              padding: 30px;
            }
            .description-box {
              background: #f8f9fa;
              border-left: 4px solid #86BC29;
              padding: 20px;
              margin-bottom: 20px;
              border-radius: 4px;
            }
            .description-text {
              font-size: 16px;
              line-height: 1.8;
              color: #333;
              white-space: pre-wrap;
            }
            .images-info {
              background: #e8f5e8;
              border: 2px solid #86BC29;
              border-radius: 8px;
              padding: 15px;
              margin-top: 20px;
            }
            .images-info-title {
              color: #86BC29;
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 10px;
            }
            .images-list {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            .images-list li {
              padding: 5px 0;
              color: #555;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #dee2e6;
            }
            .timestamp {
              color: #888;
              font-size: 14px;
              margin-top: 20px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Nouveau Dépôt Professionnel</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">
                Reçu le ${new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })} à ${new Date().toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            
            <div class="content">
              <!-- Informations générales -->
              <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 1px solid #e9ecef;">
                <h2 style="color: #86BC29; margin-top: 0; margin-bottom: 15px; font-size: 18px;">
                  Informations générales
                </h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                  <div>
                    <strong style="color: #555; font-size: 14px;">Type d'installation :</strong>
                    <p style="margin: 5px 0 0 0; color: #333; font-size: 16px;">
                      ${isReplacement === 'oui' ? 'Remplacement' : 'Nouvelle installation'}
                    </p>
                  </div>
                  ${isReplacement === 'oui' && replacementBrand ? `<div>
                      <strong style="color: #555; font-size: 14px;">Marque remplacée :</strong>
                      <p style="margin: 5px 0 0 0; color: #333; font-size: 16px;">${replacementBrand}</p>
                    </div>` : ''}
                  ${installerName ? `<div>
                      <strong style="color: #555; font-size: 14px;">Installateur / Entreprise :</strong>
                      <p style="margin: 5px 0 0 0; color: #333; font-size: 16px;">${installerName}</p>
                    </div>` : ''}
                  ${department ? `<div>
                      <strong style="color: #555; font-size: 14px;">Département :</strong>
                      <p style="margin: 5px 0 0 0; color: #333; font-size: 16px;">${department}</p>
                    </div>` : ''}
                  ${clientEmail ? `<div>
                      <strong style="color: #555; font-size: 14px;">Email professionnel :</strong>
                      <p style="margin: 5px 0 0 0; color: #333; font-size: 16px;">${clientEmail}</p>
                    </div>` : ''}
                </div>
              </div>

              <div class="description-box">
                <h2 style="color: #86BC29; margin-top: 0; margin-bottom: 15px; font-size: 18px;">
                  Description de l'installation
                </h2>
                <div class="description-text">${description.replace(/\n/g, '<br>')}</div>
              </div>

              <div class="images-info">
                <div class="images-info-title">
                  Photos jointes (${images.length})
                </div>
                <ul class="images-list">
                  ${images.map((img: { filename: string }, index: number) => 
                    `<li>• ${img.filename || `Photo ${index + 1}`}</li>`
                  ).join('')}
                </ul>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                  Les photos sont disponibles en pièces jointes de cet email.
                </p>
              </div>
            </div>

            <div class="footer">
              <p><strong>Nextherm Applications</strong></p>
              <p>Formulaire de dépôt professionnel</p>
              <p class="timestamp">
                Email généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Préparer les destinataires
    const recipients = ['m.barrault@nextherm.fr'];
    if (clientEmail && clientEmail.trim()) {
      recipients.push(clientEmail.trim());
    }

    // Envoyer l'email
    const { data, error } = await resend.emails.send({
      from: 'devis@nexthermapplications.fr',
      to: recipients,
      subject: `Nouveau dépôt professionnel${isReplacement === 'oui' && replacementBrand ? ` - Remplacement ${replacementBrand}` : ''} - ${new Date().toLocaleDateString('fr-FR')}`,
      html: emailHtml,
      attachments: attachments,
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      );
    }

    console.log('Dépôt envoyé avec succès, ID:', data?.id);

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      message: 'Dépôt envoyé avec succès',
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi du témoignage:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

