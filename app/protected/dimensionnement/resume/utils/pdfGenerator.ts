'use client';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Chart as ChartJS } from 'chart.js/auto';

export interface ClientInfo {
  name?: string;
  address?: string;
  phone?: string;
  postalCode?: string;
  city?: string;
}

export interface InstallerInfo {
  company?: string;
  contact?: string;
  email?: string;
  phone?: string;
  logo?: Blob;
}

export interface BuildingData {
  constructionYear?: string;
  buildingType?: string;
  totalSurface?: number;
  structure?: string;
  groundStructure?: string;
  windowSurface?: string;
  adjacency?: string;
  heatLoss?: string;
  heatingTemp?: string;
  department?: string;
  ventilation?: string;
}

export interface ProductModel {
  puissance_calo?: number;
  cop?: number;
  etas?: number;
}

export interface SelectedProduct {
  Nom: string;
  selectedModel?: ProductModel;
  Emetteur?: {
    max: number;
  };
}

export interface GeneratePdfData {
  fileName?: string;
  projectName?: string;
  referenceNumber?: string;
  clientInfo?: ClientInfo;
  installerInfo?: InstallerInfo;
  building: BuildingData;
  selectedProduct?: SelectedProduct;
  parameters?: any; // Ajoutez les types spécifiques si nécessaire
}

// Type pour les températures départementales
export type DepartementalTemperatures = {
  [key: string]: number;
}

// Fonction utilitaire pour s'assurer qu'une valeur est une chaîne
const ensureString = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

// Fonction utilitaire pour ajouter du texte de manière sécurisée
const addTextSafely = (doc: jsPDF, text: any, x: number, y: number, options = {}) => {
  const safeText = ensureString(text);
  if (safeText) {
    doc.text(safeText, x, y, options);
  }
};

// Fonction utilitaire pour calculer les dimensions du logo
const calculateLogoDimensions = (originalWidth: number, originalHeight: number, maxWidth: number, maxHeight: number) => {
  let newWidth = originalWidth;
  let newHeight = originalHeight;

  if (newWidth > maxWidth) {
    newHeight = (newHeight * maxWidth) / newWidth;
    newWidth = maxWidth;
  }

  if (newHeight > maxHeight) {
    newWidth = (newWidth * maxHeight) / newHeight;
    newHeight = maxHeight;
  }

  return { width: newWidth, height: newHeight };
};

const departementalTemperatureData: DepartementalTemperatures = {
  "01": -10, "02": -7, "03": -8, "04": -8, "05": -10, "06": -5, "07": -6, "08": -10, "09": -5,
  "10": -10, "11": -5, "12": -8, "13": -5, "14": -7, "15": -8, "16": -5, "17": -5, "18": -7,
  "19": -8, "20": -2, "21": -10, "22": -4, "23": -8, "24": -5, "25": -12, "26": -6, "27": -7,
  "28": -7, "29": -4, "30": -5, "31": -5, "32": -5, "33": -5, "34": -5, "35": -4, "36": -7,
  "37": -7, "38": -10, "39": -10, "40": -5, "41": -7, "42": -10, "43": -8, "44": -5, "45": -7,
  "46": -6, "47": -5, "48": -8, "49": -7, "50": -4, "51": -10, "52": -12, "53": -7, "54": -15,
  "55": -12, "56": -4, "57": -15, "58": -10, "59": -9, "60": -7, "61": -7, "62": -9, "63": -8,
  "64": -5, "65": -5, "66": -5, "67": -15, "68": -15, "69": -10, "70": -10, "71": -10, "72": -7,
  "73": -10, "74": -10, "75": -5, "76": -7, "77": -7, "78": -7, "79": -7, "80": -9, "81": -5,
  "82": -5, "83": -5, "84": -6, "85": -5, "86": -7, "87": -8, "88": -15, "89": -10, "90": -15,
  "91": -7, "92": -7, "93": -7, "94": -7, "95": -7
};


