// utils/deperditionCalculator.ts

export const MATERIAL_CONDUCTIVITY = {
    "Béton": 1.5,
    "Brique": 0.7,
    "Parpaing": 0.85,
    "Bois": 0.15,
    "Pierre": 2.0,
    "Laine de verre": 0.04,
    "Polystyrène": 0.035,
    "Laine de roche": 0.036,
    "Chanvre": 0.04,
    "Ouate de cellulose": 0.04,
    "Fibres de bois": 0.07,
    "Liège": 0.044
  } as const;
  
  export const DEPARTEMENT_TEMPERATURES: { [key: string]: number } = {
    "01": -10, "02": -7, "03": -8, "04": -8, "05": -10,
    "06": -5, "07": -6, "08": -10, "09": -5, "10": -10,
    "11": -5, "12": -8, "13": -5, "14": -7, "15": -8,
    "16": -5, "17": -5, "18": -7, "19": -8, "20": -2,
    "21": -10, "22": -4, "23": -8, "24": -5, "25": -12,
    "26": -6, "27": -7, "28": -7, "29": -4, "30": -5,
    "31": -5, "32": -5, "33": -5, "34": -5, "35": -4,
    "36": -7, "37": -7, "38": -10, "39": -10, "40": -5,
    "41": -7, "42": -10, "43": -8, "44": -5, "45": -7,
    "46": -6, "47": -5, "48": -8, "49": -7, "50": -4,
    "51": -10, "52": -12, "53": -7, "54": -15, "55": -12,
    "56": -4, "57": -15, "58": -10, "59": -9, "60": -7,
    "61": -7, "62": -9, "63": -8, "64": -5, "65": -5,
    "66": -5, "67": -15, "68": -15, "69": -10, "70": -10,
    "71": -10, "72": -7, "73": -10, "74": -10, "75": -5,
    "76": -7, "77": -7, "78": -7, "79": -7, "80": -9,
    "81": -5, "82": -5, "83": -5, "84": -6, "85": -5,
    "86": -7, "87": -8, "88": -15, "89": -10, "90": -15,
    "91": -7, "92": -7, "93": -7, "94": -7, "95": -7
  };
  
  // Types
  interface WallCalculationParams {
    compositionMurs: keyof typeof MATERIAL_CONDUCTIVITY;
    epaisseurMurs: number;
    hasIsolationInterieure: boolean;
    materiauIsolationInterieure?: keyof typeof MATERIAL_CONDUCTIVITY;
    epaisseurIsolationInterieure?: number;
    hasIsolationExterieure: boolean;
    materiauIsolationExterieure?: keyof typeof MATERIAL_CONDUCTIVITY;
    epaisseurIsolationExterieure?: number;
  }
  
  interface BuildingDimensions {
    surfaceRDC: number;
    surface1stFloor: number;
    surface2ndFloor: number;
    buildingType: string;
  }
  
  interface WallLossCalculationParams extends BuildingDimensions {
    HSPRDC: number;
    HSP1stFloor: number;
    HSP2ndFloor: number;
    vitragePercentage: number;
    mitoyennete: string;
    constructionYear: string;
    advancedCalculation?: WallCalculationParams;
  }
  
  interface PerimeterAdjustment {
    P_RDC: number;
    P1: number;
    P2: number;
    L_RDC: number;
    L1: number;
    L2: number;
    mitoyennete: string;
  }
  
  interface WindowLossParams {
    wallLossData: ReturnType<typeof calculateWallLoss>;
    vitrageType: string;
  }
  
  interface RoofLossParams {
    surfaceRDC: number;
    etatCombles: string;
    constructionYear: string;
  }
  
  interface FloorLossParams {
    surfaceRDC: number;
    constructionYear: string;
    floorType: string;
    typeDeConstruction: string;
    isAdvancedOptionChecked: boolean;
    etatIsolationEtages: string;
  }
  
  interface AirLossParams {
    surfaces: {
      RDC: number;
      firstFloor: number;
      secondFloor: number;
    };
    heights: {
      RDC: number;
      firstFloor: number;
      secondFloor: number;
    };
    ventilationType: string;
  }
  
  // Fonctions utilitaires
  const getUValueFromYear = (constructionYear: string): number => {
    switch (constructionYear) {
      case "Avant 1974": return 2.5;
      case "De 1974 à 1980": return 1.0;
      case "De 1981 à 1988": return 0.8;
      case "De 1989 à 1999": return 0.5;
      case "De 2000 à 2004": return 0.47;
      case "De 2005 à 2012": return 0.36;
      case "De 2013 à 2019": return 0.27;
      case "De 2020 à 2024": return 0.18;
      default: return 0.18;
    }
  };
  
  const calculateBuildingDimensions = ({
    surfaceRDC,
    surface1stFloor,
    surface2ndFloor,
    buildingType
  }: BuildingDimensions) => {
    let L_RDC: number, L1: number, L2: number;
    let P_RDC: number, P1: number, P2: number;
  
    switch (buildingType) {
      case "Carré":
        L_RDC = Math.sqrt(surfaceRDC);
        L1 = Math.sqrt(surface1stFloor);
        L2 = Math.sqrt(surface2ndFloor);
        P_RDC = L_RDC * 4;
        P1 = L1 * 4;
        P2 = L2 * 4;
        break;
      case "Rectangulaire":
        L_RDC = Math.sqrt(surfaceRDC) * 0.707;
        L1 = Math.sqrt(surface1stFloor) * 0.707;
        L2 = Math.sqrt(surface2ndFloor) * 0.707;
        P_RDC = L_RDC * 6;
        P1 = L1 * 6;
        P2 = L2 * 6;
        break;
      case "Maison en L":
        L_RDC = Math.sqrt(surfaceRDC / 3);
        L1 = Math.sqrt(surface1stFloor / 3);
        L2 = Math.sqrt(surface2ndFloor / 3);
        P_RDC = L_RDC * 8;
        P1 = L1 * 8;
        P2 = L2 * 8;
        break;
      case "Maison en U":
        L_RDC = Math.sqrt(surfaceRDC / 6);
        L1 = Math.sqrt(surface1stFloor / 6);
        L2 = Math.sqrt(surface2ndFloor / 6);
        P_RDC = L_RDC * 12;
        P1 = L1 * 12;
        P2 = L2 * 12;
        break;
      default:
        L_RDC = L1 = L2 = 0;
        P_RDC = P1 = P2 = 0;
    }
  
    return { L_RDC, L1, L2, P_RDC, P1, P2 };
  };
  
  // Fonctions principales de calcul
  export const calculateWallUValue = ({
    compositionMurs,
    epaisseurMurs,
    hasIsolationInterieure,
    materiauIsolationInterieure,
    epaisseurIsolationInterieure,
    hasIsolationExterieure,
    materiauIsolationExterieure,
    epaisseurIsolationExterieure,
  }: WallCalculationParams): number => {
    const epaisseurMursM = epaisseurMurs / 100;
    const epaisseurIsolationInterieureM = (epaisseurIsolationInterieure || 0) / 100;
    const epaisseurIsolationExterieureM = (epaisseurIsolationExterieure || 0) / 100;
  
    let R_wall = epaisseurMursM / MATERIAL_CONDUCTIVITY[compositionMurs];
  
    if (hasIsolationInterieure && materiauIsolationInterieure) {
      R_wall += epaisseurIsolationInterieureM / MATERIAL_CONDUCTIVITY[materiauIsolationInterieure];
    }
  
    if (hasIsolationExterieure && materiauIsolationExterieure) {
      R_wall += epaisseurIsolationExterieureM / MATERIAL_CONDUCTIVITY[materiauIsolationExterieure];
    }
  
    const Rsi = 0.13;
    const Rso = 0.04;
    const R_total = Rsi + R_wall + Rso;
  
    return 1 / R_total;
  };
  
  export const calculateWallLoss = (params: WallLossCalculationParams) => {
    let U_value: number;
  
    if (params.advancedCalculation) {
      U_value = calculateWallUValue(params.advancedCalculation);
    } else {
      U_value = getUValueFromYear(params.constructionYear);
    }
  
    const dimensions = calculateBuildingDimensions(params);
    
    // Ajustement mitoyenneté
    if (params.mitoyennete === "1 côté") {
      dimensions.P_RDC -= dimensions.L_RDC;
      dimensions.P1 -= dimensions.L1;
      dimensions.P2 -= dimensions.L2;
    } else if (params.mitoyennete === "2 côtés") {
      dimensions.P_RDC -= 2 * dimensions.L_RDC;
      dimensions.P1 -= 2 * dimensions.L1;
      dimensions.P2 -= 2 * dimensions.L2;
    }
  
    const SMV_RDC = dimensions.P_RDC * params.HSPRDC;
    const SMV1 = dimensions.P1 * params.HSP1stFloor;
    const SMV2 = dimensions.P2 * params.HSP2ndFloor;
  
    const adjustedSMV_RDC = SMV_RDC * (1 - params.vitragePercentage / 100);
    const adjustedSMV1 = SMV1 * (1 - params.vitragePercentage / 100);
    const adjustedSMV2 = SMV2 * (1 - params.vitragePercentage / 100);
  
    const heatLoss_RDC = adjustedSMV_RDC * U_value;
    const heatLoss1 = adjustedSMV1 * U_value;
    const heatLoss2 = adjustedSMV2 * U_value;
  
    return {
      totalHeatLoss: heatLoss_RDC + heatLoss1 + heatLoss2,
      SMV_RDC,
      SMV1,
      SMV2,
      adjustedSMV_RDC,
      adjustedSMV1,
      adjustedSMV2,
    };
  };
  
  export const calculateWindowLoss = ({ wallLossData, vitrageType }: WindowLossParams): number => {
    const surfaceVitre_RDC = wallLossData.SMV_RDC - wallLossData.adjustedSMV_RDC;
    const surfaceVitre1 = wallLossData.SMV1 - wallLossData.adjustedSMV1;
    const surfaceVitre2 = wallLossData.SMV2 - wallLossData.adjustedSMV2;
  
    let U_value_window: number;
    switch(vitrageType) {
      case "SV Métal": U_value_window = 5.0; break;
      case "SV Bois/PVC": U_value_window = 4.5; break;
      case "DV Métal": U_value_window = 3.5; break;
      case "DV Bois/PVC": U_value_window = 3.2; break;
      case "DV Argon": U_value_window = 2.5; break;
      case "DV VIR": U_value_window = 2.0; break;
      case "DV RT2012": U_value_window = 1.2; break;
      default: U_value_window = 5.0;
    }
  
    return (surfaceVitre_RDC + surfaceVitre1 + surfaceVitre2) * U_value_window;
  };
  
  export const calculateRoofLoss = ({
    surfaceRDC,
    etatCombles,
    constructionYear
  }: RoofLossParams): number => {
    // Vérification des entrées
    const surface = typeof surfaceRDC === 'string' ? parseFloat(surfaceRDC) : surfaceRDC;
    if (isNaN(surface)) return 0;

    let U_value: number;

    // Coefficients U corrigés pour l'isolation des combles
    if (etatCombles) {
        switch (etatCombles) {
            case "Isolé - Laine de verre":
                U_value = 0.20;
                break;
            case "Isolé - Laine de roche":
                U_value = 0.18;
                break;
            case "Isolé - Soufflé":
                U_value = 0.22;
                break;
            case "Pas isolé":
                U_value = 4.0; // Corrigé de 2.5 à 4.0 pour les toits non isolés
                break;
            case "Aménagé":
                U_value = 0.25;
                break;
            default:
                // Utiliser les valeurs basées sur l'année de construction
                switch (constructionYear) {
                    case "Avant 1974":
                        U_value = 4.0; // Corrigé de 2.5 à 4.0
                        break;
                    case "De 1974 à 1980":
                        U_value = 0.90;
                        break;
                    case "De 1981 à 1988":
                        U_value = 0.40;
                        break;
                    case "De 1989 à 1999":
                        U_value = 0.25;
                        break;
                    case "De 2000 à 2004":
                        U_value = 0.25;
                        break;
                    case "De 2005 à 2012":
                        U_value = 0.20;
                        break;
                    case "De 2013 à 2019":
                        U_value = 0.18;
                        break;
                    case "De 2020 à 2024":
                        U_value = 0.16;
                        break;
                    default:
                        U_value = 4.0; // Valeur par défaut corrigée
                }
        }
    } else {
        // Si pas d'information sur l'isolation, utiliser l'année de construction
        switch (constructionYear) {
            case "Avant 1974":
                U_value = 2.5; 
                break;
            case "De 1974 à 1980":
                U_value = 0.90;
                break;
            case "De 1981 à 1988":
                U_value = 0.40;
                break;
            case "De 1989 à 1999":
                U_value = 0.25;
                break;
            case "De 2000 à 2004":
                U_value = 0.25;
                break;
            case "De 2005 à 2012":
                U_value = 0.20;
                break;
            case "De 2013 à 2019":
                U_value = 0.18;
                break;
            case "De 2020 à 2024":
                U_value = 0.16;
                break;
            default:
                U_value = 4.0;
        }
    }

    // Ajout du facteur de correction pour la toiture
    const roofCorrectionFactor = 0.8;
    
    // Calcul de la déperdition
    const roofHeatLoss = surface * U_value * roofCorrectionFactor;
    
    console.log('Calcul toiture:', {
      surface,
      U_value,
      roofCorrectionFactor,
      roofHeatLoss
    });
  
    return roofHeatLoss;
  };

