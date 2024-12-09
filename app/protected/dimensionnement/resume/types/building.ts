// types/building.ts

export interface BuildingData {
    constructionYear: string | null;
    buildingType: string | null;
    heatLoss: string | null;
    totalSurface: number;
    ventilation: string | null;
    heatingTemp: string | null;
    department: string | null;
    structure: string | null;
    groundStructure: string | null;
    windowSurface: string | null;
    adjacency: string | null;
    floors: {
    ground: {
        surface: string;
        height: string;
    };
    first?: {
        surface: string;
        height: string;
    };
    second?: {
        surface: string;
        height: string;
    };
    };
    poolKit: string | null;
    freecoolingKit: string | null;
    hotWater: string | null;
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