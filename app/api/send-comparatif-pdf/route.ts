import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { HeatingSystem } from '../../protected/dimensionnement/resume/types/heatingSystem';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const {
      agentEmail,
      agentName,
      copyToUser,
      userEmail,
      attachments,
      fileName,
      buildingData,
      selectedProduct,
      selectedModel,
      heatingSystems,
      yearlyEnergyNeed,
      selectedPeriod
    } = await req.json();

    if (!agentEmail) {
      return NextResponse.json({ error: "L'email du destinataire est requis" }, { status: 400 });
    }

    // Construction du contenu HTML de l'email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #86BC29; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Comparatif des solutions de chauffage</h1>
        </div>
        <div class="content">
          <p>Bonjour ${agentName},</p>
          <p>Veuillez trouver ci-joint le comparatif des solutions de chauffage pour votre projet.</p>
          
          <p>Une capture d'écran détaillée du comparatif est jointe à cet email.</p>
          <p>Cordialement,<br>L'équipe NEXTHERM</p>
        </div>
        <div class="footer">
          <p>Ce message a été généré automatiquement par l'application NEXTHERM.</p>
        </div>
      </body>
    </html>
    `;

    // Préparation des destinataires
    const recipients = [agentEmail];
    if (copyToUser && userEmail) {
      recipients.push(userEmail);
    }

    // Envoi de l'email avec Resend
    const { data, error } = await resend.emails.send({
      from: 'devis@nexthermapplications.fr',
      to: recipients,
      subject: `Comparatif des solutions de chauffage - ${buildingData?.projectName || 'Projet'}`,
      html: htmlContent,
      attachments: attachments || [],
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 });
    }

    console.log('Email envoyé avec succès, ID:', data?.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du comparatif par email:', error);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 });
  }
}
