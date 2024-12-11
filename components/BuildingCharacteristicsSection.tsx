'use client';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Home, 
  Map, 
  Ruler, 
  Settings, 
  Thermometer, 
  Wind, 
  ArrowLeft,
  Droplets,
  Snowflake,
  Droplet,
  ThermometerSun
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from 'next/navigation';

interface Emetteur {
  min: number;
  max: number;
}

interface Product {
  Type: string;
  Systeme: string;
  Emetteur: Emetteur;
  Nom: string;
  // Ajoutez d'autres propriétés si nécessaire
}

interface BuildingData {
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
  poolKit: string | null;
  freecoolingKit: string | null;
  hotWater: string | null;
}

interface ComponentProps {
  buildingData: BuildingData;
}


const BuildingCharacteristicsSection: React.FC<ComponentProps> = ({ buildingData }) => {
  const router = useRouter();

  const handleEditClick = () => {
    try {
      // Sauvegarder toutes les données nécessaires dans le localStorage
      localStorage.setItem('isEditing', 'true');
      
      // Sauvegarder les données du bâtiment
      if (buildingData) {
        // Données de construction
        localStorage.setItem('Annee_de_construction', buildingData.constructionYear || '');
        localStorage.setItem('Type_de_construction', buildingData.buildingType || '');
        localStorage.setItem('ResultatDeperdition', buildingData.heatLoss || '');
        
        // Surfaces
        const surfaces = calculateSurfaces(
          buildingData.buildingType || '',
          buildingData.totalSurface
        );
        localStorage.setItem('Surface_RDC', surfaces.ground.toString());
        localStorage.setItem('Surface_1er_etage', surfaces.first.toString());
        localStorage.setItem('Surface_2e_etage', surfaces.second.toString());
        
        // Caractéristiques techniques
        localStorage.setItem('Ventilation', buildingData.ventilation || '');
        localStorage.setItem('Temperature_de_chauffage', buildingData.heatingTemp || '');
        localStorage.setItem('Departement', buildingData.department || '');
        localStorage.setItem('Structure_de_la_construction', buildingData.structure || '');
        localStorage.setItem('Structure_du_sol', buildingData.groundStructure || '');
        localStorage.setItem('Surface_de_vitrage', buildingData.windowSurface || '');
        localStorage.setItem('Mitoyennete', buildingData.adjacency || '');
        
        // Options
        localStorage.setItem('kit_piscine', buildingData.poolKit || 'Non');
        localStorage.setItem('kit_freecooling', buildingData.freecoolingKit || 'Non');
        localStorage.setItem('kit_ECS', buildingData.hotWater || 'Non');
      }
      
      // Stocker les données du produit sélectionné
      const selectedProductStr = localStorage.getItem('selected_product');
      if (selectedProductStr) {
        const product: Product = JSON.parse(selectedProductStr);
        localStorage.setItem('type_pac', product.Type);
        localStorage.setItem('systeme_pac', product.Systeme);
        if (product.Emetteur) {
          localStorage.setItem('emetteur_type', determineEmitterType(product.Emetteur));
          localStorage.setItem('temp_radiateur', product.Emetteur.max.toString());
          localStorage.setItem('temp_plancher', product.Emetteur.min.toString());
        }
      }

      console.log('Données sauvegardées avec succès');
      
      // Rediriger vers la page de dimensionnement
      router.push('/protected/dimensionnement');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error);
    }
  };

  const calculateSurfaces = (buildingType: string, totalSurface: number) => {
    switch(buildingType) {
      case 'RDC':
        return {
          ground: totalSurface,
          first: 0,
          second: 0
        };
      case '1 Étage':
        return {
          ground: totalSurface / 2,
          first: totalSurface / 2,
          second: 0
        };
      case '2 Étages':
        return {
          ground: totalSurface / 3,
          first: totalSurface / 3,
          second: totalSurface / 3
        };
      default:
        return {
          ground: totalSurface,
          first: 0,
          second: 0
        };
    }
  };

  const determineEmitterType = (emetteur: Emetteur): string => {
    return emetteur.max <= 35 ? 'plancher' : 'radiateur';
  };

  return (
    <Card className="mb-8 overflow-hidden border-none shadow-lg bg-white">
      <CardHeader className="bg-gradient-to-r from-[#86BC29]/10 to-transparent border-b border-gray-100">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-2xl">
            <Building2 className="w-7 h-7 mr-3 text-[#86BC29]" />
            Caractéristiques du bâtiment
          </CardTitle>
          <Button
            onClick={handleEditClick}
            variant="outline"
            className="flex items-center gap-2 text-[#86BC29] border-[#86BC29] hover:bg-[#86BC29] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Modifier
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        {/* Première rangée : Construction et Caractéristiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Construction et Surface */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <Home className="w-6 h-6 text-[#86BC29]" />
              </div>
              <h3 className="ml-3 font-semibold">Construction</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 text-[#86BC29] mr-2" />
                  <p className="text-sm text-gray-500">Année</p>
                </div>
                <p className="text-lg font-semibold">{buildingData.constructionYear}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Map className="w-5 h-5 text-[#86BC29] mr-2" />
                  <p className="text-sm text-gray-500">Type</p>
                </div>
                <p className="text-lg font-semibold">{buildingData.buildingType}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Ruler className="w-5 h-5 text-[#86BC29] mr-2" />
                  <p className="text-sm text-gray-500">Surface</p>
                </div>
                <p className="text-lg font-semibold">{buildingData.totalSurface} m²</p>
              </div>
            </div>
          </div>

          {/* Caractéristiques climatiques */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <ThermometerSun className="w-6 h-6 text-[#86BC29]" />
              </div>
              <h3 className="ml-3 font-semibold">Caractéristiques</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Thermometer className="w-5 h-5 text-[#86BC29] mr-2" />
                  <p className="text-sm text-gray-500">Température intérieure</p>
                </div>
                <p className="text-lg font-semibold">{buildingData.heatingTemp}°C</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ThermometerSun className="w-5 h-5 text-[#86BC29] mr-2" />
                  <p className="text-sm text-gray-500">Température extérieure</p>
                </div>
                <p className="text-lg font-semibold">{buildingData.externalTemp || '-15'}°C</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Map className="w-5 h-5 text-[#86BC29] mr-2" />
                  <p className="text-sm text-gray-500">Département</p>
                </div>
                <p className="text-lg font-semibold">{buildingData.department}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Deuxième rangée : Options et PAC info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Options */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <Settings className="w-6 h-6 text-[#86BC29]" />
              </div>
              <h3 className="ml-3 font-semibold">Options</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Droplets className="w-5 h-5 text-[#86BC29] mr-2" />
                  <p className="text-sm text-gray-500">Kit Piscine</p>
                </div>
                <p className="text-lg font-semibold">{buildingData.poolKit || 'Non'}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Snowflake className="w-5 h-5 text-[#86BC29] mr-2" />
                  <p className="text-sm text-gray-500">Freecooling</p>
                </div>
                <p className="text-lg font-semibold">{buildingData.freecoolingKit || 'Non'}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Droplet className="w-5 h-5 text-[#86BC29] mr-2" />
                  <p className="text-sm text-gray-500">ECS</p>
                </div>
                <p className="text-lg font-semibold">{buildingData.hotWater || 'Non'}</p>
              </div>
            </div>
          </div>

          {/* Informations PAC */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-0">
                <div className="flex items-center">
                  <ThermometerSun className="w-6 h-6 text-[#86BC29] mr-3" />
                  <p className="text-sm text-gray-500">Type de PAC</p>
                </div>
                <p className="text-lg font-semibold">{localStorage.getItem('type_pac')}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-0">
                <div className="flex items-center">
                  <Settings className="w-6 h-6 text-[#86BC29] mr-3" />
                  <p className="text-sm text-gray-500">Système PAC</p>
                </div>
                <p className="text-lg font-semibold">{localStorage.getItem('systeme_pac')}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Thermometer className="w-6 h-6 text-[#86BC29] mr-3" />
                  <p className="text-sm text-gray-500">Type d'émetteur</p>
                </div>
                <p className="text-lg font-semibold">{localStorage.getItem('emetteur_type')}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuildingCharacteristicsSection;