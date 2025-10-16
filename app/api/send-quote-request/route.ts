import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { formData, agentEmail, agentName, copyToUser, userEmail } = await request.json();
    
    // Construire le contenu HTML de l'email
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
            .container { max-width: 1200px; margin: 0 auto; background: white; }
            .header { 
              background: linear-gradient(135deg, #86BC29 0%, #6fa01f 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 8px 8px 0 0;
            }
            .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; }
            
            .content { padding: 30px; }
            
            .summary-box { 
              background: linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%); 
              border: 2px solid #86BC29; 
              border-radius: 12px; 
              padding: 25px; 
              margin-bottom: 30px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .summary-title { 
              color: #86BC29; 
              font-size: 20px; 
              font-weight: bold; 
              margin-bottom: 15px; 
              text-align: center;
            }
            .summary-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); 
              gap: 15px; 
            }
            .summary-item { 
              background: white; 
              padding: 15px; 
              border-radius: 8px; 
              border-left: 4px solid #86BC29;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .summary-label { font-size: 12px; color: #666; text-transform: uppercase; font-weight: bold; }
            .summary-value { font-size: 16px; color: #333; font-weight: bold; margin-top: 5px; }
            
            .agent-box { 
              background: #86BC29; 
              color: white; 
              padding: 20px; 
              border-radius: 8px; 
              margin-bottom: 30px; 
              text-align: center;
            }
            .agent-box h3 { margin: 0 0 10px 0; }
            
            .section { 
              margin-bottom: 25px; 
              background: white; 
              border-radius: 8px; 
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              padding: 20px;
            }
            .section h3 { 
              color: #86BC29; 
              border-bottom: 2px solid #86BC29; 
              padding-bottom: 5px; 
              margin-top: 0;
              font-size: 18px;
            }
            
            .grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 15px; 
              margin-bottom: 15px;
            }
            .field { 
              margin-bottom: 10px; 
            }
            .field strong { 
              color: #555; 
              min-width: 120px;
              display: inline-block;
            }
            
            .checkbox-group { 
              display: flex; 
              flex-wrap: wrap; 
              gap: 10px; 
              margin-bottom: 15px;
            }
            .checkbox-item { 
              background: #86BC29; 
              color: white; 
              padding: 6px 12px; 
              border-radius: 20px; 
              font-size: 12px; 
              font-weight: bold; 
            }
            .checkbox-item-secondary { 
              background: #6c757d; 
              color: white; 
              padding: 6px 12px; 
              border-radius: 20px; 
              font-size: 12px; 
              font-weight: bold; 
            }
            
            .zone-section {
              background: #f8f9fa; 
              border-radius: 8px; 
              padding: 15px; 
              margin-bottom: 15px;
              border-left: 4px solid #86BC29;
            }
            .zone-title { 
              color: #86BC29; 
              font-weight: bold; 
              margin-bottom: 10px; 
              font-size: 16px;
            }
            
            .footer { 
              background: #f8f9fa; 
              padding: 20px; 
              text-align: center; 
              font-size: 12px; 
              color: #666; 
              border-top: 1px solid #dee2e6;
            }
            
            .highlight { background: #fff3cd; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <h1>🏠 Demande de Devis Nextherm</h1>
              <p>Reçue le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            </div>
            
            <div class="content">
              <!-- Agent assigné -->
              <div class="agent-box">
                <h3>👤 Agent Commercial Assigné</h3>
                <p><strong>${agentName}</strong> • ${agentEmail}</p>
              </div>

              <!-- Résumé Exécutif -->
              <div class="summary-box">
                <div class="summary-title">📋 RÉSUMÉ EXÉCUTIF</div>
                <div class="summary-grid">
                  <div class="summary-item">
                    <div class="summary-label">Entreprise</div>
                    <div class="summary-value">${formData.entreprise || 'Non renseigné'}</div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-label">Référence</div>
                    <div class="summary-value">${formData.reference || 'Non renseigné'}</div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-label">Type de projet</div>
                    <div class="summary-value">
                      ${formData.neuf ? '🏗️ Neuf' : ''}
                      ${formData.renovation ? '🔧 Rénovation' : ''}
                      ${formData.remplacementChaudiere ? '🔥 Remplacement' : ''}
                    </div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-label">Surface totale</div>
                    <div class="summary-value">
                      ${((parseFloat(formData.zone1Surface || '0') + parseFloat(formData.zone2Surface || '0') + parseFloat(formData.zone3Surface || '0') + parseFloat(formData.zone4Surface || '0')) || 'Non calculé')} m²
                    </div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-label">Déperditions</div>
                    <div class="summary-value highlight">${formData.deperditions || 'Non renseigné'} kW</div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-label">Type de PAC</div>
                    <div class="summary-value">
                      ${formData.aeroAirEau ? '🌬️ Aérothermie' : ''}
                      ${formData.geoEauGlycoleEau ? '🌍 Géothermie' : ''}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Informations Générales -->
              <div class="section">
                <h3>📋 Informations Générales</h3>
                <div class="grid">
                  <div class="field"><strong>Entreprise :</strong> ${formData.entreprise || 'Non renseigné'}</div>
                  <div class="field"><strong>Référence :</strong> ${formData.reference || 'Non renseigné'}</div>
                  <div class="field"><strong>Date :</strong> ${formData.date || 'Non renseigné'}</div>
                  <div class="field"><strong>Interlocuteur :</strong> ${formData.interlocuteur || 'Non renseigné'}</div>
                </div>
              </div>

              <!-- Élément d'Étude -->
              <div class="section">
                <h3>🏗️ Élément d'Étude</h3>
                <div class="checkbox-group">
                  ${formData.neuf ? '<span class="checkbox-item">✅ Neuf</span>' : ''}
                  ${formData.renovation ? '<span class="checkbox-item">✅ Rénovation</span>' : ''}
                  ${formData.remplacementChaudiere ? '<span class="checkbox-item">✅ Remplacement chaudière</span>' : ''}
                </div>
                <div class="grid">
                  <div class="field"><strong>Type maison :</strong> ${formData.typeMaison || 'Non renseigné'}</div>
                  <div class="field"><strong>Zone climatique :</strong> ${formData.zoneClimatique || 'Non renseigné'}</div>
                  <div class="field"><strong>Altitude :</strong> ${formData.altitude || 'Non renseigné'}</div>
                </div>
              </div>

              <!-- Zones du Bâtiment -->
              ${(formData.zone1Surface || formData.zone2Surface || formData.zone3Surface || formData.zone4Surface) ? `
                <div class="section">
                  <h3>🏠 Zones du Bâtiment</h3>
                  ${[1, 2, 3, 4].map(i => {
                    const surface = formData[`zone${i}Surface`];
                    const volume = formData[`zone${i}Volume`];
                    const emetteur = formData[`zone${i}Emetteur`];
                    if (surface || volume || emetteur) {
                      return `
                        <div class="zone-section">
                          <div class="zone-title">Zone ${i} :</div>
                          <div class="grid">
                            <div class="field"><strong>Surface :</strong> ${surface || 'Non renseigné'} m²</div>
                            <div class="field"><strong>Volume :</strong> ${volume || 'Non renseigné'} m³</div>
                            <div class="field"><strong>Émetteur :</strong> ${emetteur || 'Non renseigné'}</div>
                          </div>
                        </div>
                      `;
                    }
                    return '';
                  }).join('')}
                </div>
              ` : ''}

              <!-- Déperditions et Températures -->
              <div class="section">
                <h3>🌡️ Déperditions et Températures</h3>
                <div class="grid">
                  <div class="field"><strong>Déperditions :</strong> <span class="highlight">${formData.deperditions || 'Non renseigné'} kW</span></div>
                  <div class="field"><strong>T° extérieure :</strong> ${formData.tExterieure || 'Non renseigné'}°C</div>
                  <div class="field"><strong>T° départ eau :</strong> ${formData.tDepartEau || 'Non renseigné'}°C</div>
                  <div class="field"><strong>T° ambiante :</strong> ${formData.tAmbiante || '20'}°C</div>
                </div>
              </div>

              <!-- Type de Pompe à Chaleur -->
              <div class="section">
                <h3>🔧 Type de Pompe à Chaleur</h3>
                <div class="checkbox-group">
                  ${formData.r32 ? '<span class="checkbox-item">✅ R32</span>' : ''}
                  ${formData.r410 ? '<span class="checkbox-item">✅ R410</span>' : ''}
                </div>
                
                <h4 style="color: #86BC29; margin: 15px 0 10px 0;">Aérothermie :</h4>
                <div class="checkbox-group">
                  ${formData.aeroAirEau ? '<span class="checkbox-item">✅ Air/Eau</span>' : ''}
                  ${formData.monoBloc ? '<span class="checkbox-item">✅ Monobloc</span>' : ''}
                  ${formData.biBloc ? '<span class="checkbox-item">✅ Bibloc</span>' : ''}
                </div>
                
                <h4 style="color: #86BC29; margin: 15px 0 10px 0;">Géothermie :</h4>
                <div class="checkbox-group">
                  ${formData.geoEauGlycoleEau ? '<span class="checkbox-item">✅ Eau glycolée/Eau</span>' : ''}
                  ${formData.geoSolEau ? '<span class="checkbox-item">✅ Sol/Eau</span>' : ''}
                  ${formData.geoSolSol ? '<span class="checkbox-item">✅ Sol/Sol</span>' : ''}
                  ${formData.geoEauGlycoleSol ? '<span class="checkbox-item">✅ Eau glycolée/Sol</span>' : ''}
                </div>
              </div>

              <!-- Gammes -->
              <div class="section">
                <h3>📦 Gammes</h3>
                <div class="checkbox-group">
                  ${formData.optipack ? '<span class="checkbox-item">✅ OPTIPACK</span>' : ''}
                  ${formData.smartpack ? '<span class="checkbox-item">✅ SMARTPACK</span>' : ''}
                  ${formData.optipackDuo ? '<span class="checkbox-item">✅ OPTIPACK DUO</span>' : ''}
                  ${formData.smartpackSupport ? '<span class="checkbox-item">✅ SMARTPACK Support</span>' : ''}
                  ${formData.smartpackHabillage ? '<span class="checkbox-item">✅ SMARTPACK Habillage</span>' : ''}
                </div>
              </div>

              <!-- Accessoires et Capteurs -->
              <div class="section">
                <h3>🔩 Accessoires et Capteurs</h3>
                
                <h4 style="color: #86BC29; margin: 15px 0 10px 0;">Accessoires Aérothermie :</h4>
                <div class="checkbox-group">
                  ${formData.supportsMuraux ? '<span class="checkbox-item-secondary">✅ Supports muraux</span>' : ''}
                  ${formData.supportsSol ? '<span class="checkbox-item-secondary">✅ Supports sol</span>' : ''}
                </div>
                
                <h4 style="color: #86BC29; margin: 15px 0 10px 0;">Type capteur Géothermie :</h4>
                <div class="checkbox-group">
                  ${formData.horizontal ? '<span class="checkbox-item-secondary">✅ Horizontal</span>' : ''}
                  ${formData.vertical ? '<span class="checkbox-item-secondary">✅ Vertical</span>' : ''}
                  ${formData.charge ? '<span class="checkbox-item-secondary">✅ Chargé</span>' : ''}
                  ${formData.nonCharge ? '<span class="checkbox-item-secondary">✅ Non chargé</span>' : ''}
                  ${formData.eauNappe ? '<span class="checkbox-item-secondary">✅ Eau de nappe</span>' : ''}
                </div>
              </div>

              <!-- Options -->
              <div class="section">
                <h3>⚙️ Options</h3>
                <div class="checkbox-group">
                  ${formData.kitPiscine ? '<span class="checkbox-item-secondary">✅ Kit piscine</span>' : ''}
                  ${formData.reversible ? '<span class="checkbox-item-secondary">✅ Réversible</span>' : ''}
                  ${formData.kitFreecooling ? '<span class="checkbox-item-secondary">✅ Kit freecooling</span>' : ''}
                </div>
                
                ${formData.longueur || formData.largeur || formData.profondeur ? `
                  <h4 style="color: #86BC29; margin: 15px 0 10px 0;">Dimensions :</h4>
                  <div class="grid">
                    <div class="field"><strong>Longueur :</strong> ${formData.longueur || 'Non renseigné'}</div>
                    <div class="field"><strong>Largeur :</strong> ${formData.largeur || 'Non renseigné'}</div>
                    <div class="field"><strong>Profondeur :</strong> ${formData.profondeur || 'Non renseigné'}</div>
                  </div>
                ` : ''}
              </div>

              <!-- Eau Chaude Sanitaire -->
              ${(formData.ecsOui || formData.ecsNon) ? `
                <div class="section">
                  <h3>🚿 Eau Chaude Sanitaire</h3>
                  <div class="checkbox-group">
                    ${formData.ecsOui ? '<span class="checkbox-item">✅ Oui</span>' : ''}
                    ${formData.ecsNon ? '<span class="checkbox-item">❌ Non</span>' : ''}
                  </div>
                  ${formData.nombrePersonnes || formData.nombrePointsTirage ? `
                    <div class="grid">
                      <div class="field"><strong>Nombre de personnes :</strong> ${formData.nombrePersonnes || 'Non renseigné'}</div>
                      <div class="field"><strong>Nombre de points de tirage :</strong> ${formData.nombrePointsTirage || 'Non renseigné'}</div>
                    </div>
                  ` : ''}
                </div>
              ` : ''}
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p><strong>Nextherm Applications</strong> • Cette demande nécessite un traitement prioritaire</p>
              <p>Email généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Envoyer l'email
    const to = copyToUser ? [agentEmail, userEmail] : [agentEmail];
    const { data, error } = await resend.emails.send({
      from: 'devis@nexthermapplications.fr', // Votre domaine vérifié
      to,
      subject: `🏠 Demande de devis - ${formData.entreprise || 'Entreprise non renseignée'} - ${formData.reference || 'Ref non renseignée'}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Demande de devis envoyée avec succès' 
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