export const calculateFloorLoss = ({
  surfaceRDC,
  constructionYear,
  floorType,
  typeDeConstruction,
  isAdvancedOptionChecked,
  etatIsolationEtages,
}: FloorLossParams): number => {
  let U_value: number;

  if (isAdvancedOptionChecked && (typeDeConstruction === '1 Étage' || typeDeConstruction === '2 Étages')) {
    switch (etatIsolationEtages) {
      case "pas_isolee": U_value = 0.80; break;
      case "laine_verre": U_value = 0.20; break;
      case "laine_roche": U_value = 0.18; break;
      case "isole_souffle": U_value = 0.15; break;
      default: U_value = 0.80;
    }
  } else {
    switch(constructionYear) {
      case "Avant 1974": U_value = 2.00; break;
      case "De 1974 à 1980": U_value = 0.90; break;
      case "De 1981 à 1988": U_value = 0.70; break;
      case "De 1989 à 1999": U_value = 0.60; break;
      case "De 2000 à 2004": U_value = 0.43; break;
      case "De 2005 à 2012": U_value = 0.40; break;
      case "De 2013 à 2019": U_value = 0.36; break;
      case "De 2020 à 2024": U_value = 0.24; break;
      case "Rénové": U_value = 1.20; break;
      default: U_value = 2.00;
    }
  }

  let Tau_value: number;
  switch(floorType) {
    case "Une cave enterrée": Tau_value = 0.6; break;
    case "Une cave semi-enterrée": Tau_value = 0.7; break;
    case "Un vide sanitaire": Tau_value = 0.8; break;
    case "Terre plein": Tau_value = 0.3; break;
    default: Tau_value = 0.6;
  }

  return surfaceRDC * U_value * Tau_value;
};

