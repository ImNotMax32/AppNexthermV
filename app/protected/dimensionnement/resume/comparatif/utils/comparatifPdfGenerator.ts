'use client';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Chart as ChartJS } from 'chart.js/auto';
// Définition du type HeatingSystem directement dans ce fichier pour éviter les problèmes d'import
export interface HeatingSystem {
  name: string;
  type: string;
  icon: React.ReactNode;
  color: string;
  efficiency: number; // COP ou rendement
  maintenanceCost: number;
  installationCost: number;
  energyType: string;
  hpHcRatio?: {
    hp: number; // Pourcentage heures pleines
    hc: number; // Pourcentage heures creuses
  };
  co2Factor: number; // kg CO2/kWh
}

export interface ComparatifPdfData {
  fileName?: string;
  projectName?: string;
  buildingName?: string;
  buildingData: any;
  selectedProduct?: any;
  selectedModel?: any;
  heatingSystems: HeatingSystem[];
  yearlyEnergyNeed: number;
  selectedPeriod: number;
  chartType: 'cost' | 'co2';
  energyPrices: any;
}

// Fonction utilitaire pour s'assurer qu'une valeur est une chaîne
const ensureString = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

// Fonction utilitaire pour ajouter du texte de manière sécurisée
const addTextSafely = (doc: jsPDF, text: any, x: number, y: number, options: any = {}) => {
  const safeText = ensureString(text);
  if (safeText) {
    doc.text(safeText, x, y, options);
  }
};