const getTemperatureFactor = (departmentNumber: string): number | null => {
  // Nettoyer le numéro de département (enlever tout sauf les chiffres)
  const cleanDepartment = departmentNumber.replace(/\D/g, '');
  return departementalTemperatureData[cleanDepartment] || null;
};
// Remplacer la fonction createDonutChartForPdf par :
const displayHeatLossDetails = (doc: jsPDF, data: BuildingData) => {
  try {
    // Position de départ modifiée
    const startX = 120;  // Augmenté pour déplacer vers la droite
    let startY = 200;    // Augmenté pour déplacer vers le bas
    const lineSpacing = 8;

    // Configuration du texte
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(132, 189, 0);

    // Titre
    doc.text('Détail des déperditions :', startX, startY);
    startY += lineSpacing + 2;

    // Configuration pour les valeurs
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(81, 83, 74);

    const values = {
      mur: sessionStorage.getItem('ResultatDeperdition') || '0',
      fenetre: sessionStorage.getItem('windowHeatLoss') || '0',
      toit: sessionStorage.getItem('roofHeatLoss') || '0',
      sol: sessionStorage.getItem('FloorHeatLoss') || '0',
      air: sessionStorage.getItem('airNeufLoss') || '0',
      pont: sessionStorage.getItem('thermalBridgeLoss') || '0'
    };

    const items = [
      { label: 'Murs :', value: values.mur },
      { label: 'Fenêtres :', value: values.fenetre },
      { label: 'Toiture :', value: values.toit },
      { label: 'Sol :', value: values.sol },
      { label: "Renouvellement d'air :", value: values.air },
      { label: 'Ponts thermiques :', value: values.pont }
    ];

    items.forEach(item => {
      const formattedValue = `${parseFloat(item.value).toFixed(1)} W`;
      const text = `${item.label} ${formattedValue}`;
      doc.text(text, startX, startY);
      startY += lineSpacing;
    });

    console.log('Détails des déperditions ajoutés au PDF avec succès à la position:', { x: startX, y: startY });
  } catch (error) {
    console.error('Erreur lors de l\'ajout des détails des déperditions:', error);
  }
};

// Fonction utilitaire pour vérifier si une image est valide
const isValidImageData = (imageData: string): boolean => {
  return imageData.startsWith('data:image/png;base64,') && imageData.length > 100;
};

const determineImagePath = (data: GeneratePdfData): string => {
  // Log pour debug
  console.log("Building data:", data.building);
  console.log("Product data:", data.selectedProduct);
  
  // Récupérer les données de la pompe à chaleur du localStorage
  const type_pac = localStorage.getItem('type_pac');
  const systeme_pac = localStorage.getItem('systeme_pac');
  
  // Déterminer le type de capteur et l'eau de nappe en fonction du système PAC
  let typeCapteur = null;
  let eauDeNappe = null;
  
  if (systeme_pac === 'Sol/Sol') {
    typeCapteur = 'Horizontal';
    eauDeNappe = 'Non';
  } else if (systeme_pac === 'Eau/Eau') {
    typeCapteur = 'Vertical';
    eauDeNappe = 'Oui';
  } else if (systeme_pac === 'Sonde/Eau') {
    typeCapteur = 'Vertical';
    eauDeNappe = 'Non';
  }

  const type = data.building.buildingType;

  console.log("Type PAC:", type_pac);
  console.log("Système PAC:", systeme_pac);
  console.log("Type capteur déterminé:", typeCapteur);
  console.log("Eau de nappe déterminé:", eauDeNappe);
  console.log("Type de construction:", type);

  if (typeCapteur === "Vertical" && eauDeNappe === "Oui") {
    switch(type) {
      case "RDC":
        return '/assets/img/RDCN.png';
      case "1 Étage":
        return '/assets/img/1N.png';
      case "2 Étages":
        return '/assets/img/2N.png';
      default:
        return '/assets/img/ML1Etage.png';
    }
  } 
  
  if (typeCapteur === "Horizontal") {
    switch(type) {
      case "RDC":
        return '/assets/img/RDCH.png';
      case "1 Étage":
        return '/assets/img/1H.png';
      case "2 Étages":
        return '/assets/img/2H.png';
      default:
        return '/assets/img/ML1Etage.png';
    }
  }
  
  if (typeCapteur === "Vertical" && eauDeNappe === "Non") {
    switch(type) {
      case "RDC":
        return '/assets/img/RDCV.png';
      case "1 Étage":
        return '/assets/img/1V.png';
      case "2 Étages":
        return '/assets/img/2V.png';
      default:
        return '/assets/img/ML1Etage.png';
    }
  }
  
  return '/assets/img/ML1Etage.png';
};

