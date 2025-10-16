import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { formData, agentEmail, agentName, copyToUser, userEmail } = await request.json();

    const generateCommissioningFormHTML = (data: any) => {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Fiche de Mise en Service - Nextherm</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            }
            .header {
              background: linear-gradient(135deg, #86BC29 0%, #75a625 100%);
              color: white;
              padding: 30px;
              border-radius: 12px;
              text-align: center;
              margin-bottom: 30px;
              box-shadow: 0 8px 32px rgba(134, 188, 41, 0.3);
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
            }
            .agent-info {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
              border-left: 4px solid #86BC29;
            }
            .section {
              background: white;
              margin-bottom: 25px;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }
            .section-header {
              background: #86BC29;
              color: white;
              padding: 15px 20px;
              font-weight: 600;
              font-size: 16px;
            }
            .section-content {
              padding: 20px;
            }
            .form-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 15px;
              margin-bottom: 15px;
            }
            .form-field {
              display: flex;
              flex-direction: column;
            }
            .form-field label {
              font-weight: 600;
              color: #555;
              margin-bottom: 5px;
              font-size: 14px;
            }
            .form-field .value {
              background: #f8f9fa;
              padding: 8px 12px;
              border-radius: 6px;
              border: 1px solid #e9ecef;
              min-height: 20px;
            }
            .checkbox-group {
              display: flex;
              flex-wrap: wrap;
              gap: 15px;
              margin-top: 10px;
            }
            .checkbox-item {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 12px;
              background: #f8f9fa;
              border-radius: 6px;
              border: 1px solid #e9ecef;
            }
            .checkbox-item.checked {
              background: #e8f5e8;
              border-color: #86BC29;
              color: #2d5016;
            }
            .checkbox-icon {
              width: 16px;
              height: 16px;
              border: 2px solid #ccc;
              border-radius: 3px;
              display: inline-block;
              position: relative;
            }
            .checkbox-icon.checked {
              background: #86BC29;
              border-color: #86BC29;
            }
            .checkbox-icon.checked::after {
              content: '✓';
              color: white;
              font-size: 12px;
              position: absolute;
              top: -2px;
              left: 2px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding: 20px;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }
            .nextherm-logo {
              color: #86BC29;
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 10px;
            }
            .highlight {
              background: #fff3cd;
              padding: 10px;
              border-radius: 6px;
              border-left: 4px solid #ffc107;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔧 FICHE DE MISE EN SERVICE DE LA POMPE À CHALEUR</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Document technique d'installation</p>
          </div>

          <div class="agent-info">
            <strong>📧 Agent assigné:</strong> ${agentName} (${agentEmail})
          </div>

          <!-- Informations générales -->
          <div class="section">
            <div class="section-header">📋 Informations générales</div>
            <div class="section-content">
              <div class="form-grid">
                <div class="form-field">
                  <label>Type de pompe</label>
                  <div class="value">${data.type || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Modèle</label>
                  <div class="value">${data.modele || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>N° de série</label>
                  <div class="value highlight">${data.numeroSerie || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Générateur</label>
                  <div class="value">${data.generateur || 'Non spécifié'}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Adresse installation -->
          <div class="section">
            <div class="section-header">🏠 Adresse de l'installation</div>
            <div class="section-content">
              <div class="form-grid">
                <div class="form-field">
                  <label>Nom, Prénom</label>
                  <div class="value">${data.nomPrenom || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Adresse</label>
                  <div class="value">${data.adresse || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Code postal</label>
                  <div class="value">${data.codePostal || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Ville</label>
                  <div class="value">${data.ville || 'Non spécifié'}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Surfaces et Application -->
          <div class="section">
            <div class="section-header">📐 Surfaces et Application</div>
            <div class="section-content">
              <div class="form-grid">
                <div class="form-field">
                  <label>Surface RDC (m²)</label>
                  <div class="value">${data.surfaceRDC || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Surface étage (m²)</label>
                  <div class="value">${data.surfaceEtage || 'Non spécifié'}</div>
                </div>
              </div>
              
              <label style="font-weight: 600; color: #555; margin-bottom: 10px; display: block;">Application</label>
              <div class="checkbox-group">
                <div class="checkbox-item ${data.plancherChauffant ? 'checked' : ''}">
                  <span class="checkbox-icon ${data.plancherChauffant ? 'checked' : ''}"></span>
                  Plancher Chauffant
                </div>
                <div class="checkbox-item ${data.radiateurs ? 'checked' : ''}">
                  <span class="checkbox-icon ${data.radiateurs ? 'checked' : ''}"></span>
                  Radiateurs
                </div>
                <div class="checkbox-item ${data.ventiloConvecteurs ? 'checked' : ''}">
                  <span class="checkbox-icon ${data.ventiloConvecteurs ? 'checked' : ''}"></span>
                  Ventilo-convecteurs
                </div>
              </div>

              <label style="font-weight: 600; color: #555; margin: 20px 0 10px 0; display: block;">Ballon tampon</label>
              <div class="checkbox-group">
                <div class="checkbox-item ${data.ballonTamponOui ? 'checked' : ''}">
                  <span class="checkbox-icon ${data.ballonTamponOui ? 'checked' : ''}"></span>
                  Oui
                </div>
                <div class="checkbox-item ${data.ballonTamponNon ? 'checked' : ''}">
                  <span class="checkbox-icon ${data.ballonTamponNon ? 'checked' : ''}"></span>
                  Non
                </div>
              </div>
              ${data.ballonTamponVolume ? `
                <div class="form-field" style="margin-top: 15px;">
                  <label>Volume ballon tampon (litres)</label>
                  <div class="value">${data.ballonTamponVolume}</div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Paramètres hydrauliques -->
          <div class="section">
            <div class="section-header">💧 Paramètres hydrauliques</div>
            <div class="section-content">
              <div class="form-grid">
                <div class="form-field">
                  <label>Distance liaisons (m)</label>
                  <div class="value">${data.distanceLiaisons || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Diamètre liaisons (mm)</label>
                  <div class="value">${data.diametreLiaisons || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Temp. départ eau chauffage (°C)</label>
                  <div class="value">${data.tempDepartEauChauffage || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Temp. retour eau chauffage (°C)</label>
                  <div class="value">${data.tempRetourEauChauffage || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Temp. départ eau froide (°C)</label>
                  <div class="value">${data.tempDepartEauFroide || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Temp. retour eau froide (°C)</label>
                  <div class="value">${data.tempRetourEauFroide || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Pression remplissage (bars)</label>
                  <div class="value">${data.pressionRemplissage || 'Non spécifié'}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Kit ECS -->
          <div class="section">
            <div class="section-header">🚿 Kit ECS</div>
            <div class="section-content">
              <div class="checkbox-group">
                <div class="checkbox-item ${data.kitECS170 ? 'checked' : ''}">
                  <span class="checkbox-icon ${data.kitECS170 ? 'checked' : ''}"></span>
                  170 L
                </div>
                <div class="checkbox-item ${data.kitECS270 ? 'checked' : ''}">
                  <span class="checkbox-icon ${data.kitECS270 ? 'checked' : ''}"></span>
                  270 L
                </div>
              </div>
              ${data.kitECSAutre ? `
                <div class="form-field" style="margin-top: 15px;">
                  <label>Autre (à préciser)</label>
                  <div class="value">${data.kitECSAutre}</div>
                </div>
              ` : ''}
              ${data.pacReversible ? `
                <div class="form-field" style="margin-top: 15px;">
                  <label>PAC réversible</label>
                  <div class="value">${data.pacReversible}</div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Paramètres capteur -->
          <div class="section">
            <div class="section-header">🔧 Paramètres capteur</div>
            <div class="section-content">
              <label style="font-weight: 600; color: #555; margin-bottom: 10px; display: block;">Type de capteur</label>
              <div class="checkbox-group">
                <div class="checkbox-item ${data.capteurTranchees ? 'checked' : ''}">
                  <span class="checkbox-icon ${data.capteurTranchees ? 'checked' : ''}"></span>
                  Tranchées
                </div>
                <div class="checkbox-item ${data.capteurHorizontal ? 'checked' : ''}">
                  <span class="checkbox-icon ${data.capteurHorizontal ? 'checked' : ''}"></span>
                  Horizontal
                </div>
                <div class="checkbox-item ${data.capteurVertical ? 'checked' : ''}">
                  <span class="checkbox-icon ${data.capteurVertical ? 'checked' : ''}"></span>
                  Vertical
                </div>
                <div class="checkbox-item ${data.capteurEauNappe ? 'checked' : ''}">
                  <span class="checkbox-icon ${data.capteurEauNappe ? 'checked' : ''}"></span>
                  Eau de nappe
                </div>
              </div>

              <div class="form-grid" style="margin-top: 20px;">
                <div class="form-field">
                  <label>Nombre boucles capteur</label>
                  <div class="value">${data.nombreBouclesCapteur || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Surface capteur</label>
                  <div class="value">${data.surfaceCapteur || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Type capteur</label>
                  <div class="value">${data.typeCapteur || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Longueur capteur (m)</label>
                  <div class="value">${data.longueurCapteur || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Diamètre capteur (mm)</label>
                  <div class="value">${data.diameterCapteur || 'Non spécifié'}</div>
                </div>
              </div>

              <label style="font-weight: 600; color: #555; margin: 20px 0 10px 0; display: block;">Charge frigorigène</label>
              <div class="checkbox-group">
                <div class="checkbox-item ${data.chargeR410a ? 'checked' : ''}">
                  <span class="checkbox-icon ${data.chargeR410a ? 'checked' : ''}"></span>
                  R410a
                </div>
                <div class="checkbox-item ${data.chargeR32 ? 'checked' : ''}">
                  <span class="checkbox-icon ${data.chargeR32 ? 'checked' : ''}"></span>
                  R32
                </div>
              </div>
              
              ${data.chargeKg ? `
                <div class="form-field" style="margin-top: 15px;">
                  <label>Charge (kg)</label>
                  <div class="value">${data.chargeKg}</div>
                </div>
              ` : ''}
              ${data.tauxMonopropylene ? `
                <div class="form-field" style="margin-top: 15px;">
                  <label>Taux monopropylène glycol (%)</label>
                  <div class="value">${data.tauxMonopropylene}</div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Paramètres électriques -->
          <div class="section">
            <div class="section-header">⚡ Paramètres électriques</div>
            <div class="section-content">
              <div class="form-grid">
                <div class="form-field">
                  <label>Longueur alimentation (m)</label>
                  <div class="value">${data.longueurAlimentation || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Tension fonctionnement (V)</label>
                  <div class="value">${data.tensionFonctionnement || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Intensité absorbée (A)</label>
                  <div class="value">${data.intensiteAbsorbee || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Vérification cycle (mn)</label>
                  <div class="value">${data.verificationCycle || 'Non spécifié'}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Paramètres frigorifiques -->
          <div class="section">
            <div class="section-header">❄️ Paramètres frigorifiques en mode chauffage</div>
            <div class="section-content">
              <div class="form-grid">
                <div class="form-field">
                  <label>Pression BP (Bars)</label>
                  <div class="value">${data.pressionBP || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Pression HP (Bars)</label>
                  <div class="value">${data.pressionHP || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Température aspiration (°C)</label>
                  <div class="value">${data.tempAspiration || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Température liquide (°C)</label>
                  <div class="value">${data.tempLiquide || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Surchauffe (°C)</label>
                  <div class="value">${data.surchauffe || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Sous refroidissement (°C)</label>
                  <div class="value">${data.sousRefroidissement || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Température refoulement (°C)</label>
                  <div class="value">${data.tempRefoulement || 'Non spécifié'}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Installateur -->
          <div class="section">
            <div class="section-header">👷 Installateur</div>
            <div class="section-content">
              <div class="form-grid">
                <div class="form-field">
                  <label>Nom de la société</label>
                  <div class="value">${data.nomSociete || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Date d'installation</label>
                  <div class="value">${data.dateInstallation || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Nom du technicien</label>
                  <div class="value">${data.nomTechnicien || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Téléphone technicien</label>
                  <div class="value">${data.telephoneTechnicien || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Étude thermique référence</label>
                  <div class="value">${data.etudeThermique || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Réalisé par</label>
                  <div class="value">${data.realisePar1 || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Étude technique référence</label>
                  <div class="value">${data.etudeTechnique || 'Non spécifié'}</div>
                </div>
                <div class="form-field">
                  <label>Réalisé par</label>
                  <div class="value">${data.realisePar2 || 'Non spécifié'}</div>
                </div>
              </div>

              <label style="font-weight: 600; color: #555; margin: 20px 0 10px 0; display: block;">Contrat d'entretien annuel</label>
              <div class="checkbox-group">
                <div class="checkbox-item ${data.contratEntretien === 'Oui' ? 'checked' : ''}">
                  <span class="checkbox-icon ${data.contratEntretien === 'Oui' ? 'checked' : ''}"></span>
                  OUI
                </div>
                <div class="checkbox-item ${data.contratEntretien === 'Non' ? 'checked' : ''}">
                  <span class="checkbox-icon ${data.contratEntretien === 'Non' ? 'checked' : ''}"></span>
                  NON
                </div>
              </div>
            </div>
          </div>

          <div class="footer">
            <div class="nextherm-logo">NEXTHERM®</div>
            <p style="margin: 0; color: #666; font-size: 14px;">Fabricant français de géothermie</p>
            <p style="margin: 5px 0 0 0; color: #888; font-size: 12px;">
              Document non contractuel de relevé de fonctionnement de la PAC
            </p>
          </div>
        </body>
        </html>
      `;
    };

    const emailHTML = generateCommissioningFormHTML(formData);

    // Préparer les destinataires
    const recipients = [agentEmail];
    if (copyToUser && userEmail) {
      recipients.push(userEmail);
    }

    // Envoyer l'email
    const { data, error } = await resend.emails.send({
      from: 'devis@nexthermapplications.fr',
      to: recipients,
      subject: `Fiche de mise en service - ${formData.nomPrenom || 'Client'} - ${formData.numeroSerie || 'N/A'}`,
      html: emailHTML,
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'email' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Fiche de mise en service envoyée avec succès',
      emailId: data?.id 
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
