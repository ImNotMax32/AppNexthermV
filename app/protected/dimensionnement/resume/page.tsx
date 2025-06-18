'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
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
  Droplets
} from 'lucide-react';
import ProductShowcase from './ProductShowcase';
import { Product } from '@/app/protected/dimensionnement/resume/types/product';
import SaveCalculation from '@/components/SaveCalculation';
import { useRouter } from 'next/navigation';
import BuildingCharacteristicsSection from '@/components/BuildingCharacteristicsSection';
import { Edit } from 'lucide-react';
import { BuildingData } from './types/building';
import { DEPARTEMENT_TEMPERATURES } from './utils/deperditionCalculator';

interface PowerCharacteristics {
  ratio_frigo: number;
  ratio_absorbee: number;
  cop_moyen: number;
  etas_moyen: number;
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

const HeatLossDonut = () => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const imageRef = useRef<HTMLImageElement | null>(null);

  const getStorageValue = (key: string): number => {
    const value = sessionStorage.getItem(key);
    return value ? parseFloat(value) : 0;
  };
  

  const data = [
    getStorageValue('ResultatDeperdition') || 300,
    getStorageValue('windowHeatLoss'),
    getStorageValue('roofHeatLoss'),
    getStorageValue('FloorHeatLoss'),
    getStorageValue('airNeufLoss'),
    getStorageValue('thermalBridgeLoss')
  ];

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
            id="myDonutChart"  
            data={chartData} 
            options={options} 
            plugins={[centerImage]}
          />
        </motion.div>
      </div>

      <div className="space-y-2">
        {labels.map((label, index) => {
          const value = data[index];
          if (value === 0) return null;
          
          const percentage = ((value / total) * 100).toFixed(1);
          
          return (
            <div key={label} className="flex items-center gap-3">
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
  const [buildingData, setBuildingData] = useState<BuildingData | null>(null);
  const [compatibleProducts, setCompatibleProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const calculateTotalSurface = () => {
    const groundFloor = parseFloat(localStorage.getItem('Surface_RDC') || '0');
    const firstFloor = parseFloat(localStorage.getItem('Surface_1er_etage') || '0');
    const secondFloor = parseFloat(localStorage.getItem('Surface_2e_etage') || '0');
    const buildingType = localStorage.getItem('Type_de_construction');

    let total = groundFloor;
    if (buildingType === '1 Étage') {
      total += firstFloor;
    } else if (buildingType === '2 Étages') {
      total += firstFloor + secondFloor;
    }
    return total;
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
    const typePac = localStorage.getItem('type_pac') || '';
    const heatLoss = parseFloat(localStorage.getItem('ResultatDeperdition') || 
                              localStorage.getItem('ResultatDeperdition1') || '0');

    const filterCriteria = {
      heatLoss,
      heatPumpType: heatPumpTypeMap[typePac] || typePac,
      heatPumpSystem: localStorage.getItem('systeme_pac') || '',
      emitterType: localStorage.getItem('emetteur_type') || '',
      emitterTemp: localStorage.getItem('emetteur_type') === 'radiateur'
        ? parseFloat(localStorage.getItem('temp_radiateur') || '35')
        : parseFloat(localStorage.getItem('temp_plancher') || '25')
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
  const department = localStorage.getItem('Departement') || undefined;
  
  // Extraire le numéro de département et obtenir la température correspondante
  let externalTemp = '-15'; // Valeur par défaut
  if (department) {
    const deptNumber = department.replace(/\D/g, '');
    if (deptNumber && DEPARTEMENT_TEMPERATURES[deptNumber]) {
      externalTemp = DEPARTEMENT_TEMPERATURES[deptNumber].toString();
    }
  }
  
  const newBuildingData: BuildingData = {
    constructionYear: localStorage.getItem('Annee_de_construction') || undefined,
    buildingType: localStorage.getItem('Type_de_construction') || undefined,
    heatLoss: localStorage.getItem('ResultatDeperdition') || 
              localStorage.getItem('ResultatDeperdition1') || undefined,
    totalSurface: calculateTotalSurface(),
    ventilation: localStorage.getItem('Ventilation') || undefined,
    heatingTemp: localStorage.getItem('Temperature_de_chauffage') || undefined,
    department: department,
    structure: localStorage.getItem('Structure_de_la_construction') || undefined,
    groundStructure: localStorage.getItem('Structure_du_sol') || undefined,
    windowSurface: localStorage.getItem('Surface_de_vitrage') || undefined,
    adjacency: localStorage.getItem('Mitoyennete') || undefined,
    poolKit: localStorage.getItem('kit_piscine') || undefined,
    freecoolingKit: localStorage.getItem('kit_freecooling') || undefined,
    hotWater: localStorage.getItem('kit_ECS') || undefined,
    heatPumpType: localStorage.getItem('type_pac') || undefined,
    heatPumpSystem: localStorage.getItem('systeme_pac') || undefined,
    externalTemp: externalTemp
  };

  setBuildingData(newBuildingData);
  loadData();
  
  const timer = setTimeout(() => {
    setIsLoading(false);
  }, 3000);

  return () => clearTimeout(timer);
}, []);

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
                <HeatLossDonut />
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
      </motion.div>
    </AnimatePresence>
  );
}