export const calculateAirNeufLoss = ({
  surfaces,
  heights,
  ventilationType
}: AirLossParams): number => {
  const volumeRDC = surfaces.RDC * heights.RDC;
  const volume1stFloor = surfaces.firstFloor * heights.firstFloor;
  const volume2ndFloor = surfaces.secondFloor * heights.secondFloor;
  const totalVolume = volumeRDC + volume1stFloor + volume2ndFloor;

  let coef: number;
  switch(ventilationType) {
    case "Ventilation naturelle": coef = 1.00; break;
    case "VMC simple flux": coef = 0.70; break;
    case "VMC hygro": coef = 0.50; break;
    case "Double flux": coef = 0.30; break;
    default: coef = 1.00;
  }

  return (totalVolume * coef) * 0.34;
};

export const calculateThermalBridge = (constructionYear: string, losses: {
  airNeufLoss: number;
  floorLoss: number;
  windowLoss: number;
  roofLoss: number;
}): number => {
  let thermalBridgeCoefficient: number;
  
  switch(constructionYear) {
    case "Avant 1974": thermalBridgeCoefficient = 0.1; break;
    case "De 1974 à 1980": thermalBridgeCoefficient = 0.15; break;
    case "De 1981 à 1988": thermalBridgeCoefficient = 0.15; break;
    case "De 1989 à 1999": thermalBridgeCoefficient = 0.2; break;
    case "De 2000 à 2004": thermalBridgeCoefficient = 0.2; break;
    case "De 2005 à 2012": thermalBridgeCoefficient = 0.25; break;
    case "De 2013 à 2019": thermalBridgeCoefficient = 0.15; break;
    case "De 2020 à 2024": thermalBridgeCoefficient = 0.10; break;
    default: thermalBridgeCoefficient = 0.15;
  }

  const LossForBridge = losses.airNeufLoss + losses.floorLoss + losses.windowLoss + losses.roofLoss;
  return LossForBridge * thermalBridgeCoefficient;
};

export const getOrientationAdjustment = (orientation: string): number => {
  let orientationAdjustment = 1;

  switch (orientation) {
    case "Nord": orientationAdjustment += 0.00081; break;
    case "Est": orientationAdjustment += 0.00564; break;
    case "Sud": orientationAdjustment -= 0.00093; break;
    case "Ouest": orientationAdjustment -= 0.00552; break;
  }

  return orientationAdjustment;
};

export interface TotalLossParams {
  wallLoss: number;
  windowLoss: number;
  roofLoss: number;
  floorLoss: number;
  airLoss: number;
  pontLoss: number;
  temperatureChauffage: number;
  departement: string;
  orientation: string;
}

export const calculateTotalLoss = ({
  wallLoss,
  windowLoss,
  roofLoss,
  floorLoss,
  airLoss,
  pontLoss,
  temperatureChauffage,
  departement,
  orientation
}: TotalLossParams): number => {
  const temperatureFactor = DEPARTEMENT_TEMPERATURES[departement] ?? -10; // Valeur par défaut si département non trouvé
  const orientationAdjustment = getOrientationAdjustment(orientation);
  
  const totalLoss = (
    (wallLoss + windowLoss + roofLoss + floorLoss + airLoss + pontLoss) * 
    (temperatureChauffage - temperatureFactor) / 1000
  ) * orientationAdjustment;

  return Number(totalLoss.toFixed(2));
};