// Fonction pour déterminer l'image du produit
const getProductImagePath = (productName: string): string => {
  // Convertir en minuscules pour une comparaison insensible à la casse
  const normalizedName = productName.toLowerCase();
  
  if (normalizedName.includes("optipackduo")) {
    return '/assets/img/DUOCD.jpg';
  } else if (normalizedName.includes("optipack")) {
    return '/assets/img/OPTICD.jpg';
  } else if (normalizedName.includes("smartpack")) {
    return '/assets/img/SPCD.jpg';
  }
  
  console.log(`Product image not found for: ${productName}, using default image`);
  return '/assets/img/default.jpg';
};

const loadImage = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";  // Important pour éviter les erreurs CORS
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    // Utilisez window.location.origin pour obtenir l'URL absolue
    img.src = `${window.location.origin}${src}`;
  });
};

// Fonction utilitaire pour ajouter le footer
const addFooter = (doc: jsPDF) => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(81, 83, 74);
  const pageCenter = doc.internal.pageSize.getWidth() / 2;
  
  // Première ligne
  doc.text('SAS NEXTHERM - immatriculée sous le SIREN 490711850', pageCenter, 290, { align: 'center' });
  // Deuxième ligne
  doc.text('Siège social : 30 Rue Maryse Bastié, ZA de Clairac, Beaumont-lès-Valence 26760', pageCenter, 294, { align: 'center' });
};

export async function generateModernPdf(data: GeneratePdfData): Promise<void> {
  
  try {
    // Création du PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Chargement asynchrone des images
    const formulaireImg = await loadImage('/assets/img/formulaire.jpg');
    const page2Img = await loadImage('/assets/img/page2.png');
    const page3Img = await loadImage('/assets/img/page3.png');
    const departmentNumber = data.building.department ? 
      data.building.department.replace(/\D/g, '') : 
      null;
    const temperatureExterieure = departmentNumber ? 
      getTemperatureFactor(departmentNumber) : 
      null;


    // PAGE 1
    doc.addImage(formulaireImg, 'JPEG', 0, 0, 210, 297);
    
    // Configuration du texte pour les titres
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    // Titres principaux
    addTextSafely(doc, "Référence dossier", 20, 240);
    addTextSafely(doc, "Information client particulier", 20, 249);
    addTextSafely(doc, "Information installateur", 110, 249);

    // Configuration du texte pour le contenu
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    // Référence dossier
    const reference = data.fileName || data.projectName || data.referenceNumber;
    addTextSafely(doc, reference, 56, 240);

    // Informations client
    const clientInfo = data.clientInfo || {};
    addTextSafely(doc, "Nom : ", 25, 257.8);
    addTextSafely(doc, clientInfo.name, 48.021, 257.8);
    
    addTextSafely(doc, "Adresse : ", 25, 263);
    addTextSafely(doc, clientInfo.address, 48.021, 263);
    
    addTextSafely(doc, "Téléphone : ", 25, 268.5);
    addTextSafely(doc, clientInfo.phone, 48.021, 268.5);
    
    addTextSafely(doc, "Ville : ", 25, 273.3);
    addTextSafely(doc, clientInfo.city, 48.021, 273.3);
    
    addTextSafely(doc, "Code postal : ", 25, 279.3);
    addTextSafely(doc, clientInfo.postalCode, 48.021, 279.3);

    // Informations installateur
    const installerInfo = data.installerInfo || {};
    addTextSafely(doc, "Société : ", 125, 257.8);
    addTextSafely(doc, installerInfo.company, 147.521, 257.8);
    
    addTextSafely(doc, "Interlocuteur : ", 125, 263);
    addTextSafely(doc, installerInfo.contact, 147.521, 263);
    
    addTextSafely(doc, "Adresse mail : ", 125, 268.5);
    addTextSafely(doc, installerInfo.email, 147.521, 268.5);
    
    addTextSafely(doc, "Téléphone : ", 125, 273.3);
    addTextSafely(doc, installerInfo.phone, 147.521, 273.3);

    // PAGE 2
    doc.addPage();
    doc.addImage(page2Img, 'JPEG', 0, 0, 210, 297);

    // Configuration des dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    // Configuration des blocs
    const boxWidth = pageWidth / 2 - 5;
    const boxHeight = 70;
    const box1X = 10;
    const box2X = box1X + boxWidth - 10;
    const boxY = 95;
    const newBoxY = 40;

    // Récupération des données depuis les éléments cachés
    const getData = (id: string): string => {
      const element = document.getElementById(id);
      return element ? element.textContent || '' : '';
    };

   // Déperdition totale
const resultDeperdition = getData('result_deperdition2');
if (resultDeperdition) {
  doc.setFontSize(60);
  doc.setTextColor(132, 189, 0);
  const textHeight = doc.getTextDimensions(resultDeperdition).h;
  const textY = newBoxY + (boxHeight / 3) + (textHeight / 4);
  doc.text(`${resultDeperdition} kW`, box1X + boxWidth * 1.2 / 2, textY, { align: 'center' });
}

    // Titres des sections
    doc.setFont('UniversBlack');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("Bâtiment", box1X + (boxWidth - 10) / 2, boxY + 10, { align: 'center' });
    doc.text("Chauffage", box2X + (boxWidth - 10) / 2, boxY + 10, { align: 'center' });

    // Information bâtiment
    const batimentInfos = [
      { label: "Année de construction :", value: data.building.constructionYear },
      { label: "Type de construction :", value: data.building.buildingType },
      { label: "Surface totale :", value: `${data.building.totalSurface} m²` },
      { label: "Structure de la construction :", value: data.building.structure },
      { label: "Structure du sol :", value: data.building.groundStructure },
      { label: "Surface vitrage :", value: data.building.windowSurface },
      { label: "Mitoyenneté :", value: data.building.adjacency }
    ];

    const chauffageInfos = [
      { label: "Déperdition de la maison :", value: `${data.building.heatLoss} kW` },
      { label: "Température de chauffage :", value: data.building.heatingTemp },
      { label: "Département :", value: data.building.department },
      { label: "Type de ventilation :", value: data.building.ventilation },
      { label: "Température extérieure :", value: temperatureExterieure ? `${temperatureExterieure}°C` : "Non disponible" }
    ];

    // Déperdition en haut de page
    doc.setFontSize(60);
    doc.setTextColor(132, 189, 0); // #84bd00
    const deperditionText = data.building.heatLoss || '';
    const textHeight = doc.getTextDimensions(`${deperditionText} kW`).h;
    const textY = newBoxY + (boxHeight / 3) + (textHeight / 4);
    doc.text(`${deperditionText} kW`, box1X + boxWidth * 1.2 / 2, textY, { align: 'center' });

    // Ajout des informations dans les blocs
    doc.setFont('helvetica');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);

    let posY = boxY + 20;
    let posX = box1X + 13;
    const lineSpacing = 6;

    // Bloc bâtiment
    batimentInfos.forEach(info => {
      doc.text(`${info.label} ${info.value}`, posX, posY);
      posY += lineSpacing;
    });

    // Bloc chauffage
    // Après avoir ajouté toutes les informations dans les blocs
    posY = boxY + 20;
    posX = box2X + 13;
    chauffageInfos.forEach(info => {
      doc.text(`${info.label} ${info.value}`, posX, posY);
      posY += lineSpacing;
    });

    // Ajouter le disclaimer
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6);
    doc.setTextColor(81, 83, 74);
    const pageCenter = doc.internal.pageSize.getWidth() / 2;
    const disclaimerText = "*Les informations fournies sont une estimation basée sur des critères spécifiques et n'engagent en rien la responsabilité de Nextherm sur le dimensionnement de l'installation. De plus, elles ne remplacent pas un véritable diagnostic nécessaire pour l'installation.";
    doc.text(disclaimerText, pageCenter, 162, { align: 'center', maxWidth: 180 });

    // Titre principal (descendu de 3px supplémentaires)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(23);
    doc.setTextColor(81, 83, 74);
    doc.text("Données nécessaire prime CEE", pageCenter, 175, { align: 'center' });

    // Sous-titre en vert
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(134, 188, 41);
    doc.text("Selon courrier officiel du 01/08/2022 (https//www.prime-energie-edf.fr)", pageCenter, 180, { align: 'center' });

    // Description en deux paragraphes
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(81, 83, 74);
    const chartMargin = 10;
    const chartContentWidth = doc.internal.pageSize.getWidth() - (2 * chartMargin);

    doc.text("Les données présentées ci-dessous incluent les déperditions thermiques de votre logement, les caractéristiques techniques de la pompe à chaleur sélectionnée, ainsi que les différents seuils de puissance requis.", chartMargin, 187, { align: 'justify', maxWidth: chartContentWidth });

    doc.text("Tous les calculs ont été effectués en considérant uniquement les pièces desservies par le réseau de chauffage, sans prise en compte d'éventuels générateurs complémentaires. Ce document constitue une pièce justificative essentielle pour votre dossier CEE.", chartMargin, 200, { align: 'justify', maxWidth: chartContentWidth });

    // Configuration pour le tableau (remonté de 5px)
    const startY = 215;
    const col1Width = 85;
    const col2Width = 100;
    const lineHeight = 7;
    const col1X = 10;
    const col2X = 105;

    // Style pour les items et sous-items
    const addTableItem = (x: number, y: number, title: string, description: string, value: string, subItems?: { label: string, value: string }[]) => {
        const isPoints7to10 = title.startsWith("7 -") || title.startsWith("8 -") || title.startsWith("9 -") || title.startsWith("10 -");
        const isPoints7or8 = title.startsWith("7 -") || title.startsWith("8 -");
        
        // Titre
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        // Ajout d'un offset vertical pour les points 7-10
        const titleY = isPoints7to10 ? y + 2 : y;
        doc.text(title, x, titleY);
        
        // Description
        if (description) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(81, 83, 74);
            const maxWidth = x === col1X ? col1Width - 5 : col2Width;
            const descY = isPoints7to10 ? y + 5 : y + 3.5;
            doc.text(description, x, descY, { align: 'left', maxWidth: maxWidth });
        }
        
        // Valeur standard (pour les points 1-6)
        if (value && !isPoints7to10) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            let valueOffset = 28; // Augmenté de 5
            if (title.startsWith("2 -")) valueOffset = 72; // Augmenté de 5
            if (title.startsWith("3 -")) valueOffset = 48; // Augmenté de 5
            if (title.startsWith("4 -")) valueOffset = 76; // Augmenté de 5
            if (title.startsWith("5 -")) valueOffset = 80; // Augmenté de 5
            doc.text(value, x + valueOffset, y);
        }

        // Sous-items (températures pour points 7-10)
        if (subItems && isPoints7to10) {
            // Points 7 et 8 commencent plus bas pour éviter le chevauchement avec la description
            let subY = isPoints7or8 ? y + 12 : y + 8;
            const xOffset = x === col2X ? 15 : 5;
            
            subItems.forEach((item, index) => {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.text(`À ${item.label} :`, x + xOffset, subY);
                doc.text(item.value, x + xOffset + 35, subY);
                subY += 4; // Réduit de 5 à 4 pour rapprocher les lignes
            });
            
            // Hauteur plus grande pour les points 7 et 8
            return isPoints7or8 ? 20 : 16;
        }

        return lineHeight;
    };

    // Première colonne
    let currentY = startY;
    addTableItem(col1X, currentY, "1 - Tbase en °C :", 
        "(La température extérieure minimum régionale qui est en dessous de 0°C partout en France)", 
        `${temperatureExterieure}°C`);
    currentY += lineHeight * 2;

    addTableItem(col1X, currentY, "2 - Déperditions thermique à Tbase en W :", 
        "(La déperdition thermique totale de votre logement à la température extérieure minimum régionale)", 
        `${data.building.heatLoss}`);
    currentY += lineHeight * 2;

    addTableItem(col1X, currentY, "3 - Temp d'arrêt de la PAC :", 
        "(La température à laquelle la pompe à chaleur arrête de fonctionner)", 
        "Géothermie pas affecté");
    currentY += lineHeight * 2;

    addTableItem(col1X, currentY, "4 - Déperditions thermique à T d'arrêt en W :", 
        "(La déperdition thermique totale de votre logement à la température d'arrêt de la pompe à chaleur)", 
        "X");
    currentY += lineHeight * 2;

    addTableItem(col1X, currentY, "5 - Surface desservies par le réseau de la PAC :", 
        "(La surface totale des pièces desservies par le chauffage)", 
        `${data.building.totalSurface} m²`);

    // Deuxième colonne
    currentY = startY;
    const puissancePac = data.selectedProduct?.selectedModel?.puissance_calo ? `${data.selectedProduct.selectedModel.puissance_calo * 1000}` : '';

    // Point 7
    currentY += addTableItem(col2X, currentY, "7 - Pui de la PAC à 60% des déperditions (W) :",
        "(La puissance de la pompe à chaleur à 60% des déperditions thermiques totales de votre logement)",
        "", [
            { label: "température de base", value: puissancePac },
            { label: "température d'arrêt", value: "X" }
        ]);

    // Point 8
    currentY += addTableItem(col2X, currentY, "8 - Pui de la PAC à 140% des déperditions :",
        "(La puissance de la pompe à chaleur à 140% des déperditions thermiques totales de votre logement)",
        "", [
            { label: "température de base", value: puissancePac },
            { label: "température d'arrêt", value: "X" }
        ]);

    // Point 9
    currentY += addTableItem(col2X, currentY, "9 - Pui de la PAC en (W) :",
        "(La puissance de la pompe à chaleur sélectionnée)",
        "", [
            { label: "température de base", value: puissancePac },
            { label: "température d'arrêt", value: "X" }
        ]);

    // Point 10
    currentY += addTableItem(col2X, currentY, "10 - Temp d'eau pour la puissance de la PAC :",
        "(La température d'eau pour la puissance de la pompe à chaleur sélectionnée)",
        "", [
            { label: "température de base", value: `${data.selectedProduct?.Emetteur?.max}°C` },
            { label: "température d'arrêt", value: "X" }
        ]);

    // Ajouter le footer à la page 2
    addFooter(doc);

    // PAGE 3
    doc.addPage();
    doc.addImage(page3Img, 'JPEG', 0, 0, 210, 297);

    if (data.selectedProduct) {
      // Image du produit
      const productImagePath = getProductImagePath(data.selectedProduct.Nom);
      const productImg = await loadImage(productImagePath);

      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = productImagePath;
      });

      // Définir les dimensions maximales
      const maxWidth = 130;
      const maxHeight = 110;

      // Calculer les dimensions en conservant les proportions
      let width = maxWidth;
      let height = maxWidth * (img.height / img.width);

      // Si la hauteur dépasse le maximum, ajuster en fonction de la hauteur
      if (height > maxHeight) {
        height = maxHeight;
        width = maxHeight * (img.width / img.height);
      }

      // Centrer l'image horizontalement si nécessaire
      const xPosition = -30 + (maxWidth - width) / 2;

      doc.addImage(
        productImg,
        'JPEG',
        xPosition,
        20,
        width,
        height
      );

      // Image de la maison
const housePath = determineImagePath(data);
console.log("Chemin de l'image maison:", housePath);
  
  try {
    const houseImg = await loadImage(housePath);
    
    // Dimensions pour l'image de la maison
    const imgWidthPage3 = 102;
    const imgHeightPage3 = 81.5;
    
    doc.addImage(houseImg, 'PNG', 81, 146, imgWidthPage3, imgHeightPage3);
  } catch (error) {
    console.error("Erreur lors du chargement de l'image maison:", error, "Data:", data.parameters);
  }

  // Titre et informations du produit
  doc.setFontSize(17);
  doc.setTextColor(81, 83, 74); // #51534A
  addTextSafely(doc, data.selectedProduct.Nom, 101, 115);

  if (data.selectedProduct.selectedModel) {
    const model = data.selectedProduct.selectedModel;
    doc.setFontSize(12);
    addTextSafely(doc,
      `De ${model.puissance_calo} kW et un COP jusqu'à ${model.cop}`,
      101, 125
    );
    addTextSafely(doc,
      `ETAS jusqu'à ${model.etas}%`,
      101, 130
    );
  }
     // Ajouter le footer à la page 3
    addFooter(doc);
  }

  // Sauvegarde du PDF
  doc.save(`${data.fileName || `proposition_nextherm_${data.referenceNumber || 'sans_reference'}`}.pdf`);

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
}