// Fonction pour ajouter du texte avec retour à la ligne automatique si trop long
const addWrappedText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number): number => {
  const safeText = ensureString(text);
  if (!safeText) return y; // Retourner y inchangé si pas de texte
  
  // Si le texte est assez court, l'afficher directement
  const textWidth = doc.getStringUnitWidth(safeText) * doc.getFontSize() / doc.internal.scaleFactor;
  if (textWidth <= maxWidth) {
    doc.text(safeText, x, y);
    return y; // Retourner la même position y puisqu'une seule ligne
  }
  
  // Sinon, trouver un point de coupure
  const words = safeText.split(' ');
  let line = '';
  let currentY = y;
  const lineHeight = doc.getTextDimensions('Aj').h * 1.1; // Hauteur de ligne avec un peu d'espacement
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const testWidth = doc.getStringUnitWidth(testLine) * doc.getFontSize() / doc.internal.scaleFactor;
    
    if (testWidth > maxWidth && i > 0) {
      doc.text(line, x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  
  // Afficher la dernière ligne
  if (line.trim() !== '') {
    doc.text(line.trim(), x, currentY);
  }
  
  return currentY; // Retourner la nouvelle position y après le texte wrap
};

// Fonction pour formater les montants en euros avec espaces entre milliers
const formatEuro = (amount: number): string => {
  // Format spécial qui correspond à ce qui est visible sur l'image: '3 / 2 8 9 €'
  const integerPart = Math.floor(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return integerPart + ' €';
};

// Fonction pour formater les nombres avec séparateur d'espaces pour les milliers
const formatNumber = (value: number, decimals: number = 1): string => {
  // Arrondir et formater
  const factor = Math.pow(10, decimals);
  const roundedValue = Math.round(value * factor) / factor;
  
  // Gérer la partie entière et décimale séparément
  const parts = roundedValue.toString().split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Si on veut des décimales et qu'il n'y en a pas, ajouter des zéros
  if (decimals > 0) {
    const decimalPart = parts.length > 1 ? parts[1].padEnd(decimals, '0') : '0'.repeat(decimals);
    return integerPart + ',' + decimalPart;
  }
  return integerPart;
};

// Fonction pour calculer la consommation d'énergie annuelle
const calculateYearlyConsumption = (system: HeatingSystem, yearlyEnergyNeed: number): number => {
  return yearlyEnergyNeed / system.efficiency;
};

// Alias pour compatibilité avec le code existant
const calculateEnergyConsumption = calculateYearlyConsumption;

// Fonction pour calculer le coût annuel
const calculateYearlyCost = (system: HeatingSystem, yearlyEnergyNeed: number, energyPrices: any): number => {
  return calculateYearlyOperatingCost(system, yearlyEnergyNeed, energyPrices);
};

// Fonction pour calculer le coût annuel d'exploitation
const calculateYearlyOperatingCost = (system: HeatingSystem, yearlyEnergyNeed: number, energyPrices: any): number => {
  const energyConsumption = calculateEnergyConsumption(system, yearlyEnergyNeed);
  let energyCost = 0;

  if (system.energyType === 'electriciteHP' || system.energyType === 'electriciteHC') {
    // Pour les systèmes électriques avec heures pleines/creuses
    const hpRatio = system.hpHcRatio?.hp || 50;
    const hcRatio = system.hpHcRatio?.hc || 50;
    
    energyCost = (energyConsumption * (hpRatio / 100) * energyPrices.electriciteHP) + 
                (energyConsumption * (hcRatio / 100) * energyPrices.electriciteHC);
  } else {
    // Pour les autres types d'énergie
    energyCost = energyConsumption * energyPrices[system.energyType];
  }

  return energyCost + system.maintenanceCost;
};

// Fonction pour calculer le coût total sur une période
const calculateTotalCost = (system: HeatingSystem, years: number, yearlyEnergyNeed: number, energyPrices: any): number => {
  const installationCost = system.installationCost || 0;
  let totalCost = installationCost;
  
  // Coût d'exploitation pour chaque année
  for (let i = 0; i < years; i++) {
    const yearlyOperatingCost = calculateYearlyOperatingCost(system, yearlyEnergyNeed, energyPrices);
    totalCost += yearlyOperatingCost;
  }
  
  return totalCost;
};

// Fonction pour calculer les émissions CO2
const calculateCO2Emissions = (system: HeatingSystem, yearlyEnergyNeed: number): number => {
  const energyConsumption = calculateEnergyConsumption(system, yearlyEnergyNeed);
  return energyConsumption * system.co2Factor;
};

// Fonction pour calculer les émissions CO2 annuelles (alias pour compatibilité)
const calculateYearlyCO2 = calculateCO2Emissions;

// Fonction pour ajouter un en-tête au PDF avec logo
const addHeader = (doc: jsPDF, title: string, subtitle?: string) => {
  // Couleur de fond verte pour l'en-tête
  doc.setFillColor(134, 188, 41); // #86BC29
  doc.rect(0, 0, 210, 40, 'F');
  
  // Titre principal en blanc
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 105, 18, { align: 'center' });
  
  // Sous-titre si fourni
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 105, 26, { align: 'center' });
  }
  
  // Logo ou nom de l'entreprise
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('NEXTHERM APPLICATIONS', 20, 22);
  
  // Date et heure
  const today = new Date();
  const dateStr = today.toLocaleDateString('fr-FR');
  const timeStr = today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Généré le ${dateStr} à ${timeStr}`, 190, 22, { align: 'right' });
  
  // Ligne de séparation avec gradient visuel
  doc.setDrawColor(134, 188, 41);
  doc.setLineWidth(1);
  doc.line(20, 45, 190, 45);
  
  // Petite ligne décorative
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(20, 47, 190, 47);
};

// Fonction pour ajouter un pied de page au PDF
const addFooter = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`NEXTHERM - Comparatif des solutions de chauffage - Page ${i}/${pageCount}`, 105, 290, { align: 'center' });
  }
};

// Fonction pour créer une image de graphique comparatif amélioré
const createChartImage = async (data: ComparatifPdfData, sortedSystems: HeatingSystem[]): Promise<string> => {
    // Les systèmes sont déjà triés par la page principale
  
  return new Promise(async (resolve, reject) => {
    try {
      // Vérifier que window est défini (environnement navigateur)
      if (typeof window === 'undefined') {
        reject('Environnement SSR détecté, impossible de générer le graphique');
        return;
      }
      
      // Création d'un élément canvas temporaire pour le graphique
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 400;
      canvas.style.position = 'absolute';
      canvas.style.left = '-9999px';
      document.body.appendChild(canvas);
      
      // Définir les couleurs pour les types de chauffage
      const pacColor = 'rgba(134, 188, 41, 0.8)'; // Vert #86BC29
      const gazColor = 'rgba(59, 130, 246, 0.8)'; // Bleu
      const fioulColor = 'rgba(239, 68, 68, 0.8)'; // Rouge
      const electricColor = 'rgba(245, 158, 11, 0.8)'; // Orange
      const propaneColor = 'rgba(168, 85, 247, 0.8)'; // Violet
      const defaultColor = 'rgba(100, 100, 100, 0.8)'; // Gris par défaut
      
      // Préparation des données pour le graphique
      const labels = sortedSystems.map(system => {
        // Raccourcir les noms pour une meilleure lisibilité
        return system.name.replace('PAC Géothermique NEXTHERM', 'PAC NEXTHERM')
                          .replace('Chaudière Gaz', 'Gaz')
                          .replace('Chaudière Propane', 'Propane')
                          .replace('Chaudière Fioul', 'Fioul')
                          .replace('Radiateurs Électriques', 'Électrique');
      });
      
      // Coûts totaux sur la période pour chaque système (installation + exploitation)
      const operatingCosts = sortedSystems.map(system => {
        return calculateTotalCost(system, data.selectedPeriod, data.yearlyEnergyNeed, data.energyPrices);
      });
      
      // Calculer l'échelle optimale pour l'axe Y
      const maxValue = Math.max(...operatingCosts);
      const minValue = Math.min(...operatingCosts);
      const range = maxValue - minValue;
      
      // Si la différence est faible, utiliser une marge fixe plutôt qu'un pourcentage
      let yAxisMax, yAxisMin;
      
      if (range < maxValue * 0.5) {
        // Si les valeurs sont proches, utiliser une marge fixe
        const margin = Math.max(maxValue * 0.1, 1000); // 10% ou minimum 1000€
        yAxisMax = Math.ceil(maxValue + margin);
        yAxisMin = Math.max(0, Math.floor(minValue - margin));
      } else {
        // Si les valeurs sont éloignées, utiliser un pourcentage
        yAxisMax = Math.ceil(maxValue + (range * 0.1));
        yAxisMin = Math.max(0, Math.floor(minValue - (range * 0.1)));
      }
      
      console.log('Graphique - Valeurs calculées:', {
        operatingCosts,
        maxValue,
        minValue,
        range,
        yAxisMax,
        yAxisMin
      });
      
      // Déterminer les couleurs en fonction du type de chauffage
      const backgroundColors = sortedSystems.map(system => {
        switch(system.type) {
          case 'pac': return pacColor;
          case 'gaz': return gazColor;
          case 'fioul': return fioulColor;
          case 'electrique': return electricColor;
          case 'propane': return propaneColor;
          default: return defaultColor;
        }
      });
      
      // Création du graphique amélioré
      const chart = new ChartJS(canvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: `Coûts d'exploitation sur ${data.selectedPeriod} ans`,
              data: operatingCosts,
              backgroundColor: backgroundColors,
              borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
              borderWidth: 2,
              borderRadius: 4,
              borderSkipped: false,
            }
          ]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  size: 11,
                  weight: 'bold'
                },
                color: '#374151',
                maxRotation: 45,
                minRotation: 0
              }
            },
            y: {
              beginAtZero: false,
              min: yAxisMin,
              max: yAxisMax,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
                lineWidth: 1
              },
              ticks: {
                font: {
                  size: 11
                },
                color: '#374151',
                callback: function(value) {
                  return new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0,
                    notation: 'compact'
                  }).format(value as number);
                }
              },
              title: {
                display: true,
                text: 'Coûts (€)',
                font: {
                  size: 12,
                  weight: 'bold'
                },
                color: '#374151'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: `Comparaison des coûts totaux sur ${data.selectedPeriod} ans`,
              font: { 
                size: 16,
                weight: 'bold'
              },
              color: '#1f2937',
              padding: 20
            },
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: '#86BC29',
              borderWidth: 1,
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  return new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0
                  }).format(context.parsed.y);
                }
              }
            }
          },
          animation: {
            duration: 1500,
            easing: 'easeInOutQuart'
          }
        }
      });
      
      // Capture du graphique après un délai plus long pour s'assurer qu'il est rendu
      setTimeout(() => {
        try {
          const imgData = canvas.toDataURL('image/png');
          document.body.removeChild(canvas);
          resolve(imgData);
        } catch (error) {
          document.body.removeChild(canvas);
          reject('Erreur lors de la conversion du graphique: ' + error);
        }
      }, 500);
    } catch (error) {
      reject('Erreur lors de la génération du graphique: ' + error);
    }
  });
};