// Fonction utilitaire pour sauvegarder les résultats
export const saveResultsToStorage = (results: {
  heatLossResults: any;
  windowHeatLoss: number;
  roofHeatLoss: number;
  floorHeatLoss: number;
  airNeufLoss: number;
  thermalBridgeLoss: number;
  totalLoss: number;
}) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('heatLossResults', JSON.stringify(results.heatLossResults));
    sessionStorage.setItem('windowHeatLoss', results.windowHeatLoss.toString());
    sessionStorage.setItem('roofHeatLoss', results.roofHeatLoss.toString());
    sessionStorage.setItem('FloorHeatLoss', results.floorHeatLoss.toString());
    sessionStorage.setItem('airneufLoss', results.airNeufLoss.toString());
    sessionStorage.setItem('thermalBridgeLoss', results.thermalBridgeLoss.toString());
  }
};

export const useDeperditionCalculator = (formData: any) => {
  const calculateAll = () => {
    if (!formData) return null;

    try {
      // Fonction utilitaire pour parser les nombres en toute sécurité
      const safeParseFloat = (value: string | number): number => {
        const parsed = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(parsed) ? 0 : parsed;
      };

      // Calcul des pertes murales
      const wallLossData = calculateWallLoss({
        surfaceRDC: safeParseFloat(formData.floors.ground.surface),
        surface1stFloor: safeParseFloat(formData.floors.first.surface),
        surface2ndFloor: safeParseFloat(formData.floors.second.surface),
        HSPRDC: safeParseFloat(formData.floors.ground.height),
        HSP1stFloor: safeParseFloat(formData.floors.first.height),
        HSP2ndFloor: safeParseFloat(formData.floors.second.height),
        buildingType: formData.buildingStructure || 'Carré',
        vitragePercentage: safeParseFloat(formData.windowSurface),
        mitoyennete: formData.adjacency || 'Non',
        constructionYear: formData.constructionYear || 'Avant 1974',
        advancedCalculation: formData.showAdvancedOptions ? {
          compositionMurs: formData.wallComposition,
          epaisseurMurs: safeParseFloat(formData.wallThickness),
          hasIsolationInterieure: formData.interiorInsulation.enabled,
          materiauIsolationInterieure: formData.interiorInsulation.material,
          epaisseurIsolationInterieure: safeParseFloat(formData.interiorInsulation.thickness),
          hasIsolationExterieure: formData.exteriorInsulation.enabled,
          materiauIsolationExterieure: formData.exteriorInsulation.material,
          epaisseurIsolationExterieure: safeParseFloat(formData.exteriorInsulation.thickness)
        } : undefined
      });

      // Calcul des pertes par les fenêtres
      const windowLossValue = calculateWindowLoss({
        wallLossData,
        vitrageType: formData.windowType || 'SV Métal'
      });

      // Calcul des pertes par le toit
      const roofLossValue = calculateRoofLoss({
        surfaceRDC: safeParseFloat(formData.floors.ground.surface),
        etatCombles: formData.atticInsulation,
        constructionYear: formData.constructionYear
      });

      // Calcul des pertes par le sol
      const floorLossValue = calculateFloorLoss({
        surfaceRDC: safeParseFloat(formData.floors.ground.surface),
        constructionYear: formData.constructionYear,
        floorType: formData.groundStructure,
        typeDeConstruction: formData.buildingType,
        isAdvancedOptionChecked: formData.showAdvancedOptions,
        etatIsolationEtages: formData.floorInsulation
      });

      // Calcul des pertes par renouvellement d'air
      const airLossValue = calculateAirNeufLoss({
        surfaces: {
          RDC: safeParseFloat(formData.floors.ground.surface),
          firstFloor: safeParseFloat(formData.floors.first.surface),
          secondFloor: safeParseFloat(formData.floors.second.surface)
        },
        heights: {
          RDC: safeParseFloat(formData.floors.ground.height),
          firstFloor: safeParseFloat(formData.floors.first.height),
          secondFloor: safeParseFloat(formData.floors.second.height)
        },
        ventilationType: formData.ventilation || 'Ventilation naturelle'
      });

      // Calcul des ponts thermiques
      const thermalBridgeValue = calculateThermalBridge(
        formData.constructionYear,
        {
          airNeufLoss: airLossValue,
          floorLoss: floorLossValue,
          windowLoss: windowLossValue,
          roofLoss: roofLossValue
        }
      );

      // Calcul de la perte totale
      const totalLoss = calculateTotalLoss({
        wallLoss: wallLossData.totalHeatLoss,
        windowLoss: windowLossValue,
        roofLoss: roofLossValue,
        floorLoss: floorLossValue,
        airLoss: airLossValue,
        pontLoss: thermalBridgeValue,
        temperatureChauffage: safeParseFloat(formData.heatingTemp),
        departement: formData.department || '75',
        orientation: formData.mainOrientation || 'Nord'
      });

      // On s'assure que toutes les valeurs sont des nombres valides
      return {
        totalLoss: isNaN(totalLoss) ? 0 : totalLoss,
        details: {
          wallLoss: isNaN(wallLossData.totalHeatLoss) ? 0 : wallLossData.totalHeatLoss,
          windowLoss: isNaN(windowLossValue) ? 0 : windowLossValue,
          roofLoss: isNaN(roofLossValue) ? 0 : roofLossValue,
          floorLoss: isNaN(floorLossValue) ? 0 : floorLossValue,
          airLoss: isNaN(airLossValue) ? 0 : airLossValue,
          thermalBridge: isNaN(thermalBridgeValue) ? 0 : thermalBridgeValue
        }
      };
    } catch (error) {
      console.error('Erreur dans le calcul des déperditions:', error);
      return {
        totalLoss: 0,
        details: {
          wallLoss: 0,
          windowLoss: 0,
          roofLoss: 0,
          floorLoss: 0,
          airLoss: 0,
          thermalBridge: 0
        }
      };
    }
  };

  return { calculateAll };
};