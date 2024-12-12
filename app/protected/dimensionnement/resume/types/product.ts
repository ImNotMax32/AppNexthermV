// product.ts

export interface ProductDimension {
    largeur: number;
    longueur: number;
    hauteur: number;
}

export interface PowerCharacteristics {
    cop_moyen: number;
    etas_moyen: number;
    ratio_frigo: number;    // Maintenant obligatoire
    ratio_absorbee: number; // Maintenant obligatoire
}

export interface PowerModel {
    modele: string;
    puissance_calo: number;
    puissance_frigo: number;
    puissance_absorbee: number;
    cop: number;
    etas: number;
}

export interface ProductPower {
    min: number;
    max: number;
    disponibles?: PowerModel[];
    increment?: number;
    baseModele?: string;
    caracteristiques?: PowerCharacteristics; // Utilise la nouvelle interface
}

export interface Product {
    Nom: string;
    Particularites: string[];
    Puissance: ProductPower;
    Freecooling: boolean;
    Kit_Piscine: boolean;
    Cop: { max: number };
    Etas: { max: number };
    Eau_de_nappe: {
        Puissance_min: number;
        Puissance_max: number;
    };
    Emetteur: {
        min: number;
        max: number;
    };
    Dimension: ProductDimension;
    Dimension2: ProductDimension;
    Image: string;
    Image2: string;
    BrochureURL: string;
    Description: string;
    selectedModel?: PowerModel;
}

export interface FilterCriteria {
    heatLoss: number;
    heatPumpType: string;
    heatPumpSystem: string;
    emitterType: string;
    emitterTemp: number;
}

export interface ClientInfo {
    name: string;
    address: string;
    phone: string;
    city: string;
    postalCode: string;
    email: string;
}

export interface InstallerInfo {
    company: string;
    contact: string;
    email: string;
    phone: string;
    logo: string | null;
}