// Fonction principale pour générer le PDF
export async function generateComparatifPdf(data: ComparatifPdfData, returnBase64: boolean = false): Promise<void | string> {
  try {
    console.log('generateComparatifPdf called with data:', data);
    
    // Création du PDF
    console.log('Creating jsPDF instance...');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    console.log('jsPDF instance created successfully');

    // PAGE 1 - Informations générales et graphique des coûts
    addHeader(doc, 'COMPARATIF DES SOLUTIONS DE CHAUFFAGE');
    
    // Informations du projet
    let y = 55; // Position de départ après l'en-tête
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text('Informations du projet', 20, y);
    y += 8;
    
    // Fond pour les informations du projet
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, y, 180, 45, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, y, 180, 45, 3, 3, 'S');
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    let yContent = y + 8;
    if (data.projectName) {
      doc.setFont('helvetica', 'bold');
      doc.text('Nom du projet:', 20, yContent);
      doc.setFont('helvetica', 'normal');
      addTextSafely(doc, data.projectName, 70, yContent);
      yContent += 6;
    }
    
    if (data.buildingName) {
      doc.setFont('helvetica', 'bold');
      doc.text('Type de bâtiment:', 20, yContent);
      doc.setFont('helvetica', 'normal');
      addTextSafely(doc, data.buildingName, 70, yContent);
      yContent += 6;
    }
    
    if (data.buildingData) {
      if (data.buildingData.totalSurface) {
        doc.setFont('helvetica', 'bold');
        doc.text('Surface totale:', 20, yContent);
        doc.setFont('helvetica', 'normal');
        addTextSafely(doc, `${data.buildingData.totalSurface} m²`, 70, yContent);
        yContent += 6;
      }
      
      if (data.buildingData.constructionYear) {
        doc.setFont('helvetica', 'bold');
        doc.text('Année de construction:', 20, yContent);
        doc.setFont('helvetica', 'normal');
        addTextSafely(doc, `${data.buildingData.constructionYear}`, 70, yContent);
        yContent += 6;
      }
      
      if (data.buildingData.heatLoss) {
        doc.setFont('helvetica', 'bold');
        doc.text('Déperditions totales:', 20, yContent);
        doc.setFont('helvetica', 'normal');
        addTextSafely(doc, `${formatNumber(data.buildingData.heatLoss)} W (${formatNumber(data.buildingData.heatLoss/1000, 1)} kW)`, 70, yContent);
        yContent += 6;
      }
    }
    
    y = y + 50; // Position après la section projet
    
    // Solution sélectionnée et paramètres (côte à côte)
    y += 10; // Espacement avant la section
    
    // Solution sélectionnée (colonne gauche)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text('Solution sélectionnée', 20, y);
    
    // Fond pour la solution sélectionnée
    doc.setFillColor(240, 250, 230);
    doc.roundedRect(15, y + 5, 85, 50, 3, 3, 'F');
    doc.setDrawColor(134, 188, 41);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, y + 5, 85, 50, 3, 3, 'S');
    
    // Informations sur le produit
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    
    let ySol = y + 12;
    if (data.selectedProduct) {
      const productName = data.selectedProduct.name || data.selectedProduct.Nom || 'Non spécifié';
      doc.setFont('helvetica', 'bold');
      doc.text('Produit:', 20, ySol);
      doc.setFont('helvetica', 'normal');
      addWrappedText(doc, productName, 50, ySol, 40);
      ySol += 8;
    }
    
    if (data.selectedModel) {
      const modelName = data.selectedModel.name || data.selectedModel.modele || 'Non spécifié';
      doc.setFont('helvetica', 'bold');
      doc.text('Modèle:', 20, ySol);
      doc.setFont('helvetica', 'normal');
      addWrappedText(doc, modelName, 50, ySol, 40);
      ySol += 8;
      
      const puissance = data.selectedModel.puissance || data.selectedModel.puissance_calo || '?';
      doc.setFont('helvetica', 'bold');
      doc.text('Puissance:', 20, ySol);
      doc.setFont('helvetica', 'normal');
      addTextSafely(doc, `${puissance} kW`, 50, ySol);
      ySol += 6;
      
      const cop = data.selectedModel.cop || data.selectedModel.COP || '-';
      doc.setFont('helvetica', 'bold');
      doc.text('COP:', 20, ySol);
      doc.setFont('helvetica', 'normal');
      addTextSafely(doc, cop, 50, ySol);
    }

    // Paramètres du calcul (colonne droite)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text('Paramètres du calcul', 110, y);

    // Fond pour les paramètres
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(105, y + 5, 85, 50, 3, 3, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.roundedRect(105, y + 5, 85, 50, 3, 3, 'S');

    // Informations sur les paramètres
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    let yParams = y + 12;

    doc.setFont('helvetica', 'bold');
    doc.text('Besoin énergétique:', 110, yParams);
    doc.setFont('helvetica', 'normal');
    addTextSafely(doc, `${formatNumber(data.yearlyEnergyNeed/1000, 1)} MWh/an`, 150, yParams);
    yParams += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Prix électricité HP:', 110, yParams);
    doc.setFont('helvetica', 'normal');
    addTextSafely(doc, `${formatNumber(data.energyPrices.electriciteHP, 4)} €/kWh`, 150, yParams);
    yParams += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Prix électricité HC:', 110, yParams);
    doc.setFont('helvetica', 'normal');
    addTextSafely(doc, `${formatNumber(data.energyPrices.electriciteHC, 4)} €/kWh`, 150, yParams);
    yParams += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Prix gaz:', 110, yParams);
    doc.setFont('helvetica', 'normal');
    const gazPrice = data.energyPrices.gaz || data.energyPrices.gazVille || 0;
    addTextSafely(doc, `${formatNumber(gazPrice, 4)} €/kWh`, 150, yParams);
    yParams += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Période d\'étude:', 110, yParams);
    doc.setFont('helvetica', 'normal');
    addTextSafely(doc, `${data.selectedPeriod} ans`, 150, yParams);

    y += 65; // Position après les deux colonnes

    // Passer à une nouvelle page pour le nouveau tableau
    doc.addPage();
    addHeader(doc, 'TABLEAU COMPARATIF DÉTAILLÉ');
    y = 55;

    // Nouveau tableau comparatif - Design moderne et épuré
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(50, 50, 50);
    doc.text(`Comparatif détaillé sur ${data.selectedPeriod} ans`, 20, y);
    y += 15;

    // Les systèmes sont déjà triés par la page principale
    const sortedSystems = data.heatingSystems;

    // Configuration du nouveau tableau
    const pageWidth = 210;
    const leftMargin = 20;
    const rightMargin = 20;
    const tableWidth = pageWidth - leftMargin - rightMargin;
    const startX = leftMargin;
    
    // Largeurs des colonnes pour le nouveau tableau
    const colWidths = [60, 30, 30, 30, 30]; // Solution, Coût total, Coût/an, Conso, CO2
    
    // En-tête du nouveau tableau avec design moderne
    const headerHeight = 15;
    
    // Fond de l'en-tête avec dégradé simulé
    doc.setFillColor(134, 188, 41); // Vert #86BC29
    doc.roundedRect(startX, y, tableWidth, headerHeight, 3, 3, 'F');
    
    // Bordure de l'en-tête
    doc.setDrawColor(134, 188, 41);
    doc.setLineWidth(0.8);
    doc.roundedRect(startX, y, tableWidth, headerHeight, 3, 3, 'S');
    
    // Texte de l'en-tête
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    
    let x = startX;
    doc.text('Solution', x + 8, y + 10);
    x += colWidths[0];
    
    doc.text('Coût total', x + 2, y + 10);
    x += colWidths[1];
    
    doc.text('Coût/an', x + 2, y + 10);
    x += colWidths[2];
    
    doc.text('Conso', x + 2, y + 10);
    x += colWidths[3];
    
    doc.text('CO2/an', x + 2, y + 10);

    y += headerHeight + 5;

    // Dessiner les lignes du nouveau tableau
    sortedSystems.forEach((system, index) => {
      const yearlyConsumption = calculateYearlyConsumption(system, data.yearlyEnergyNeed);
      const yearlyCost = calculateYearlyOperatingCost(system, data.yearlyEnergyNeed, data.energyPrices);
      const totalCost = calculateTotalCost(system, data.selectedPeriod, data.yearlyEnergyNeed, data.energyPrices);
      const yearlyCO2 = calculateYearlyCO2(system, data.yearlyEnergyNeed);

      // Vérifier si on doit passer à une nouvelle page
      if (y > 250) {
        doc.addPage();
        addHeader(doc, 'TABLEAU COMPARATIF DÉTAILLÉ (SUITE)');
        y = 55;

        // Redessiner l'en-tête du tableau
        doc.setFillColor(134, 188, 41);
        doc.roundedRect(startX, y, tableWidth, headerHeight, 3, 3, 'F');
        doc.setDrawColor(134, 188, 41);
        doc.setLineWidth(0.8);
        doc.roundedRect(startX, y, tableWidth, headerHeight, 3, 3, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);

        x = startX;
        doc.text('Solution', x + 8, y + 10);
        x += colWidths[0];
        doc.text('Coût total', x + 2, y + 10);
        x += colWidths[1];
        doc.text('Coût/an', x + 2, y + 10);
        x += colWidths[2];
        doc.text('Conso', x + 2, y + 10);
        x += colWidths[3];
        doc.text('CO2/an', x + 2, y + 10);

        y += headerHeight + 5;
      }

      const rowHeight = 14;

      // Fond de la ligne avec alternance de couleurs
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252); // Gris très clair
      } else {
        doc.setFillColor(255, 255, 255); // Blanc
      }
      doc.roundedRect(startX, y, tableWidth, rowHeight, 2, 2, 'F');

      // Barre de couleur à gauche selon le type de chauffage
      let systemColor;
      switch(system.type) {
        case 'pac':
          systemColor = [134, 188, 41]; // Vert #86BC29
          break;
        case 'gaz':
          systemColor = [59, 130, 246]; // Bleu
          break;
        case 'fioul':
          systemColor = [239, 68, 68]; // Rouge
          break;
        case 'electrique':
          systemColor = [245, 158, 11]; // Orange
          break;
        case 'propane':
          systemColor = [168, 85, 247]; // Violet
          break;
        default:
          systemColor = [100, 100, 100]; // Gris par défaut
      }

      // Barre de couleur à gauche
      doc.setFillColor(systemColor[0], systemColor[1], systemColor[2]);
      doc.roundedRect(startX, y, 5, rowHeight, 2, 0, 'F');

      // Bordure de la ligne
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(startX, y, tableWidth, rowHeight, 2, 2, 'S');

      // Texte de la ligne
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      // Mettre en gras et en vert la solution la moins chère
      if (index === 0) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(134, 188, 41); // Vert pour la meilleure solution
      } else {
        doc.setTextColor(80, 80, 80);
      }

      // Afficher le nom du système
      let xPos = startX + 10;
      const maxSystemNameWidth = colWidths[0] - 15;
      addWrappedText(doc, system.name, xPos, y + 9, maxSystemNameWidth);
      xPos += colWidths[0];

      // Afficher le coût total
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      const formattedTotalCost = formatEuro(totalCost);
      doc.text(formattedTotalCost, xPos + 2, y + 9);
      xPos += colWidths[1];

      // Afficher le coût annuel
      const formattedYearlyCost = formatEuro(yearlyCost);
      doc.text(formattedYearlyCost, xPos + 2, y + 9);
      xPos += colWidths[2];

      // Afficher la consommation annuelle
      const formattedConsumption = formatNumber(yearlyConsumption / 1000, 1);
      doc.text(formattedConsumption, xPos + 2, y + 9);
      xPos += colWidths[3];

      // Afficher les émissions CO2 avec couleur selon l'intensité
      const co2Value = yearlyCO2 / 1000; // Convertir en tonnes

      // Définir la couleur selon l'intensité des émissions CO2
      if (co2Value < 1) {
        doc.setTextColor(34, 197, 94); // Vert pour faibles émissions
      } else if (co2Value < 3) {
        doc.setTextColor(245, 158, 11); // Orange pour émissions moyennes
      } else {
        doc.setTextColor(239, 68, 68); // Rouge pour émissions élevées
      }

      const formattedCO2 = formatNumber(co2Value, 1);
      doc.text(formattedCO2, xPos + 2, y + 9);

      y += rowHeight + 2;
    });
    
    // Ajouter la légende pour les types de chauffage
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text('Légende des solutions', 20, y);
    
    const legendItems = [
      { label: 'PAC', color: [134, 188, 41] },
      { label: 'Gaz', color: [59, 130, 246] },
      { label: 'Fioul', color: [239, 68, 68] },
      { label: 'Électrique', color: [245, 158, 11] },
      { label: 'Propane', color: [168, 85, 247] }
    ];
    
    // Afficher les items de la légende
    const yLegend = y + 8;
    legendItems.forEach((item, index) => {
      const x = 20 + (index * 35);
      
      // Rectangle coloré
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.rect(x, yLegend, 4, 4, 'F');
      
      // Texte de la légende
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text(item.label, x + 8, yLegend + 3);
    });
    
    y += 20;
    
    // Ajouter une note de bas de page
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('* Les calculs sont basés sur les prix actuels de l\'énergie et peuvent varier dans le temps.', 20, 280);
    
    // PAGE 3 - Graphiques et détails supplémentaires
    doc.addPage();
    addHeader(doc, 'GRAPHIQUES COMPARATIFS');
    
    // Texte explicatif
    y = 55;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('Ce document présente une analyse comparative des différentes solutions de chauffage', 20, y);
    y += 6;
    doc.text(`pour votre projet sur une période de ${data.selectedPeriod} ans.`, 20, y);
    y += 15;
    
    // Titre du graphique
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Comparaison des coûts totaux sur ${data.selectedPeriod} ans`, 105, y, { align: 'center' });
    y += 10;
    
    // Génération du graphique comparatif des coûts
    if (typeof window !== 'undefined') {
      try {
        // Générer l'image du graphique
        const chartImage = await createChartImage(data, sortedSystems);
        
        // Ajouter l'image au PDF (position centrée et plus grande)
        doc.addImage(chartImage, 'PNG', 15, y, 180, 120);
        y += 130;
      } catch (error) {
        console.error('Erreur lors de la génération du graphique:', error);
        y += 10;
        doc.text('Graphique non disponible', 20, y);
        y += 15;
      }
    } else {
      // Si côté serveur, indiquer que le graphique sera généré côté client
      y += 10;
      doc.text('Le graphique sera généré lors de l\'affichage du PDF', 20, y);
      y += 15;
    }
    
    // Économies réalisées
    if (sortedSystems.length >= 2) {
      const bestSystem = sortedSystems[0];
      const worstSystem = sortedSystems[sortedSystems.length - 1];
      
      const bestTotalCost = calculateTotalCost(bestSystem, data.selectedPeriod, data.yearlyEnergyNeed, data.energyPrices);
      const worstTotalCost = calculateTotalCost(worstSystem, data.selectedPeriod, data.yearlyEnergyNeed, data.energyPrices);
      const savings = worstTotalCost - bestTotalCost;
      
      // Fond pour les économies
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(15, y, 180, 30, 3, 3, 'F');
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, y, 180, 30, 3, 3, 'S');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(22, 163, 74);
      doc.text('Économies potentielles', 20, y + 8);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`En choisissant ${bestSystem.name} plutôt que ${worstSystem.name},`, 20, y + 18);
      doc.text(`vous économisez ${formatEuro(savings)} sur ${data.selectedPeriod} ans.`, 20, y + 26);
      
      y += 40;
    }
    
    // Conclusion
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text('Conclusion', 20, y);
    y += 8;
    
    // Fond pour la conclusion
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, y, 180, 25, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, y, 180, 25, 3, 3, 'S');
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    // Ajouter la conclusion avec le meilleur système
    if (sortedSystems.length > 0) {
      const bestSystem = sortedSystems[0];
      doc.text(`La solution ${bestSystem.name} présente le meilleur rapport coût/performance`, 20, y + 8);
      doc.text(`sur une période de ${data.selectedPeriod} ans pour votre projet.`, 20, y + 16);
    }
    
    // Ajouter le pied de page
    addFooter(doc);
    
    // Sauvegarde du PDF ou retour en base64
    console.log('Saving PDF...');
    if (returnBase64) {
      console.log('Returning PDF as base64 string');
      return doc.output('datauristring');
    } else {
      const fileName = data.fileName || 'comparatif_solutions.pdf';
      console.log(`Saving PDF as ${fileName}`);
      doc.save(fileName);
      console.log('PDF saved successfully');
    }
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
};
