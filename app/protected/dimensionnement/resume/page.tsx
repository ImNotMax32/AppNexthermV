'use client';

import React, { useEffect, useState, useRef, Fragment } from 'react';

// Désactiver le rendu statique pour cette page
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { generateModernPdf } from './utils/pdfGenerator';
import { generateComparatifPdf } from './comparatif/utils/comparatifPdfGenerator';
import { 
  Building2, 
  Thermometer, 
  Wind, 
  Map, 
  ThermometerSun, 
  Home,
  Ruler,
  Settings,
  Droplet,
  Snowflake,
  Droplets,
  Mail,
  Send,
  X
} from 'lucide-react';
import ProductShowcase from './ProductShowcase';
import { Product } from '@/app/protected/dimensionnement/resume/types/product';
import SaveCalculation from '@/components/SaveCalculation';
import { useRouter } from 'next/navigation';
import BuildingCharacteristicsSection from '@/components/BuildingCharacteristicsSection';
import { Edit } from 'lucide-react';
import { BuildingData } from './types/building';
import { 
  calculateWallLoss,
  calculateWindowLoss,
  calculateRoofLoss,
  calculateFloorLoss,
  calculateAirNeufLoss,
  calculateThermalBridge,
  calculateTotalLoss,
  DEPARTEMENT_TEMPERATURES
} from './utils/deperditionCalculator';

interface PowerCharacteristics {
  ratio_frigo: number;
  ratio_absorbee: number;
  cop_moyen: number;
  etas_moyen: number;
}

// Interface adaptée pour les systèmes de chauffage dans le contexte de génération PDF
interface HeatingSystemPdf {
  name: string;
  type: string;
  icon: null; // Dans le contexte PDF, nous utilisons null au lieu de React.ReactNode
  color: string;
  efficiency: number;
  maintenanceCost: number;
  installationCost: number;
  energyType: string;
  co2Factor: number;
}

interface PowerModel {
  modele: string;
  puissance_calo: number;
  puissance_frigo: number;
  puissance_absorbee: number;
  cop: number;
  etas: number;
}

interface ProductPower {
  min: number;
  max: number;
  increment?: number;
  baseModele?: string;
  caracteristiques?: PowerCharacteristics;
  disponibles?: PowerModel[];
}


type HeatPumpTypeMapType = {
  'Géothermie': string;
  'Aérothermie': string;
};

const heatPumpTypeMap: { [key: string]: string } = {
  'Géothermie': 'Geothermie',
  'Aérothermie': 'Aerothermie'
};

// Animations
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};


ChartJS.register(ArcElement, Tooltip, Legend);

