// types/nextherm.ts

export interface ProductPower {
    modele: string;
    puissance_calo: number;
    puissance_frigo: number;
    puissance_absorbee: number;
    cop: number;
    etas: number;
  }
  
  export interface NexthermProduct {
    Nom: string;
    Particularites: string[];
    Puissance: {
      min: number;
      max: number;
      disponibles?: ProductPower[];
      increment?: number;
      baseModele?: string;
      caracteristiques?: {
        cop_moyen: number;
        etas_moyen: number;
      };
    };
    Freecooling: boolean;
    Kit_Piscine: boolean;
    Cop: {
      max: number;
    };
    Etas: {
      max: number;
    };
    Description: string;
    BrochureURL: string;
    Dimension: {
      largeur: string | number;
      longueur: string | number;
      hauteur: string | number;
    };
    Image: string;
    Image2: string;
  }