export interface BuildingData {
    constructionYear?: string;
    buildingType?: string;
    heatLoss?: string;
    totalSurface: number;
    ventilation?: string;
    heatingTemp?: string;
    department?: string;
    structure?: string;
    groundStructure?: string;
    windowSurface?: string;
    adjacency?: string;
    poolKit?: string;
    freecoolingKit?: string;
    hotWater?: string;
    surfaceRDC?: string;
    surface1erEtage?: string;
    surface2eEtage?: string;
    externalTemp?: string;
    heatPumpType?: string;
    heatPumpSystem?: string;
  }

export interface HeatLossDetails {
    totalLoss: number;
    details?: {
    wallLoss: number;
    windowLoss: number;
    roofLoss: number;
    floorLoss: number;
    airLoss: number;
    thermalBridge: number;
    };
}