const HeatLossDonut = ({ deperditionsRecalculated }: { deperditionsRecalculated: boolean }) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [dataRefreshKey, setDataRefreshKey] = useState(0); // Pour forcer le re-rendu
  const imageRef = useRef<HTMLImageElement | null>(null);

  const getStorageValue = (key: string): number => {
    const value = sessionStorage.getItem(key);
    return value ? parseFloat(value) : 0;
  };
  
  // Fonction pour obtenir les données avec gestion des cas par défaut
  const getChartData = () => {
    const wallLoss = getStorageValue('wallHeatLoss');
    const windowLoss = getStorageValue('windowHeatLoss');
    const roofLoss = getStorageValue('roofHeatLoss');
    const floorLoss = getStorageValue('FloorHeatLoss');
    const airLoss = getStorageValue('airNeufLoss');
    const bridgeLoss = getStorageValue('thermalBridgeLoss');
    
    // Si toutes les valeurs détaillées sont à 0, utiliser la valeur totale pour les murs
    const totalLoss = getStorageValue('ResultatDeperdition');
    const detailsSum = windowLoss + roofLoss + floorLoss + airLoss + bridgeLoss;
    
    console.log('📊 Donut - Données récupérées:');
    console.log('- Total:', totalLoss);
    console.log('- Murs:', wallLoss);
    console.log('- Fenêtres:', windowLoss);
    console.log('- Toit:', roofLoss);
    console.log('- Sol:', floorLoss);
    console.log('- Air neuf:', airLoss);
    console.log('- Ponts thermiques:', bridgeLoss);
    console.log('- Somme détails:', detailsSum);
    
    // Si on n'a que le total et pas les détails, afficher 100% murs
    if (totalLoss > 0 && detailsSum === 0) {
      console.log('⚠️ Donut - Utilisation des données par défaut (100% murs)');
      return [totalLoss, 0, 0, 0, 0, 0];
    }
    
    // Sinon utiliser les données détaillées
    return [wallLoss, windowLoss, roofLoss, floorLoss, airLoss, bridgeLoss];
  };

  const data = getChartData();

  const total = data.reduce((a, b) => a + b, 0);
  const labels = ['Mur', 'Fenêtre', 'Toit', 'Sol', 'Air neuf', 'Pont thermique'];

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setIsImageLoaded(true);
      imageRef.current = img;
    };
  
    img.onerror = (error) => {
      console.error("Erreur lors du chargement de l'image:", error);
      setIsImageLoaded(false);
    };
  
    img.src = '/assets/img/X.png';
  
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  useEffect(() => {
    let mounted = true; // Pour éviter les mises à jour de state sur un composant démonté
    
    const loadImage = async () => {
      try {
        const img = new Image();
        
        img.onload = () => {
          console.log("Image chargée avec succès");
          if (mounted) {
            imageRef.current = img;
            setImageLoaded(true);
            console.log("State imageLoaded mis à jour:", true);
          }
        };
    
        img.onerror = (error) => {
          console.error("Erreur de chargement de l'image:", error);
          if (mounted) {
            setImageLoaded(false);
            console.log("State imageLoaded mis à jour après erreur:", false);
          }
        };

        img.src = '/assets/img/X.png';
      } catch (error) {
        console.error("Erreur lors de la création de l'image:", error);
      }
    };

    loadImage();
    setIsAnimating(true);
    
    const timer = setTimeout(() => {
      if (mounted) {
        setIsAnimating(false);
      }
    }, 1500);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Ajouter un useEffect pour logger l'état de imageLoaded
  useEffect(() => {
    console.log("État actuel de imageLoaded:", imageLoaded);
  }, [imageLoaded]);
  
  // useEffect pour surveiller les changements dans sessionStorage (une seule fois)
  useEffect(() => {
    if (deperditionsRecalculated) {
      console.log('🔄 Donut - Recalcul détecté, mise à jour du graphique');
      setDataRefreshKey(prev => prev + 1);
      setIsAnimating(true);
      
      // Arrêter l'animation après un délai
      setTimeout(() => {
        setIsAnimating(false);
      }, 1500);
    }
  }, [deperditionsRecalculated]); // Se déclenche uniquement quand deperditionsRecalculated change
  const centerImage = {
    id: 'centerImage',
    afterDraw(chart: any) {
      if (!chart?.ctx || !imageRef.current || !isImageLoaded) {
        return;
      }
  
      try {
        const { ctx, chartArea: { top, left, width, height } } = chart;
        const img = imageRef.current;
        
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        
        const maxSize = Math.min(width, height) * 0.4;
        const imageRatio = img.width / img.height;
        const newWidth = imageRatio >= 1 ? maxSize : maxSize * imageRatio;
        const newHeight = imageRatio >= 1 ? maxSize / imageRatio : maxSize;
  
        ctx.save();
        
        // Effet de glow
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, maxSize * 0.6
        );
        gradient.addColorStop(0, "rgba(134, 188, 0, 0.2)");
        gradient.addColorStop(1, "rgba(134, 188, 0, 0)");
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
  
        ctx.drawImage(
          img,
          centerX - newWidth / 2,
          centerY - newHeight / 2,
          newWidth,
          newHeight
        );
        
        ctx.restore();
      } catch (error) {
        console.error("Erreur lors du dessin de l'image:", error);
      }
    }
  };

  const chartData: ChartData<'doughnut'> = {
    labels,
    datasets: [{
      label: 'Déperditions thermiques',
      data: data,
      backgroundColor: data.map((_, index) => 
        `rgba(132,189,0, ${0.8 - (index * 0.15)})`
      ),
      borderColor: 'white',
      borderWidth: 1,
      hoverBackgroundColor: data.map((_, index) => 
        `rgba(132,189,0, ${1 - (index * 0.1)})`
      ),
      hoverBorderColor: 'white',
      hoverBorderWidth: 2,
    }]
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: isAnimating ? 2000 : 500,
      easing: 'easeInOutQuart'
    }
  };

  return (
    <div className="flex items-center justify-center gap-8 w-full">
      <div className="w-[300px]">
        <motion.div 
          className="w-full h-[300px]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <Doughnut 
            key={`donut-chart-${dataRefreshKey}`}
            id="myDonutChart"  
            data={chartData} 
            options={options} 
            plugins={[centerImage]}
          />
        </motion.div>
      </div>

      <div className="space-y-2">
        {/* Filtrer les valeurs nulles avant de mapper pour éviter les problèmes de clés */}
        {labels
          .map((label, index) => ({ label, value: data[index], index }))
          .filter(item => item.value > 0)
          .map(({ label, value, index }) => {
            const percentage = ((value / total) * 100).toFixed(1);
            
            return (
              <div key={`heat-loss-${label}-${index}`} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: `rgba(132,189,0, ${0.8 - (index * 0.15)})`
                  }}
                />
                <span className="text-sm">
                  {label} ({percentage}%)
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
};

const MotionCard = motion(Card);

export default function SummaryPage() {
  // Fonction utilitaire pour accéder à localStorage de manière sécurisée
  const getLocalStorageItem = (key: string, defaultValue: string = '') => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch (error) {
      return defaultValue;
    }
  };

  const [buildingData, setBuildingData] = useState<BuildingData | null>(null);
  const [compatibleProducts, setCompatibleProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deperditionsRecalculated, setDeperditionsRecalculated] = useState(false);
  
  // Les fonctions de calcul sont importées directement
  
  // États pour l'envoi par email
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [copyToUser, setCopyToUser] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correspondants, setCorrespondants] = useState<{email: string}[]>([]);
  const [newCorrespondantEmail, setNewCorrespondantEmail] = useState('');
  
  // États pour les documents à joindre
  const [includeDimensionnement, setIncludeDimensionnement] = useState(true);
  const [includeComparatif, setIncludeComparatif] = useState(false);
  const [includeDocCommercial, setIncludeDocCommercial] = useState(false);

  // États pour les informations du client et de l'installateur
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientPostalCode, setClientPostalCode] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  
  const [installerName, setInstallerName] = useState('');
  const [installerCompany, setInstallerCompany] = useState('');
  const [installerEmail, setInstallerEmail] = useState('');
  const [installerPhone, setInstallerPhone] = useState('');
  
  const [projectNotes, setProjectNotes] = useState('');
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showInfoForm, setShowInfoForm] = useState(false);
  
  // Récupérer le nom d'utilisateur depuis localStorage ou le paramètre supposé être dans sessionStorage
  const userName = typeof window !== 'undefined' ? 
    (getLocalStorageItem('user_name') || (typeof window !== 'undefined' ? sessionStorage.getItem('user_name') : null) || 'Moi') : 'Moi';
  
  // Information de l'utilisateur actuel (remplace les agents commerciaux)
  const currentUser = {
    id: 'current-user',
    name: userName,
    email: getLocalStorageItem('user_email') || userEmail || ''
  };

  const calculateTotalSurface = () => {
    const groundFloor = parseFloat(getLocalStorageItem('Surface_RDC', '0'));
    const firstFloor = parseFloat(getLocalStorageItem('Surface_1er_etage', '0'));
    const secondFloor = parseFloat(getLocalStorageItem('Surface_2e_etage', '0'));
    const buildingType = getLocalStorageItem('Type_de_construction');

    let total = groundFloor;
    if (buildingType === '1 Étage') {
      total += firstFloor;
    } else if (buildingType === '2 Étages') {
      total += firstFloor + secondFloor;
    }
    return total;
  };

  // Fonction pour recalculer les déperditions détaillées à partir des données sauvegardées
  const recalculateDeperditionsFromSavedData = () => {
    try {
      console.log('🔄 Recalcul des déperditions à partir des données sauvegardées...');
      
      // Construire l'objet formData à partir des données localStorage
      const formData = {
        hasExistingCalculation: false,
        knownDeperdition: getLocalStorageItem('ResultatDeperdition'),
        constructionYear: getLocalStorageItem('Annee_de_construction'),
        buildingType: getLocalStorageItem('Type_de_construction'),
        floors: {
          ground: {
            surface: getLocalStorageItem('Surface_RDC'),
            height: '2.5' // Valeur par défaut
          },
          first: {
            surface: getLocalStorageItem('Surface_1er_etage'),
            height: '2.5'
          },
          second: {
            surface: getLocalStorageItem('Surface_2e_etage'),
            height: '2.5'
          }
        },
        buildingStructure: getLocalStorageItem('Structure_de_la_construction'),
        groundStructure: getLocalStorageItem('Structure_du_sol'),
        showAdvancedOptions: false,
        wallThickness: getLocalStorageItem('wallThickness'),
        wallComposition: getLocalStorageItem('wallComposition'),
        interiorInsulation: {
          enabled: getLocalStorageItem('interiorInsulation') === 'true',
          material: getLocalStorageItem('interiorMaterial'),
          thickness: getLocalStorageItem('interiorThickness')
        },
        exteriorInsulation: {
          enabled: getLocalStorageItem('exteriorInsulation') === 'true',
          material: getLocalStorageItem('exteriorMaterial'),
          thickness: getLocalStorageItem('exteriorThickness')
        },
        atticInsulation: getLocalStorageItem('atticInsulation'),
        floorInsulation: getLocalStorageItem('floorInsulation'),
        windowSurface: getLocalStorageItem('Surface_de_vitrage'),
        windowType: getLocalStorageItem('windowType'),
        adjacency: getLocalStorageItem('Mitoyennete'),
        mainOrientation: getLocalStorageItem('mainOrientation'),
        ventilation: getLocalStorageItem('Ventilation'),
        heatingTemp: getLocalStorageItem('Temperature_de_chauffage'),
        department: getLocalStorageItem('Departement'),
        termsAccepted: true
      };

      console.log('📊 Données du formulaire reconstituées:', formData);
      
      // Debug des données localStorage importantes
      console.log('🔍 Debug localStorage:');
      console.log('- Surface RDC:', getLocalStorageItem('Surface_RDC'));
      console.log('- Surface 1er étage:', getLocalStorageItem('Surface_1er_etage'));
      console.log('- Surface 2e étage:', getLocalStorageItem('Surface_2e_etage'));
      console.log('- Type construction:', getLocalStorageItem('Type_de_construction'));
      console.log('- Structure construction:', getLocalStorageItem('Structure_de_la_construction'));
      console.log('- Année construction:', getLocalStorageItem('Annee_de_construction'));
      console.log('- Surface vitrage:', getLocalStorageItem('Surface_de_vitrage'));
      console.log('- Mitoyenneté:', getLocalStorageItem('Mitoyennete'));
      console.log('- Ventilation:', getLocalStorageItem('Ventilation'));
      console.log('- Département:', getLocalStorageItem('Departement'));
      console.log('- Température chauffage:', getLocalStorageItem('Temperature_de_chauffage'));

      // Utiliser directement les fonctions de calcul importées
      
      // Fonction utilitaire pour parser les nombres
      const safeParseFloat = (value: string | number): number => {
        const parsed = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(parsed) ? 0 : parsed;
      };

      // Calcul des pertes murales
      const wallLossParams = {
        surfaceRDC: safeParseFloat(formData.floors.ground.surface),
        surface1stFloor: safeParseFloat(formData.floors.first.surface),
        surface2ndFloor: safeParseFloat(formData.floors.second.surface),
        HSPRDC: safeParseFloat(formData.floors.ground.height),
        HSP1stFloor: safeParseFloat(formData.floors.first.height),
        HSP2ndFloor: safeParseFloat(formData.floors.second.height),
        buildingType: formData.buildingStructure || 'Carré',
        vitragePercentage: safeParseFloat(formData.windowSurface),
        mitoyennete: formData.adjacency || 'Non',
        constructionYear: formData.constructionYear || 'Avant 1974'
      };
      
      console.log('🏠 Paramètres calcul murs:', wallLossParams);
      const wallLossData = calculateWallLoss(wallLossParams);
      console.log('🏠 Résultat calcul murs:', wallLossData);

      // Calcul des autres pertes
      const windowLossValue = calculateWindowLoss({
        wallLossData,
        vitrageType: formData.windowType || 'SV Métal'
      });

      const roofLossValue = calculateRoofLoss({
        surfaceRDC: safeParseFloat(formData.floors.ground.surface),
        etatCombles: formData.atticInsulation,
        constructionYear: formData.constructionYear
      });

      const floorLossValue = calculateFloorLoss({
        surfaceRDC: safeParseFloat(formData.floors.ground.surface),
        constructionYear: formData.constructionYear,
        floorType: formData.groundStructure,
        typeDeConstruction: formData.buildingType,
        isAdvancedOptionChecked: formData.showAdvancedOptions,
        etatIsolationEtages: formData.floorInsulation
      });

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

      const thermalBridgeValue = calculateThermalBridge(
        formData.constructionYear,
        {
          airNeufLoss: airLossValue,
          floorLoss: floorLossValue,
          windowLoss: windowLossValue,
          roofLoss: roofLossValue
        }
      );

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

      const result = {
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
      
      if (result && result.details) {
        console.log('✅ Résultats du calcul:', result);
        
        // Sauvegarder les résultats détaillés dans sessionStorage
        sessionStorage.setItem('ResultatDeperdition', result.totalLoss.toString());
        sessionStorage.setItem('windowHeatLoss', result.details.windowLoss.toString());
        sessionStorage.setItem('roofHeatLoss', result.details.roofLoss.toString());
        sessionStorage.setItem('FloorHeatLoss', result.details.floorLoss.toString());
        sessionStorage.setItem('airNeufLoss', result.details.airLoss.toString());
        sessionStorage.setItem('thermalBridgeLoss', result.details.thermalBridge.toString());
        
        // Calculer les déperditions des murs (total - autres)
        const wallLoss = result.totalLoss - (result.details.windowLoss + result.details.roofLoss + result.details.floorLoss + result.details.airLoss + result.details.thermalBridge);
        sessionStorage.setItem('wallHeatLoss', Math.max(0, wallLoss).toString());
        
        console.log('💾 Déperditions détaillées sauvegardées dans sessionStorage');
        console.log('🏠 Murs:', Math.max(0, wallLoss).toFixed(1), 'kW');
        console.log('🪟 Fenêtres:', result.details.windowLoss.toFixed(1), 'kW');
        console.log('🏠 Toit:', result.details.roofLoss.toFixed(1), 'kW');
        console.log('🏠 Sol:', result.details.floorLoss.toFixed(1), 'kW');
        console.log('💨 Air neuf:', result.details.airLoss.toFixed(1), 'kW');
        console.log('🌉 Ponts thermiques:', result.details.thermalBridge.toFixed(1), 'kW');
        
        setDeperditionsRecalculated(true);
        return true;
      } else {
        console.error('❌ Erreur: Résultats de calcul invalides');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors du recalcul des déperditions:', error);
      return false;
    }
  };


// Fonction pour obtenir la puissance disponible pour les produits en cascade
function getPuissanceDisponibleCascade(
  produit: Product,
  puissanceRequise: number
): PowerModel | null {
  if (!produit.Puissance.increment || !produit.Puissance.baseModele || !produit.Puissance.caracteristiques) {
    return null;
  }

  // Arrondir à l'incrément supérieur
  const increment = produit.Puissance.increment;
  const puissanceArrondie = Math.ceil(puissanceRequise / increment) * increment;

  // Vérifier si la puissance est dans la plage possible
  if (puissanceArrondie < produit.Puissance.min || puissanceArrondie > produit.Puissance.max) {
    return null;
  }

  const caract = produit.Puissance.caracteristiques;
  return {
    modele: `${produit.Puissance.baseModele} - ${puissanceArrondie} KW`,
    puissance_calo: puissanceArrondie,
    puissance_frigo: puissanceArrondie * caract.ratio_frigo,
    puissance_absorbee: puissanceArrondie * caract.ratio_absorbee,
    cop: caract.cop_moyen,
    etas: caract.etas_moyen
  };
}

const loadData = async () => {
  try {
    const response = await fetch('/data/products.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const products = data.products as Product[];
    
    // Récupération des données de localStorage
    const typePac = getLocalStorageItem('type_pac');
    const heatLoss = parseFloat(getLocalStorageItem('ResultatDeperdition') || 
                              getLocalStorageItem('ResultatDeperdition1') || '0');

    const filterCriteria = {
      heatLoss,
      heatPumpType: heatPumpTypeMap[typePac] || typePac,
      heatPumpSystem: getLocalStorageItem('systeme_pac'),
      emitterType: getLocalStorageItem('emetteur_type'),
      emitterTemp: getLocalStorageItem('emetteur_type') === 'radiateur'
        ? parseFloat(getLocalStorageItem('temp_radiateur') || '35')
        : parseFloat(getLocalStorageItem('temp_plancher') || '25')
    };

    const filtered = products.filter((product: Product) => {
      // Vérifications de base
      const isTypeCompatible = product.Particularites.includes(filterCriteria.heatPumpType);
      const isSystemCompatible = product.Particularites.includes(filterCriteria.heatPumpSystem);
      const isEmitterCompatible = filterCriteria.emitterTemp <= product.Emetteur.max &&
                                filterCriteria.emitterTemp >= product.Emetteur.min;

      if (!isTypeCompatible || !isSystemCompatible || !isEmitterCompatible) {
        return false;
      }

      // Gestion de la sélection de puissance
      if (product.Puissance.increment) {
        // Produits en cascade
        const cascadeModel = getPuissanceDisponibleCascade(product, filterCriteria.heatLoss);
        if (cascadeModel) {
          product.Puissance.disponibles = [cascadeModel];
          product.selectedModel = cascadeModel;
          return true;
        }
      } else if (product.Puissance.disponibles) {
        // Produits standards - Garder tous les modèles compatibles
        const modelesOrdonnes = [...product.Puissance.disponibles].sort(
          (a, b) => a.puissance_calo - b.puissance_calo
        );

        // Exclusion si puissance minimale trop élevée
        if (product.Puissance.min > filterCriteria.heatLoss * 1.5) {
          return false;
        }

        // Trouver tous les modèles compatibles (puissance >= déperditions)
        const modelesCompatibles = modelesOrdonnes.filter(
          modele => modele.puissance_calo >= filterCriteria.heatLoss
        );

        if (modelesCompatibles.length > 0) {
          // Garder tous les modèles compatibles pour permettre le choix
          product.Puissance.disponibles = modelesCompatibles;
          // Sélectionner par défaut le modèle avec la puissance la plus proche
          product.selectedModel = modelesCompatibles[0];
          localStorage.setItem('selected_product', JSON.stringify(product));
          return true;
        }
      }

      return false;
    });

    setCompatibleProducts(filtered);
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
  }
};
const router = useRouter();

useEffect(() => {
  // Récupérer le département
  const department = getLocalStorageItem('Departement') || undefined;
  
  // Extraire le numéro de département et obtenir la température correspondante
  let externalTemp = '-15'; // Valeur par défaut
  if (department) {
    const deptNumber = department.replace(/\D/g, '');
    if (deptNumber && DEPARTEMENT_TEMPERATURES[deptNumber]) {
      externalTemp = DEPARTEMENT_TEMPERATURES[deptNumber].toString();
    }
  }
  
  // Vérifier si c'est un système SOL/SOL pour forcer les options
  const heatPumpSystem = getLocalStorageItem('systeme_pac');
  const isSolSolSystem = heatPumpSystem === 'Sol/Sol';

  const newBuildingData: BuildingData = {
    constructionYear: getLocalStorageItem('Annee_de_construction') || undefined,
    buildingType: getLocalStorageItem('Type_de_construction') || undefined,
    heatLoss: getLocalStorageItem('ResultatDeperdition') || 
              getLocalStorageItem('ResultatDeperdition1') || undefined,
    totalSurface: calculateTotalSurface(),
    ventilation: getLocalStorageItem('Ventilation') || undefined,
    heatingTemp: getLocalStorageItem('Temperature_de_chauffage') || undefined,
    department: department,
    structure: getLocalStorageItem('Structure_de_la_construction') || undefined,
    groundStructure: getLocalStorageItem('Structure_du_sol') || undefined,
    windowSurface: getLocalStorageItem('Surface_de_vitrage') || undefined,
    adjacency: getLocalStorageItem('Mitoyennete') || undefined,
    // Pour les systèmes SOL/SOL, forcer les options à "Non"
    poolKit: isSolSolSystem ? 'Non' : (getLocalStorageItem('kit_piscine') || undefined),
    freecoolingKit: isSolSolSystem ? 'Non' : (getLocalStorageItem('kit_freecooling') || undefined),
    hotWater: isSolSolSystem ? 'Non' : (getLocalStorageItem('kit_ECS') || undefined),
    heatPumpType: getLocalStorageItem('type_pac') || undefined,
    heatPumpSystem: heatPumpSystem || undefined,
    externalTemp: externalTemp
  };

  setBuildingData(newBuildingData);
  loadData();
  
  const timer = setTimeout(() => {
    setIsLoading(false);
  }, 3000);

  return () => clearTimeout(timer);
}, []);

// useEffect pour recalculer les déperditions détaillées si nécessaire
useEffect(() => {
  // Vérifier si on a des données dans localStorage mais pas dans sessionStorage
  const hasLocalStorageData = getLocalStorageItem('ResultatDeperdition');
  const hasSessionStorageData = sessionStorage.getItem('windowHeatLoss') || 
                                sessionStorage.getItem('roofHeatLoss') ||
                                sessionStorage.getItem('FloorHeatLoss');
  
  console.log('🔍 Vérification des données:');
  console.log('- localStorage ResultatDeperdition:', hasLocalStorageData);
  console.log('- sessionStorage détails:', hasSessionStorageData);
  
  // Si on a des données dans localStorage mais pas les détails dans sessionStorage
  if (hasLocalStorageData && !hasSessionStorageData && !deperditionsRecalculated) {
    console.log('🔄 Détection d\'un dossier sauvegardé sans détails - Recalcul nécessaire');
    
    // Attendre un peu que le composant soit bien monté
    const timer = setTimeout(() => {
      const success = recalculateDeperditionsFromSavedData();
      if (success) {
        console.log('✅ Recalcul des déperditions réussi');
      } else {
        console.log('❌ Échec du recalcul des déperditions');
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }
}, [buildingData, deperditionsRecalculated]);

  // Fonctions pour l'envoi par email
  const handleEmailModalOpen = () => {
    setIsEmailModalOpen(true);
  };
  
  // Ajout d'un écouteur d'événement pour détecter le clic sur le bouton dans ProductShowcase
  useEffect(() => {
    const handleOpenEmailModal = () => {
      handleEmailModalOpen();
    };
    
    window.addEventListener('openEmailModal', handleOpenEmailModal);
    
    return () => {
      window.removeEventListener('openEmailModal', handleOpenEmailModal);
    };
  }, []);
  
  const handleEmailModalClose = () => {
    setIsEmailModalOpen(false);
    setSelectedAgent('');
    setCopyToUser(false);
    setUserEmail('');
    setCorrespondants([]);
    setNewCorrespondantEmail('');
    
    // Réinitialiser les informations du formulaire client
    setClientName('');
    setClientPhone('');
    setClientAddress('');
    setClientCity('');
    setClientPostalCode('');
    setClientEmail('');
    
    // Réinitialiser les informations de l'installateur
    setInstallerName('');
    setInstallerCompany('');
    setInstallerEmail('');
    setInstallerPhone('');
    
    // Réinitialiser les autres informations
    setProjectNotes('');
    setShowAdditionalInfo(false);
    setShowInfoForm(false);
    
    // Ne pas réinitialiser les documents à joindre pour conserver les préférences de l'utilisateur
  };
  
  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId);
  };
  
  const addCorrespondant = () => {
    // Vérification simple d'email valide
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCorrespondantEmail)) {
      toast.error("Veuillez saisir une adresse email valide");
      return;
    }
    
    // Vérifier si l'email existe déjà
    if (correspondants.some(c => c.email === newCorrespondantEmail)) {
      toast.error("Cet email est déjà dans la liste des correspondants");
      return;
    }
    
    // Vérifier si la limite de 5 correspondants est atteinte
    if (correspondants.length >= 5) {
      toast.error("Vous ne pouvez pas ajouter plus de 5 correspondants");
      return;
    }
    
    setCorrespondants([...correspondants, { email: newCorrespondantEmail }]);
    setNewCorrespondantEmail('');
  };
  
  const removeCorrespondant = (index: number) => {
    const newCorrespondants = [...correspondants];
    newCorrespondants.splice(index, 1);
    setCorrespondants(newCorrespondants);
  };
  
  const sendPdfByEmail = async () => {
    if (selectedAgent !== 'current-user') {
      toast.error("Veuillez sélectionner un destinataire");
      return;
    }

    if (!userEmail) {
      toast.error("Veuillez saisir votre email");
      return;
    }
    
    // Vérifier qu'au moins un document est sélectionné
    if (!includeDimensionnement && !includeComparatif && !includeDocCommercial) {
      toast.error("Veuillez sélectionner au moins un document à joindre");
      return;
    }
    
    // Vérifier les champs obligatoires pour le dimensionnement
    if (includeDimensionnement && showInfoForm) {
      if (!clientName.trim()) {
        toast.error("Veuillez saisir le nom du client");
        return;
      }
      
      if (!installerName.trim()) {
        toast.error("Veuillez saisir le nom de l'installateur");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Utiliser l'utilisateur actuel comme destinataire principal
      const selectedAgentData = {
        id: 'current-user',
        name: userName,
        email: userEmail
      };
      
      // Trouver le produit sélectionné s'il y en a un (en utilisant une propriété qui pourrait exister)
      const selectedProduct = compatibleProducts.find(product => (product as any).selected) || compatibleProducts[0];
      
      // Préparer les données pour générer le PDF
      const pdfData = {
        fileName: `dossier_nextherm_${new Date().toISOString().split('T')[0]}`,
        // building sera assigné plus tard après vérification que buildingData n'est pas null
        selectedProduct: selectedProduct,
        referenceNumber: `REF-${new Date().getTime()}`,
        clientInfo: {
          name: includeDimensionnement && showInfoForm ? clientName : (getLocalStorageItem('Nom_client') || ''),
          address: includeDimensionnement && showInfoForm ? clientAddress : (getLocalStorageItem('Adresse_client') || ''),
          phone: includeDimensionnement && showInfoForm ? clientPhone : '',
          city: includeDimensionnement && showInfoForm ? clientCity : '',
          postalCode: includeDimensionnement && showInfoForm ? clientPostalCode : '',
          email: includeDimensionnement && showInfoForm ? clientEmail : '',
        },
        installerInfo: {
          company: includeDimensionnement && showInfoForm ? installerCompany : '',
          contact: includeDimensionnement && showInfoForm ? installerName : (selectedAgentData?.name || ''),
          email: includeDimensionnement && showInfoForm ? installerEmail : (selectedAgentData?.email || ''),
          phone: includeDimensionnement && showInfoForm ? installerPhone : '',
        },
        projectNotes: includeDimensionnement && showInfoForm ? projectNotes : '',
      };
      
      // Vérifier que buildingData n'est pas null avant de générer le PDF
      if (!buildingData) {
        throw new Error("Données du bâtiment manquantes");
      }
      
      // Générer le PDF en base64
      const pdfBase64 = await generateModernPdf({
        ...pdfData,
        building: buildingData // Maintenant on est sûr que buildingData n'est pas null
      }, true) as string;
      
      // Envoyer le PDF par email
      // Vérifier qu'au moins un document est sélectionné
      if (!includeDimensionnement && !includeComparatif && !includeDocCommercial) {
        toast.error("Veuillez sélectionner au moins un document à joindre");
        setIsSubmitting(false);
        return;
      }

      // Générer le PDF comparatif si sélectionné
      let comparatifPdfBase64 = null;
      if (includeComparatif) {
        try {
          // Calculer les besoins énergétiques annuels en kWh
          const yearlyEnergyNeed = buildingData?.heatLoss ? Number(buildingData.heatLoss) * 2000 / 1000 : 10000; // Approximation basée sur les déperditions

          // Système de chauffage PAC sélectionné
          const selectedSystemCOP = selectedProduct?.selectedModel?.cop || 4.0;
          const selectedSystemEfficiency = selectedSystemCOP * 100; // COP converti en pourcentage

          // Préparer les systèmes de chauffage pour la comparaison
          const heatingSystems: HeatingSystemPdf[] = [
            {
              name: 'PAC NEXTHERM',
              type: 'pac', // PAC
              icon: null, // Requéris par l'interface mais non utilisé pour la génération PDF
              color: '#86BC29', // Vert NEXTHERM
              installationCost: 15000,
              efficiency: selectedSystemEfficiency, // En pourcentage, basé sur le COP
              maintenanceCost: 200,
              energyType: 'electricity',
              co2Factor: 0.057 // kg CO2/kWh pour l'électricité française
            },
            {
              name: 'Chaudière gaz',
              type: 'gaz', // Gaz
              icon: null,
              color: '#3498db', // Bleu
              installationCost: 8000,
              efficiency: 95, // En pourcentage
              maintenanceCost: 180,
              energyType: 'gas',
              co2Factor: 0.205 // kg CO2/kWh pour le gaz
            },
            {
              name: 'Chaudière fioul',
              type: 'fioul', // Fioul
              icon: null,
              color: '#e74c3c', // Rouge
              installationCost: 7000,
              efficiency: 89, // En pourcentage
              maintenanceCost: 220,
              energyType: 'oil',
              co2Factor: 0.324 // kg CO2/kWh pour le fioul
            },
            {
              name: 'Radiateurs électriques',
              type: 'electrique', // Électrique
              icon: null,
              color: '#f39c12', // Orange
              installationCost: 5000,
              efficiency: 100, // En pourcentage
              maintenanceCost: 50,
              energyType: 'electricity',
              co2Factor: 0.057 // kg CO2/kWh pour l'électricité
            }
          ];

          // Préparer les données pour le PDF comparatif
          const comparatifData = {
            buildingData,
            projectName: 'Projet NEXTHERM', // Nom générique
            buildingName: 'Bâtiment', // Type de bâtiment générique
            selectedProduct,
            selectedModel: selectedProduct?.selectedModel,
            heatingSystems: heatingSystems as any,
            yearlyEnergyNeed,
            selectedPeriod: 10, // Période par défaut de 10 ans
            chartType: 'cost' as const,
            // Valeurs d'énergie par défaut
            energyPrices: {
              electricity: 0.2156, // €/kWh
              gas: 0.118, // €/kWh
              oil: 0.125 // €/kWh
            }
          };
          
          console.log('Génération du PDF comparatif...');
          comparatifPdfBase64 = await generateComparatifPdf(comparatifData, true);
        } catch (error) {
          console.error('Erreur lors de la génération du PDF comparatif:', error);
          toast.error("Erreur lors de la génération du PDF comparatif");
        }
      }

      // Rechercher et préparer la documentation commerciale si sélectionnée
      let docCommercialUrl = null;
      let docCommercialBase64 = null;
      if (includeDocCommercial && selectedProduct) {
        // Récupérer l'URL de la documentation du produit (utiliser BrochureURL existant si documentationUrl n'existe pas)
        docCommercialUrl = selectedProduct.documentationUrl || selectedProduct.BrochureURL || null;
        
        if (docCommercialUrl) {
          try {
            // Utiliser notre API pour récupérer le document en base64
            const apiResponse = await fetch('/api/fetch-document', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                documentUrl: docCommercialUrl,
              }),
            });
            
            if (apiResponse.ok) {
              const data = await apiResponse.json();
              if (data.success && data.documentBase64) {
                docCommercialBase64 = data.documentBase64;
                console.log('Documentation commerciale récupérée avec succès via API');
              } else {
                console.error('Erreur API:', data.error);
                toast.warning("Impossible de récupérer la documentation commerciale");
              }
            } else {
              console.error('Erreur lors de l\'appel API pour la documentation:', apiResponse.status);
              toast.warning("Impossible de récupérer la documentation commerciale");
            }
          } catch (error) {
            console.error('Erreur lors de la récupération de la documentation:', error);
            toast.warning("Problème lors de la récupération de la documentation commerciale");
          }
        } else {
          toast.warning("Documentation commerciale non disponible pour ce produit");
        }
      }

      const response = await fetch('/api/send-pdf-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buildingData,
          pdfBase64: includeDimensionnement ? pdfBase64 : null,
          comparatifPdfBase64,
          docCommercialBase64,
          docCommercialUrl,
          fileName: pdfData.fileName,
          agentEmail: selectedAgentData?.email,
          agentName: selectedAgentData?.name,
          // Liste des correspondants
          correspondants: correspondants.map(c => c.email),
          userEmail,
          // Indiquer quels documents sont inclus
          includeDimensionnement,
          includeComparatif,
          includeDocCommercial
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Dossier envoyé avec succès à votre adresse email${correspondants.length > 0 ? ' et aux correspondants' : ''}!`);
        
        // Si nous avons une URL de prévisualisation (en mode test), l'afficher dans la console
        if (data.previewUrl) {
          console.log('URL de prévisualisation de l\'email:', data.previewUrl);
          // Ne pas ouvrir automatiquement l'URL, juste afficher un toast avec l'information
          toast.info(
            "Email envoyé avec succès. Vérifiez vos spams si vous ne le recevez pas.",
            { duration: 5000 }
          );
        }
        
        handleEmailModalClose();
      } else {
        toast.error("Erreur lors de l'envoi du dossier");
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de l'envoi du dossier");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
                <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative space-y-8 flex flex-col items-center"
        >
          {/* Arbre en croissance */}
          <motion.div className="relative w-60 h-60">
            {/* Tronc principal */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 bg-[#8B4513] rounded-sm"
            />
  
            {/* Les 3 boules de feuillage - Voici les positions à ajuster */}
            {/* Boule principale - centre */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="absolute w-28 h-28 rounded-full bg-[#86BC29]"
              style={{
                // Ajuster left pour déplacer horizontalement (50% = centre)
                left: '28%',
                // Ajuster top pour déplacer verticalement (plus petit = plus haut)
                top: '20%',
                transform: 'translate(-50%, -50%)'
              }}
            />
  
            {/* Boule gauche */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.7, duration: 0.5 }}
              className="absolute w-24 h-24 rounded-full bg-[#86BC29]"
              style={{
                // Réduire le pourcentage pour déplacer vers la gauche
                left: '18%',
                // Ajuster pour aligner verticalement
                top: '20%',
                transform: 'translate(-50%, -50%)'
              }}
            />
  
            {/* Boule droite */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.9, duration: 0.5 }}
              className="absolute w-24 h-24 rounded-full bg-[#86BC29]"
              style={{
                // Augmenter le pourcentage pour déplacer vers la droite
                left: '45%',
                // Ajuster pour aligner verticalement
                top: '28%',
                transform: 'translate(-50%, -50%)'
              }}
            />
          
          <motion.div
                key="fruit-1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 2.1, duration: 0.3 }}
                className="absolute w-3 h-3 rounded-full bg-red-500"
                style={{
                  left: '32%',
                  top: '40%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              <motion.div
                key="fruit-2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 2.1, duration: 0.3 }}
                className="absolute w-3 h-3 rounded-full bg-red-500"
                style={{
                  left: '58%',
                  top: '34%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />

              <motion.div
                key="fruit-3"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 2.3, duration: 0.3 }}
                className="absolute w-3 h-3 rounded-full bg-red-500"
                style={{
                  left: '65%',
                  top: '58%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                  />

                
          {/* Feuilles qui tombent - avec timing ajusté */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={`falling-leaf-${i}`}
                  initial={{ 
                    left: 100 + (i * 40),
                    top: 50,
                    opacity: 0,
                    rotate: 0
                  }}
                  animate={{ 
                    left: [
                      60 + (i * 40),
                      80 + (i * 40),
                      60 + (i * 40),
                      40 + (i * 40),
                      60 + (i * 40)
                    ],
                    top: [
                      100,
                      130,
                      160,
                      180,
                      220
                    ],
                    opacity: [0, 0.4, 0.7, 0.5, 0], // Ajusté pour être plus subtil
                    rotate: [0, 15, -15, 15, 0],
                    scale: [0.75, 0.8, 0.85, 0.75, 0.70]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: 1 + (i * 0.8), // Délai augmenté pour commencer après la construction complète
                    ease: [0.45, 0.05, 0.55, 0.95],
                    times: [0, 0.25, 0.5, 0.75, 1]
                  }}
                  className="absolute w-3 h-3 rounded-full bg-[#86BC29]/30"
                  style={{
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 2px rgba(134, 188, 41, 0.3)'
                  }}
                />
              ))}
        </motion.div>

        {/* Message de chargement */}
        <motion.div 
          className="text-center space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-medium text-[#86BC29]">
            Chargement de vos résultats
          </h3>
          <motion.p 
            className="text-sm text-gray-500"
            animate={{
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Nous préparons une solution durable pour vous
          </motion.p>
        </motion.div>

        {/* Barre de progression */}
        <motion.div 
          className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner"
          initial={{ opacity: 0, scaleX: 0.8 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-[#86BC29] to-[#9BD834]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};
  if (!buildingData) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="content-container"
        id="pdf-content"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="max-w-7xl mx-auto p-6"
      >
        <motion.div
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-[#86BC29]">NEXTHERM</span> - Votre Solution
          </h1>
          <div className="text-lg text-gray-600 font-medium">
            Étape 3/4
          </div>
        </motion.div>

        <Card className="mb-8 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-[#86BC29]/10 to-transparent">
            <CardTitle className="flex items-center text-2xl">
              <ThermometerSun className="w-7 h-7 mr-3 text-[#86BC29]" />
              Déperditions estimées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center py-12 px-4">
                <div className="inline-flex items-center justify-center p-10 bg-[#86BC29]/10 rounded-3xl mb-6">
                  <div className="text-7xl font-bold text-[#86BC29]">
                    {buildingData.heatLoss}
                    <span className="text-4xl ml-2">kW</span>
                  </div>
                </div>
                <div className="flex justify-center items-center gap-2 text-gray-600">
                  <Wind className="w-6 h-6 text-[#86BC29]" />
                  <p className="text-xl">Déperdition totale estimée*</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <HeatLossDonut deperditionsRecalculated={deperditionsRecalculated} />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Caractéristiques du bâtiment */}
        <BuildingCharacteristicsSection buildingData={buildingData} />
        {/* Titre des produits compatibles */}
        <motion.h2
          variants={fadeInUp}
          className="text-3xl font-bold text-center mb-8 mt-16"
        >
          <span className="text-4xl text-[#86BC29]">Nos Produits Compatibles NEXTHERM</span>
        </motion.h2>

        {/* Section des produits compatibles */}
        {compatibleProducts.length > 0 && (
          <Card className="mb-8 overflow-hidden border-none shadow-lg">
            <CardContent className="p-0">
              <ProductShowcase 
                products={compatibleProducts} 
                buildingData={buildingData} 
              />
            </CardContent>
          </Card>
        )}

        {/* Le bouton d'envoi par email a été déplacé dans le composant ProductShowcase */}
      </motion.div>

      {/* Modal d'envoi par email */}
      <Dialog key="email-dialog" open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="sm:max-w-md" key="email-dialog-content">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#86BC29]">
              <Send className="w-5 h-5" />
              Envoyer le dossier par email
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Sélection du destinataire */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Destinataire principal *
              </Label>
              <div className="space-y-2">
                {/* Sélection automatique de l'utilisateur actuel */}
                <div
                  key="current-user"
                  className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedAgent === 'current-user' || !selectedAgent
                      ? 'border-[#86BC29] bg-[#86BC29]/5'
                      : 'border-gray-200'
                  }`}
                  onClick={() => handleAgentSelect('current-user')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{userName}</p>
                      <div className="mt-2">
                        <Input
                          id="userEmail"
                          type="email"
                          placeholder="votre.email@exemple.com"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="focus:ring-[#86BC29] focus:border-[#86BC29] text-sm"
                        />
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedAgent === 'current-user' || !selectedAgent
                        ? 'border-[#86BC29] bg-[#86BC29]'
                        : 'border-gray-300'
                    }`}>
                      {(selectedAgent === 'current-user' || !selectedAgent) && (
                        <div key="user-indicator" className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Correspondants supplémentaires */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Correspondants supplémentaires
              </Label>
              
              {/* Liste des correspondants existants */}
              {correspondants.length > 0 && (
                <div className="space-y-2 mb-2">
                  {correspondants.map((corr, index) => (
                    <div key={`corr-${index}`} className="flex items-center justify-between p-2 border rounded-lg border-gray-200">
                      <span className="text-sm">{corr.email}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeCorrespondant(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Champ pour ajouter un nouveau correspondant */}
              <div className="flex flex-col mt-2 space-y-2">
                <Input
                  type="email"
                  placeholder="Email du correspondant"
                  value={newCorrespondantEmail}
                  onChange={(e) => setNewCorrespondantEmail(e.target.value)}
                  className="text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCorrespondant();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={addCorrespondant} 
                  variant="outline"
                  size="sm"
                  className="border-[#86BC29] text-[#86BC29] hover:bg-[#86BC29] hover:text-white self-start flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M12 5v14M5 12h14"></path></svg>
                  Ajouter un correspondant
                </Button>
              </div>
            </div>

            {/* Documents à joindre */}
            <div className="space-y-3">
              <Label className="font-medium">
                Documents à joindre *
              </Label>
              <div className="space-y-2 pl-1">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2" key="container-dimensionnement">
                    <Checkbox
                      id="includeDimensionnement"
                      checked={includeDimensionnement}
                      onCheckedChange={(checked) => {
                        const isChecked = checked === true;
                        setIncludeDimensionnement(isChecked);
                        // Toujours afficher le formulaire quand dimensionnement est sélectionné
                        setShowInfoForm(isChecked);
                      }}
                      className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                    />
                    <Label htmlFor="includeDimensionnement" className="text-sm font-medium text-gray-700">
                      Dimensionnement
                    </Label>
                  </div>
                  
                  {/* Formulaire d'informations pour le dimensionnement */}
                  {includeDimensionnement && (
                    <div className="ml-6 p-3 bg-gray-50 rounded-md border border-gray-200 space-y-4">
                      <h4 className="font-medium text-sm text-gray-700">Informations pour le dossier</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs mb-1" htmlFor="clientName">
                            Nom du client
                          </Label>
                          <Input
                            id="clientName"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="Nom du client"
                            className="focus:ring-[#86BC29] focus:border-[#86BC29] text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1" htmlFor="installerName">
                            Nom de l'installateur
                          </Label>
                          <Input
                            id="installerName"
                            value={installerName}
                            onChange={(e) => setInstallerName(e.target.value)}
                            placeholder="Nom de l'installateur"
                            className="focus:ring-[#86BC29] focus:border-[#86BC29] text-sm"
                          />
                        </div>
                      </div>
                      
                      {/* Menu déroulant pour afficher plus d'informations */}
                      <div>
                        <div 
                          className="flex items-center cursor-pointer text-sm text-[#86BC29] hover:underline" 
                          onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                        >
                          <span className="mr-1">{showAdditionalInfo ? "Masquer" : "Voir"} les informations complémentaires</span>
                          {showAdditionalInfo ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                          )}
                        </div>
                        
                        {showAdditionalInfo && (
                          <div className="mt-3 space-y-4">
                            <div className="space-y-3">
                              <p className="text-xs text-gray-500 font-medium">Informations client</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs mb-1" htmlFor="clientPhone">
                                    Téléphone
                                  </Label>
                                  <Input
                                    id="clientPhone"
                                    value={clientPhone}
                                    onChange={(e) => setClientPhone(e.target.value)}
                                    placeholder="Téléphone"
                                    className="focus:ring-[#86BC29] focus:border-[#86BC29] text-sm"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs mb-1" htmlFor="clientEmail">
                                    Email
                                  </Label>
                                  <Input
                                    id="clientEmail"
                                    value={clientEmail}
                                    onChange={(e) => setClientEmail(e.target.value)}
                                    placeholder="Email"
                                    className="focus:ring-[#86BC29] focus:border-[#86BC29] text-sm"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-xs mb-1" htmlFor="clientAddress">
                                  Adresse
                                </Label>
                                <Input
                                  id="clientAddress"
                                  value={clientAddress}
                                  onChange={(e) => setClientAddress(e.target.value)}
                                  placeholder="Adresse"
                                  className="focus:ring-[#86BC29] focus:border-[#86BC29] text-sm"
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs mb-1" htmlFor="clientCity">
                                    Ville
                                  </Label>
                                  <Input
                                    id="clientCity"
                                    value={clientCity}
                                    onChange={(e) => setClientCity(e.target.value)}
                                    placeholder="Ville"
                                    className="focus:ring-[#86BC29] focus:border-[#86BC29] text-sm"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs mb-1" htmlFor="clientPostalCode">
                                    Code postal
                                  </Label>
                                  <Input
                                    id="clientPostalCode"
                                    value={clientPostalCode}
                                    onChange={(e) => setClientPostalCode(e.target.value)}
                                    placeholder="Code postal"
                                    className="focus:ring-[#86BC29] focus:border-[#86BC29] text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <p className="text-xs text-gray-500 font-medium">Informations installateur</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs mb-1" htmlFor="installerCompany">
                                    Société
                                  </Label>
                                  <Input
                                    id="installerCompany"
                                    value={installerCompany}
                                    onChange={(e) => setInstallerCompany(e.target.value)}
                                    placeholder="Société"
                                    className="focus:ring-[#86BC29] focus:border-[#86BC29] text-sm"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs mb-1" htmlFor="installerPhone">
                                    Téléphone
                                  </Label>
                                  <Input
                                    id="installerPhone"
                                    value={installerPhone}
                                    onChange={(e) => setInstallerPhone(e.target.value)}
                                    placeholder="Téléphone"
                                    className="focus:ring-[#86BC29] focus:border-[#86BC29] text-sm"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-xs mb-1" htmlFor="installerEmail">
                                  Email
                                </Label>
                                <Input
                                  id="installerEmail"
                                  value={installerEmail}
                                  onChange={(e) => setInstallerEmail(e.target.value)}
                                  placeholder="Email"
                                  className="focus:ring-[#86BC29] focus:border-[#86BC29] text-sm"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-xs mb-1" htmlFor="projectNotes">
                                Notes sur le projet
                              </Label>
                              <textarea
                                id="projectNotes"
                                value={projectNotes}
                                onChange={(e) => setProjectNotes(e.target.value)}
                                placeholder="Notes ou commentaires supplémentaires"
                                className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-[#86BC29] focus:border-[#86BC29]"
                                rows={3}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2" key="container-comparatif">
                  <Checkbox
                    id="includeComparatif"
                    checked={includeComparatif}
                    onCheckedChange={(checked) => setIncludeComparatif(checked === true)}
                    className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                  />
                  <Label htmlFor="includeComparatif" className="text-sm font-medium text-gray-700">
                    Comparatif
                  </Label>
                </div>
                <div className="flex items-center space-x-2" key="container-doccommercial">
                  <Checkbox
                    id="includeDocCommercial"
                    checked={includeDocCommercial}
                    onCheckedChange={(checked) => setIncludeDocCommercial(checked === true)}
                    className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                  />
                  <Label htmlFor="includeDocCommercial" className="text-sm font-medium text-gray-700">
                    Doc commercial
                  </Label>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={handleEmailModalClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                onClick={sendPdfByEmail}
                disabled={isSubmitting || !selectedAgent}
                className="bg-[#86BC29] hover:bg-[#86BC29]/90 text-white"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    <span>Envoi...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="w-4 h-4 mr-2" />
                    <span>Envoyer</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
}