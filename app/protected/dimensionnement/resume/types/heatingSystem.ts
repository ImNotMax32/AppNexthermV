import { ReactNode } from 'react';

export interface HeatingSystem {
  name: string;
  type: string;
  icon: ReactNode;
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
