'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HydrationGuard } from '@/components/HydrationGuard';

// Désactiver le rendu statique pour éviter les problèmes d'hydratation
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Bar, Line } from 'react-chartjs-2';
import { 
  ArrowLeft, 
  Settings, 
  Calculator, 
  TrendingUp, 
  Zap, 
  Flame, 
  Droplet,
  Leaf,
  Euro,
  FileText,
  Mail,
  Send,
  X,
  BarChart3
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';



import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

interface EnergyPrices {
  electriciteHP: number; // €/kWh heures pleines
  electriciteHC: number; // €/kWh heures creuses
  gazVille: number; // €/kWh
  propane: number; // €/kWh
  fioul: number; // €/kWh
}

interface HeatingSystem {
  name: string;
  type: string;
  icon: React.ReactNode;
  color: string;
  efficiency: number; // COP ou rendement
  maintenanceCost: number;
  installationCost: number; // Coût d'installation
  energyType: keyof EnergyPrices;
  hpHcRatio?: {
    hp: number; // Pourcentage heures pleines
    hc: number; // Pourcentage heures creuses
  };
  co2Factor: number; // kg CO2/kWh
}

const ComparatifPage = () => {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [buildingData, setBuildingData] = useState<any>(null);
  
  // États pour la génération PDF et l'envoi par email
  const [pdfFileName, setPdfFileName] = useState<string>('Comparatif_Solutions');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [copyToUser, setCopyToUser] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [includeCostPage, setIncludeCostPage] = useState<boolean>(true);
  const [includeCo2Page, setIncludeCo2Page] = useState<boolean>(false);
  
  const [selectedPeriod, setSelectedPeriod] = useState<1 | 5 | 10 | 25>(10);
  const [showSettings, setShowSettings] = useState(false);
  const [chartType, setChartType] = useState<'cost' | 'co2'>('cost');
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showCascadePowerSelector, setShowCascadePowerSelector] = useState(false);
  const [cascadePower, setCascadePower] = useState<number>(40); // 40 kW par défaut, -1 signifie "Toutes"
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [energyPrices, setEnergyPrices] = useState<EnergyPrices>({
    electriciteHP: 0.2516,
    electriciteHC: 0.2068,
    gazVille: 0.1121,
    propane: 0.1878,
    fioul: 0.1456
  });
  const [hpHcRatio, setHpHcRatio] = useState({
    pac: { hp: 30, hc: 70 }, // PAC géothermique pilotée : plus en HC
    electrique: { hp: 70, hc: 30 } // Radiateurs électriques : plus en HP
  });
  const [priceInflation, setPriceInflation] = useState({
    enabled: false,
    rates: {
      electricite: 3.0, // +3%/an - Transition énergétique
      gazVille: 4.0,    // +4%/an - Volatilité géopolitique
      propane: 4.5,     // +4.5%/an - Lié pétrole + taxation
      fioul: 5.0        // +5%/an - Taxation carbone forte
    }
  });
  
  // Fonction pour capturer l'écran et générer un PDF
  const handleGeneratePdf = useCallback(async () => {
    console.log('handleGeneratePdf called - capture d\'écran');
    try {
      setIsGeneratingPdf(true);
      
      if (!buildingData) {
        toast.error("Données du bâtiment manquantes. Veuillez refaire le dimensionnement.");
        return;
      }
      
      if (!selectedProduct) {
        toast.error("Aucun produit sélectionné. Veuillez sélectionner un produit NEXTHERM.");
        return;
      }
      
      if (!selectedModel && !isCascadeProduct(selectedProduct)) {
        toast.error("Aucun modèle sélectionné. Veuillez sélectionner un modèle pour ce produit.");
        return;
      }

      // Attendre un peu pour s'assurer que le DOM est stable
      await new Promise(resolve => setTimeout(resolve, 500));

      // Trouver l'élément principal à capturer (tout le contenu sauf l'en-tête avec les boutons)
      const captureElement = document.querySelector('.max-w-7xl.mx-auto.p-6.space-y-6');
      
      if (!captureElement) {
        toast.error("Impossible de trouver le contenu à capturer");
        return;
      }

      // Configuration pour html2canvas
      const canvas = await html2canvas(captureElement as HTMLElement, {
        scale: 2, // Qualité plus élevée
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: captureElement.scrollWidth,
        height: captureElement.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      // Convertir le canvas en blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png', 0.95);
      });

      // Créer un lien de téléchargement
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pdfFileName || 'Comparatif_Solutions'}.png`;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL
      URL.revokeObjectURL(url);
      
      toast.success("Capture d'écran générée avec succès");
    } catch (error) {
      console.error("Erreur lors de la capture d'écran:", error);
      toast.error("Erreur lors de la génération de la capture d'écran");
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [buildingData, selectedProduct, selectedModel, pdfFileName]);

  // Fonctions pour l'envoi par email
  const handleEmailModalOpen = () => {
    if (!buildingData || !selectedProduct) {
      toast.error("Veuillez d'abord sélectionner un produit");
      return;
    }
    // Pré-sélectionner la page actuellement affichée
    setIncludeCostPage(chartType === 'cost');
    setIncludeCo2Page(chartType === 'co2');
    setIsEmailModalOpen(true);
  };

  const handleEmailModalClose = () => {
    setIsEmailModalOpen(false);
    setRecipientEmail('');
    setCopyToUser(false);
    setUserEmail('');
    setIncludeCostPage(true);
    setIncludeCo2Page(false);
  };


  const sendPdfByEmail = async () => {
    if (!recipientEmail) {
      toast.error("Veuillez saisir une adresse email");
      return;
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      toast.error("Veuillez saisir une adresse email valide");
      return;
    }

    if (copyToUser && !userEmail) {
      toast.error("Veuillez saisir votre email pour recevoir une copie");
      return;
    }

    if (!includeCostPage && !includeCo2Page) {
      toast.error("Veuillez sélectionner au moins une page à envoyer");
      return;
    }

    try {
      setIsSubmitting(true);

      // Vérifier que les données nécessaires sont disponibles
      if (!buildingData || !selectedProduct) {
        toast.error("Données insuffisantes pour générer le PDF");
        setIsSubmitting(false);
        return;
      }

      // Capturer les pages sélectionnées
      const captureElement = document.querySelector('.max-w-7xl.mx-auto.p-6.space-y-6');
      
      if (!captureElement) {
        toast.error("Impossible de trouver le contenu à capturer");
        setIsSubmitting(false);
        return;
      }

      const attachments = [];

      // Capturer la page Coûts si sélectionnée
      if (includeCostPage) {
        // Basculer sur la page Coûts si nécessaire
        if (chartType !== 'cost') {
          setChartType('cost');
          // Attendre que le DOM se mette à jour et que les animations se chargent complètement
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        const canvasCost = await html2canvas(captureElement as HTMLElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: captureElement.scrollWidth,
          height: captureElement.scrollHeight,
          scrollX: 0,
          scrollY: 0
        });

        const costBase64 = canvasCost.toDataURL('image/png', 0.95);
        attachments.push({
          filename: `${pdfFileName || 'Comparatif_Solutions'}_Coûts.png`,
          content: costBase64.split(',')[1] || costBase64,
        });
      }

      // Capturer la page CO2 si sélectionnée
      if (includeCo2Page) {
        // Basculer sur la page CO2 si nécessaire
        if (chartType !== 'co2') {
          setChartType('co2');
          // Attendre que le DOM se mette à jour et que les animations se chargent complètement
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        const canvasCo2 = await html2canvas(captureElement as HTMLElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: captureElement.scrollWidth,
          height: captureElement.scrollHeight,
          scrollX: 0,
          scrollY: 0
        });

        const co2Base64 = canvasCo2.toDataURL('image/png', 0.95);
        attachments.push({
          filename: `${pdfFileName || 'Comparatif_Solutions'}_CO2.png`,
          content: co2Base64.split(',')[1] || co2Base64,
        });
      }

      // Envoyer les captures par email
      const response = await fetch('/api/send-comparatif-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentEmail: recipientEmail,
          agentName: recipientEmail.split('@')[0], // Utiliser la partie avant @ comme nom
          copyToUser,
          userEmail: copyToUser ? userEmail : null,
          attachments: attachments,
          fileName: pdfFileName,
          buildingData: buildingData,
          selectedProduct: selectedProduct,
          selectedModel: selectedModel,
          heatingSystems: getHeatingSystems().map(system => ({
            name: system.name,
            type: system.type,
            efficiency: system.efficiency,
            maintenanceCost: system.maintenanceCost,
            installationCost: system.installationCost,
            energyType: system.energyType,
            co2Factor: system.co2Factor
          })),
          yearlyEnergyNeed: calculateYearlyEnergyNeed(),
          selectedPeriod: selectedPeriod
        }),
      });

      if (response.ok) {
        toast.success(`Comparatif envoyé avec succès à ${recipientEmail}!`);
        handleEmailModalClose();
      } else {
        throw new Error('Erreur lors de l\'envoi du comparatif');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de l'envoi du comparatif");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Paramètres modifiables
  const [heatingParams, setHeatingParams] = useState({
    heuresPleinesTotales: 4380, // heures/an (50% du temps)
    heuresCreusesTotales: 4380, // heures/an (50% du temps)
    temperatureExtMoyenne: -7, // °C température de base
    dureeChauffe: 180 // jours de chauffe par an
  });

  // Enregistrer Chart.js et nettoyer les données au chargement de la page
  useEffect(() => {
    // Enregistrer Chart.js pour cette page uniquement
    ChartJS.register(
      CategoryScale,
      LinearScale,
      BarElement,
      LineElement,
      PointElement,
      Title,
      Tooltip,
      Legend
    );

    // Nettoyer les données pour forcer le mode sélection (avec protection SSR)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selected_product');
      localStorage.removeItem('selected_model');
      sessionStorage.removeItem('buildingData');
    }

    // Cleanup function pour dé-enregistrer Chart.js quand on quitte la page
    return () => {
      // Note: Chart.js ne fournit pas de méthode unregister, mais le composant sera démonté
      // donc les instances seront nettoyées automatiquement
    };
  }, []);

  // Rechargement automatique simple après 0.5 seconde (une fois par ouverture de page)
  useEffect(() => {
    const hasReloaded = sessionStorage.getItem('comparatif_reloaded');
    
    if (!hasReloaded) {
      const timer = setTimeout(() => {
        console.log('ComparatifPage: rechargement automatique après 0.5s');
        sessionStorage.setItem('comparatif_reloaded', 'true');
        window.location.reload();
      }, 500);

      return () => clearTimeout(timer);
    } else {
      console.log('ComparatifPage: rechargement déjà effectué pour cette session');
    }
  }, []);

  useEffect(() => {
    let isMounted = true; // Flag pour éviter les mises à jour d'état après démontage

    // Charger les produits disponibles
    const loadProducts = async () => {
      try {
        const response = await fetch('/data/products.json');
        const data = await response.json();
        // Le fichier JSON a une structure { "products": [...] }
        const products = data.products || [];
        // Ajouter des IDs uniques basés sur le nom
        const productsWithIds = products.map((product: any, index: number) => ({
          ...product,
          id: product.Nom?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || `product_${index}`
        }));
        
        if (isMounted) {
          setAvailableProducts(productsWithIds);
          console.log('Produits chargés:', productsWithIds.length);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        if (isMounted) {
          setAvailableProducts([]);
        }
      }
    };

    // Vérifier si on vient du résumé (avec produit sélectionné)
    const storedProduct = localStorage.getItem('selected_product');
    const storedModel = localStorage.getItem('selected_model');
    // Vérifier dans sessionStorage d'abord (depuis résumé), puis localStorage
    const storedBuilding = sessionStorage.getItem('buildingData') || localStorage.getItem('building_data');
    
    console.log('Données récupérées:', {
      storedProduct: !!storedProduct,
      storedModel: !!storedModel,
      storedBuilding: !!storedBuilding
    });
    
    if (storedProduct && isMounted) {
      // Mode "depuis résumé" : produit déjà sélectionné
      const product = JSON.parse(storedProduct);
      setSelectedProduct(product);
      setShowProductSelector(false);
      
      console.log('Produit récupéré:', product.Nom);
      
      // Vérifier si un modèle spécifique était sélectionné
      if (storedModel) {
        setSelectedModel(JSON.parse(storedModel));
        console.log('Modèle récupéré depuis localStorage');
      } else if (product.selectedModel) {
        // Compatibilité avec l'ancien format
        setSelectedModel(product.selectedModel);
        console.log('Modèle récupéré depuis selectedModel');
      } else {
        // Sélection automatique du modèle le plus adapté
        const storedBuilding = sessionStorage.getItem('buildingData') || localStorage.getItem('building_data');
        if (storedBuilding && product.Puissance?.disponibles?.length > 0) {
          const buildingData = JSON.parse(storedBuilding);
          const heatLoss = buildingData?.heatLoss || 0;
          
          // Trouver le modèle le plus proche des déperditions
          const availableModels = product.Puissance.disponibles;
          const bestModel = availableModels.reduce((best: any, current: any) => {
            const bestDiff = Math.abs(best.puissance_calo - heatLoss);
            const currentDiff = Math.abs(current.puissance_calo - heatLoss);
            return currentDiff < bestDiff ? current : best;
          });
          
          if (isMounted) {
            setSelectedModel(bestModel);
            console.log('Modèle sélectionné automatiquement:', bestModel.modele, 'pour', heatLoss, 'W de déperditions');
          }
        }
      }
    } else if (isMounted) {
      // Mode "accès direct" : afficher le sélecteur
      setShowProductSelector(true);
      console.log('Mode accès direct - sélecteur affiché');
    }
    
    if (storedBuilding && isMounted) {
      setBuildingData(JSON.parse(storedBuilding));
      console.log('Données bâtiment récupérées');
    } else if (isMounted) {
      // Fallback : reconstruire les données du bâtiment depuis localStorage
      console.log('Aucune donnée bâtiment trouvée, reconstruction depuis localStorage...');
      const reconstructedBuildingData = {
        constructionYear: localStorage.getItem('Annee_de_construction') || undefined,
        buildingType: localStorage.getItem('Type_de_construction') || undefined,
        heatLoss: localStorage.getItem('ResultatDeperdition') || localStorage.getItem('ResultatDeperdition1') || '0',
        totalSurface: (parseFloat(localStorage.getItem('Surface_RDC') || '0') + 
                      parseFloat(localStorage.getItem('Surface_1er_etage') || '0') + 
                      parseFloat(localStorage.getItem('Surface_2e_etage') || '0')) || 0,
        ventilation: localStorage.getItem('Ventilation') || undefined,
        heatingTemp: localStorage.getItem('Temperature_de_chauffage') || undefined,
        department: localStorage.getItem('Departement') || undefined,
        structure: localStorage.getItem('Structure_de_la_construction') || undefined,
        groundStructure: localStorage.getItem('Structure_du_sol') || undefined,
        windowSurface: localStorage.getItem('Surface_de_vitrage') || undefined,
        adjacency: localStorage.getItem('Mitoyennete') || undefined,
        poolKit: localStorage.getItem('kit_piscine') || 'Non',
        freecoolingKit: localStorage.getItem('kit_freecooling') || 'Non',
        hotWater: localStorage.getItem('kit_ECS') || 'Non',
        heatPumpType: localStorage.getItem('type_pac') || undefined,
        heatPumpSystem: localStorage.getItem('systeme_pac') || undefined
      };
      
      console.log('Données bâtiment reconstruites:', reconstructedBuildingData);
      setBuildingData(reconstructedBuildingData);
      
      // Sauvegarder dans sessionStorage pour les prochaines fois
      sessionStorage.setItem('buildingData', JSON.stringify(reconstructedBuildingData));
    }

    loadProducts();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // Générer les options de puissance pour Cascade (40 à 400 kW par pas de 5 kW)
  const generateCascadePowerOptions = () => {
    const options = [{ value: 'all', label: 'Toutes' }];
    for (let power = 40; power <= 400; power += 5) {
      options.push({ value: power.toString(), label: `${power} kW` });
    }
    return options;
  };

  // Vérifier si le produit sélectionné est Cascade
  const isCascadeProduct = (product: any) => {
    return product?.Nom?.toLowerCase().includes('cascade') || product?.id?.includes('cascade');
  };

  // Obtenir la puissance sélectionnée selon le type de produit
  const getSelectedPower = (): number => {
    if (selectedProduct && isCascadeProduct(selectedProduct)) {
      // Pour Cascade, utiliser la puissance sélectionnée
      // Si cascadePower est -1 (option "Toutes"), utiliser une valeur par défaut de 40
      return cascadePower === -1 ? 40 : cascadePower;
    } else {
      // Pour les autres produits, utiliser la logique existante
      const selectedModelPower = selectedModel?.puissance_calo;
      const productMaxPower = selectedProduct?.Puissance?.max;
      const heatLossPower = buildingData?.heatLoss;
      return selectedModelPower || heatLossPower || productMaxPower || 17;
    }
  };

  // Calcul du besoin énergétique annuel
  const calculateYearlyEnergyNeed = () => {
    // Si c'est Cascade, utiliser la puissance sélectionnée
    if (selectedProduct && isCascadeProduct(selectedProduct)) {
      return cascadePower * 2000; // kWh/an
    }
    
    // Récupération de la puissance du modèle sélectionné pour les autres produits
    const selectedModelPower = selectedModel?.puissance_calo;
    const productMaxPower = selectedProduct?.Puissance?.max;
    const heatLossPower = buildingData?.heatLoss;
    const productPower = selectedModelPower || heatLossPower || productMaxPower || 17;
    
    // Calcul basé sur 2000h de fonctionnement par an (estimation réaliste)
    return productPower * 2000; // kWh/an
  };

  // Calcul de la consommation d'énergie primaire
  const calculateEnergyConsumption = (system: HeatingSystem) => {
    const yearlyEnergyNeed = calculateYearlyEnergyNeed();
    return yearlyEnergyNeed / system.efficiency; // kWh d'énergie primaire
  };

  // Calcul du coût annuel d'exploitation
  const calculateYearlyOperatingCost = (system: HeatingSystem) => {
    const energyConsumption = calculateEnergyConsumption(system);
    let energyCost = 0;

    if (system.energyType === 'electriciteHP' && system.hpHcRatio) {
      // Calcul avec heures pleines/creuses
      const hpConsumption = energyConsumption * (system.hpHcRatio.hp / 100);
      const hcConsumption = energyConsumption * (system.hpHcRatio.hc / 100);
      energyCost = (hpConsumption * energyPrices.electriciteHP) + (hcConsumption * energyPrices.electriciteHC);
    } else {
      energyCost = energyConsumption * energyPrices[system.energyType as keyof typeof energyPrices];
    }

    return energyCost + system.maintenanceCost;
  };

  // Calcul du coût total sur une période avec inflation
  const calculateTotalCost = (system: HeatingSystem, years: number) => {
    const yearlyOperatingCost = calculateYearlyOperatingCost(system);
    
    if (!priceInflation.enabled) {
      return yearlyOperatingCost * years;
    }
    
    // Mapping des types d'énergie pour l'inflation
    const getInflationRate = (energyType: string) => {
      switch (energyType) {
        case 'electriciteHP':
        case 'electriciteHC':
          return priceInflation.rates.electricite;
        case 'gazVille':
          return priceInflation.rates.gazVille;
        case 'propane':
          return priceInflation.rates.propane;
        case 'fioul':
          return priceInflation.rates.fioul;
        default:
          return 0;
      }
    };
    
    let totalCost = 0;
    const inflationRate = getInflationRate(system.energyType) / 100;
    
    for (let i = 0; i < years; i++) {
      totalCost += yearlyOperatingCost * Math.pow(1 + inflationRate, i);
    }
    
    return totalCost;
  };

  // Définition des systèmes de chauffage basés sur le produit sélectionné
  const getHeatingSystems = () => {
    // Récupération de la puissance selon le type de produit
    let productPower: number;
    let selectedModelCOP: number;
    
    if (selectedProduct && isCascadeProduct(selectedProduct)) {
      // Pour Cascade, utiliser la puissance sélectionnée
      productPower = cascadePower;
      selectedModelCOP = 4.2; // COP par défaut pour Cascade
    } else {
      // Pour les autres produits, utiliser la logique existante
      const selectedModelPower = selectedModel?.puissance_calo;
      const productMaxPower = selectedProduct?.Puissance?.max;
      const heatLossPower = buildingData?.heatLoss;
      productPower = selectedModelPower || heatLossPower || productMaxPower || 17;
      selectedModelCOP = selectedModel?.cop || 4.2;
    }

    const systems = [
      {
        name: `PAC Géothermique NEXTHERM ${productPower}kW`,
        type: 'pac',
        icon: <Zap className="w-4 h-4" />,
        color: '#86BC29',
        efficiency: selectedModelCOP, // COP du modèle sélectionné
        maintenanceCost: 200,
        installationCost: 15000 + (productPower * 500), // Coût d'installation de base + supplément par kW
        energyType: 'electriciteHP',
        hpHcRatio: {
          hp: hpHcRatio.pac.hp,
          hc: hpHcRatio.pac.hc
        },
        co2Factor: 0.06 // kg CO2/kWh
      },
      {
        name: `Chaudière Gaz ${productPower}kW`,
        type: 'gaz',
        icon: <Flame className="w-4 h-4" />,
        color: '#3B82F6',
        efficiency: 0.95, // Rendement chaudière gaz condensation
        maintenanceCost: 150,
        installationCost: 5000 + (productPower * 200), // Coût d'installation de base + supplément par kW
        energyType: 'gazVille',
        co2Factor: 0.23 // kg CO2/kWh
      },
      {
        name: `Chaudière Propane ${productPower}kW`,
        type: 'propane',
        icon: <Flame className="w-4 h-4" />,
        color: '#F59E0B',
        efficiency: 0.92,
        maintenanceCost: 180,
        installationCost: 5500 + (productPower * 220), // Coût d'installation de base + supplément par kW
        energyType: 'propane',
        co2Factor: 0.26 // kg CO2/kWh
      },
      {
        name: `Chaudière Fioul ${productPower}kW`,
        type: 'fioul',
        icon: <Flame className="w-4 h-4" />,
        color: '#EF4444',
        efficiency: 0.90,
        maintenanceCost: 200,
        installationCost: 4500 + (productPower * 180), // Coût d'installation de base + supplément par kW
        energyType: 'fioul',
        co2Factor: 0.28 // kg CO2/kWh
      },
      {
        name: `Radiateurs Électriques ${productPower}kW`,
        type: 'electrique',
        icon: <Zap className="w-4 h-4" />,
        color: '#8B5CF6',
        efficiency: 1.0,
        maintenanceCost: 50,
        installationCost: 2000 + (productPower * 100), // Coût d'installation de base + supplément par kW
        energyType: 'electriciteHP',
        hpHcRatio: {
          hp: hpHcRatio.electrique.hp,
          hc: hpHcRatio.electrique.hc
        },
        co2Factor: 0.06 // kg CO2/kWh
      }
    ] as HeatingSystem[];

    // Retourner sans tri initial, le tri sera fait dans sortedHeatingSystems
    return systems;
  };

  const heatingSystems = useMemo(() => getHeatingSystems(), [selectedProduct, selectedModel, buildingData, cascadePower]);

  // Trier les systèmes selon le type de graphique affiché
  const sortedHeatingSystems = useMemo(() => {
    if (chartType === 'cost') {
      return [...heatingSystems].sort((a, b) => {
        const costA = calculateTotalCost(a, selectedPeriod);
        const costB = calculateTotalCost(b, selectedPeriod);
        return costA - costB;
      });
    } else {
      return [...heatingSystems].sort((a, b) => {
        const emissionA = calculateEnergyConsumption(a) * a.co2Factor;
        const emissionB = calculateEnergyConsumption(b) * b.co2Factor;
        return emissionA - emissionB;
      });
    }
  }, [heatingSystems, chartType, selectedPeriod]);

  // Données pour les graphiques
  const chartData = {
    labels: sortedHeatingSystems.map(s => s.name),
    datasets: [
      {
        label: `Coût consommation ${selectedPeriod} ans (€)`,
        data: sortedHeatingSystems.map(s => calculateTotalCost(s, selectedPeriod)),
        backgroundColor: sortedHeatingSystems.map(s => s.color + '80'),
        borderColor: sortedHeatingSystems.map(s => s.color),
        borderWidth: 2
      }
    ]
  };

  const co2ChartData = {
    labels: sortedHeatingSystems.map(s => s.name),
    datasets: [
      {
        label: `Émissions CO2 ${selectedPeriod} ans (kg)`,
        data: sortedHeatingSystems.map(s => calculateEnergyConsumption(s) * s.co2Factor * selectedPeriod),
        backgroundColor: sortedHeatingSystems.map(s => s.color + '80'),
        borderColor: sortedHeatingSystems.map(s => s.color),
        borderWidth: 2
      }
    ]
  };

  // Effet de nettoyage au démontage du composant
  useEffect(() => {
    return () => {
      // Nettoyer les timers et les références
      console.log('ComparatifPage: nettoyage du composant');
    };
  }, []);

  return (
    <HydrationGuard>
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* En-tête principal */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="mr-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Comparatif des solutions de chauffage</h1>
                <p className="text-gray-600">Analyse comparative des différentes technologies disponibles</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => {
                  console.log('Button clicked!');
                  handleGeneratePdf();
                }}
                disabled={isGeneratingPdf}
                className="bg-[#86BC29] hover:bg-[#86BC29]/90 text-white flex items-center gap-2 disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Génération...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Enregistrer
                  </>
                )}
              </Button>
              <Button
                onClick={handleEmailModalOpen}
                className="bg-[#86BC29] hover:bg-[#86BC29]/90 text-white flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Envoyer par email
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Barre de contrôles */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Informations produit */}
            <div className="flex items-center space-x-3">
              <div className="text-sm font-medium text-gray-700">Produit sélectionné :</div>
              {selectedProduct ? (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-[#86BC29] bg-[#86BC29]/10 px-3 py-1 rounded-full font-medium border border-[#86BC29]/20">
                    {selectedProduct.Nom}
                  </span>
                  {selectedModel && (
                    <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full border">
                      {selectedModel.modele} - {selectedModel.puissance_calo} kW (COP {selectedModel.cop})
                    </span>
                  )}
                  {!selectedModel && selectedProduct.Puissance?.disponibles?.length > 0 && (
                    <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      ℹ️ Cliquez sur le bouton produit pour sélectionner un modèle
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                  ⚠️ Aucun produit sélectionné
                </span>
              )}
            </div>
            
            {/* Contrôles */}
            <div className="flex items-center space-x-4">
              {/* Sélecteur de période */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Période d'analyse :</span>
                <div className="flex space-x-1">
                  {[1, 5, 10, 25].map((period) => (
                    <motion.button
                      key={period}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedPeriod(period as 1 | 5 | 10 | 25)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        selectedPeriod === period
                          ? 'bg-[#86BC29] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {period} an{period > 1 ? 's' : ''}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Boutons d'action */}
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (selectedProduct && !selectedModel) {
                      setShowModelSelector(true);
                    } else {
                      setShowProductSelector(!showProductSelector);
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-[#86BC29] text-white hover:bg-[#75a625] transition-colors text-sm font-medium"
                  title={selectedProduct && !selectedModel ? "Sélectionner un modèle" : "Changer de produit"}
                >
                  {selectedProduct && !selectedModel ? "Sélectionner modèle" : "Changer de produit"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                  title="Paramètres avancés"
                >
                  <Settings className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

      {/* Panneau de paramètres */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-[#86BC29]" />
                Paramètres de calcul
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Prix des énergies */}
                <div>
                  <h4 className="font-semibold mb-3 text-[#86BC29]">Prix des énergies (€/kWh TTC)</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Électricité HP</label>
                      <input
                        type="number"
                        step="0.001"
                        value={energyPrices.electriciteHP}
                        onChange={(e) => setEnergyPrices({...energyPrices, electriciteHP: parseFloat(e.target.value)})}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Électricité HC</label>
                      <input
                        type="number"
                        step="0.001"
                        value={energyPrices.electriciteHC}
                        onChange={(e) => setEnergyPrices({...energyPrices, electriciteHC: parseFloat(e.target.value)})}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Gaz de ville</label>
                      <input
                        type="number"
                        step="0.001"
                        value={energyPrices.gazVille}
                        onChange={(e) => setEnergyPrices({...energyPrices, gazVille: parseFloat(e.target.value)})}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Propane</label>
                      <input
                        type="number"
                        step="0.001"
                        value={energyPrices.propane}
                        onChange={(e) => setEnergyPrices({...energyPrices, propane: parseFloat(e.target.value)})}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Fioul</label>
                      <input
                        type="number"
                        step="0.001"
                        value={energyPrices.fioul}
                        onChange={(e) => setEnergyPrices({...energyPrices, fioul: parseFloat(e.target.value)})}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>
                </div>
                {/* Ratio HP/HC */}
                <div>
                  <h4 className="font-semibold mb-3 text-[#86BC29]">Ratio HP/HC</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">PAC Géothermique</label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          step="1"
                          value={hpHcRatio.pac.hp}
                          onChange={(e) => setHpHcRatio({...hpHcRatio, pac: { hp: parseInt(e.target.value), hc: 100 - parseInt(e.target.value) }})}
                          className="w-full p-2 border rounded-md"
                        />
                        <span>% HP</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Radiateurs Électriques</label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          step="1"
                          value={hpHcRatio.electrique.hp}
                          onChange={(e) => setHpHcRatio({...hpHcRatio, electrique: { hp: parseInt(e.target.value), hc: 100 - parseInt(e.target.value) }})}
                          className="w-full p-2 border rounded-md"
                        />
                        <span>% HP</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Inflation */}
                <div>
                  <h4 className="font-semibold mb-3 text-[#86BC29]">Évolution des prix énergétiques</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="inflation-enabled"
                        checked={priceInflation.enabled}
                        onChange={(e) => setPriceInflation({...priceInflation, enabled: e.target.checked})}
                        className="w-4 h-4 text-[#86BC29] border-gray-300 rounded focus:ring-[#86BC29]"
                      />
                      <label htmlFor="inflation-enabled" className="text-sm font-medium">
                        Prendre en compte l'inflation des prix
                      </label>
                    </div>
                    
                    {priceInflation.enabled && (
                      <div className="space-y-3 pl-6 border-l-2 border-[#86BC29] bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 mb-3">
                          Taux d'augmentation annuelle estimés (%/an)
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">⚡ Électricité</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="20"
                              value={priceInflation.rates.electricite}
                              onChange={(e) => setPriceInflation({...priceInflation, rates: {...priceInflation.rates, electricite: parseFloat(e.target.value) || 0}})}
                              className="w-full p-2 border rounded-md text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">🔥 Gaz de ville</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="20"
                              value={priceInflation.rates.gazVille}
                              onChange={(e) => setPriceInflation({...priceInflation, rates: {...priceInflation.rates, gazVille: parseFloat(e.target.value) || 0}})}
                              className="w-full p-2 border rounded-md text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">🚛 Propane</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="20"
                              value={priceInflation.rates.propane}
                              onChange={(e) => setPriceInflation({...priceInflation, rates: {...priceInflation.rates, propane: parseFloat(e.target.value) || 0}})}
                              className="w-full p-2 border rounded-md text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">🛢️ Fioul</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="20"
                              value={priceInflation.rates.fioul}
                              onChange={(e) => setPriceInflation({...priceInflation, rates: {...priceInflation.rates, fioul: parseFloat(e.target.value) || 0}})}
                              className="w-full p-2 border rounded-md text-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-2">
                          <p><strong>Recommandations :</strong></p>
                          <p>• Électricité : 3% (transition énergétique)</p>
                          <p>• Gaz : 4% (volatilité géopolitique)</p>
                          <p>• Propane : 4.5% (lié au pétrole)</p>
                          <p>• Fioul : 5% (taxation carbone)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Sélecteur de produit */}
      {showProductSelector && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-[#86BC29]" />
                Sélectionner un produit NEXTHERM
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableProducts.length > 0 ? (
                <div className="flex flex-col space-y-1">
                  {availableProducts.map((product) => (
                    <div 
                      key={product.id} 
                      className={`py-2.5 px-2 border rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                        selectedProduct?.id === product.id 
                          ? 'border-[#86BC29] bg-[#86BC29]/5' 
                          : 'border-gray-200 hover:border-[#86BC29]/50'
                      }`}
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowProductSelector(false);
                        
                        // Si c'est Cascade, afficher le sélecteur de puissance
                        if (isCascadeProduct(product)) {
                          setShowCascadePowerSelector(true);
                          setShowModelSelector(false);
                        } else {
                          // Pour les autres produits, afficher le sélecteur de modèles
                          setShowModelSelector(true);
                          setShowCascadePowerSelector(false);
                        }
                        
                        // Sauvegarder le produit sélectionné
                        localStorage.setItem('selected_product', JSON.stringify(product));
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedProduct?.id === product.id ? 'bg-[#86BC29]' : 'bg-gray-300'
                        }`} />
                        <div className="flex items-center space-x-4">
                          <h3 className="font-semibold text-sm">{product.Nom}</h3>
                          <span className="text-xs text-gray-500">{product.Puissance?.min}-{product.Puissance?.max} kW</span>
                          <span className="text-xs text-gray-500">COP {product.COP?.min}-{product.COP?.max}</span>
                        </div>
                      </div>
                      <div className="text-xs text-[#86BC29] font-medium">
                        {product.Puissance?.disponibles?.length || 0} modèles
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Chargement des produits...</p>
                </div>
              )}
              
              {!selectedProduct && availableProducts.length > 0 && (
                <div key="no-compatible-model" className="text-sm text-red-500 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Veuillez sélectionner un produit pour voir la comparaison
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {showModelSelector && selectedProduct && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-[#86BC29]" />
                Sélectionner un modèle pour {selectedProduct.Nom}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedProduct.Puissance?.disponibles?.length > 0 ? (
                <div className="flex flex-col space-y-1">
                  {selectedProduct.Puissance.disponibles.map((modele: any, index: number) => (
                    <div 
                      key={`${modele.modele || 'modele'}-${modele.puissance_calo}-${index}`} 
                      className={`py-2.5 px-2 border rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                        selectedModel?.modele === modele.modele 
                          ? 'border-[#86BC29] bg-[#86BC29]/5' 
                          : 'border-gray-200 hover:border-[#86BC29]/50'
                      }`}
                      onClick={() => {
                        setSelectedModel(modele);
                        setShowModelSelector(false);
                        // Sauvegarder le modèle sélectionné
                        localStorage.setItem('selected_model', JSON.stringify(modele));
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedModel?.modele === modele.modele ? 'bg-[#86BC29]' : 'bg-gray-300'
                        }`} />
                        <div className="flex items-center space-x-4">
                          <h3 className="font-semibold text-sm">{modele.modele}</h3>
                          <span className="text-xs text-gray-500">{modele.puissance_calo} kW</span>
                          <span className="text-xs text-gray-500">COP {modele.cop}</span>
                          <span className="text-xs text-gray-500">ETAS {modele.etas}%</span>
                        </div>
                      </div>
                      <div className="text-xs text-[#86BC29] font-medium">
                        Sélectionner
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun modèle disponible pour ce produit</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isCascadeProduct(selectedProduct) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-[#86BC29]" />
                Sélectionner une puissance pour {selectedProduct.Nom}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Puissance installée (modules thermiques)
                  </label>
                  <Select
                    value={cascadePower === -1 ? 'all' : cascadePower.toString()}
                    onValueChange={(value: string) => {
                      if (value === 'all') {
                        setCascadePower(-1); // Valeur spéciale pour 'Toutes'
                        console.log('Sélection de toutes les puissances Cascade');
                      } else {
                        const newPower = parseInt(value);
                        setCascadePower(newPower);
                        console.log('Nouvelle puissance Cascade sélectionnée:', newPower);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner une puissance" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateCascadePowerOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-gray-600">
                  <p>• Système modulaire : addition de plusieurs modules thermiques</p>
                  <p>• Puissance disponible : 40 à 400 kW par pas de 5 kW</p>
                  <p>• Puissance sélectionnée : <strong className="text-[#86BC29]">{cascadePower} kW</strong></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

        {/* Indicateurs clés */}
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Zap className="w-8 h-8 text-[#86BC29]" />
            </div>
            <div className="text-2xl font-bold text-[#86BC29] mb-1">
              {getSelectedPower()} kW
            </div>
            <div className="text-sm text-gray-600 font-medium">Puissance installée</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Flame className="w-8 h-8 text-gray-600" />
            </div>
            <div className="text-2xl font-bold text-gray-700 mb-1">
              {(calculateYearlyEnergyNeed() / 1000).toFixed(1)} MWh
            </div>
            <div className="text-sm text-gray-600 font-medium">Besoin énergétique annuel</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Euro className="w-8 h-8 text-[#86BC29]" />
            </div>
            <div className="text-2xl font-bold text-[#86BC29] mb-1">
              {new Intl.NumberFormat('fr-FR', { 
                style: 'currency', 
                currency: 'EUR', 
                maximumFractionDigits: 0 
              }).format(Math.min(...sortedHeatingSystems.map(s => calculateTotalCost(s, selectedPeriod))))}
            </div>
            <div className="text-sm text-gray-600 font-medium">Coût minimum sur {selectedPeriod} ans</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Leaf className="w-8 h-8 text-[#86BC29]" />
            </div>
            <div className="text-2xl font-bold text-[#86BC29] mb-1">
              {(Math.min(...sortedHeatingSystems.map(s => calculateEnergyConsumption(s) * s.co2Factor * selectedPeriod)) / 1000).toFixed(1)} t
            </div>
            <div className="text-sm text-gray-600 font-medium">Émissions CO2 min. sur {selectedPeriod} ans</div>
          </div>
        </motion.div>
        )}

      {/* Graphique principal */}
      {selectedProduct && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                  <BarChart3 className="w-6 h-6 mr-3 text-[#86BC29]" />
                  Analyse comparative des solutions
                </CardTitle>
                <p className="text-gray-600 mt-2 text-sm">
                  {chartType === 'cost' 
                    ? `Comparaison des coûts totaux sur ${selectedPeriod} ans (installation + exploitation)`
                    : `Comparaison des émissions CO2 sur ${selectedPeriod} ans`
                  }
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartType('cost')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                    chartType === 'cost'
                      ? 'bg-[#86BC29] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Euro className="w-4 h-4 mr-2" /> 
                  Coûts
                </button>
                <button
                  onClick={() => setChartType('co2')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                    chartType === 'co2'
                      ? 'bg-[#86BC29] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Leaf className="w-4 h-4 mr-2" />
                  CO2
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ height: '400px' }}>
              {chartType === 'cost' ? (
                <Bar 
                  key="cost-chart"
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { 
                        position: 'top' as const,
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                          font: {
                            size: 12,
                            weight: 'bold'
                          }
                        }
                      },
                      title: { display: false },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: '#86BC29',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                          label: function(context) {
                            return new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0
                            }).format(context.parsed.y);
                          }
                        }
                      }
                    },
                    scales: {
                      x: {
                        grid: {
                          display: false
                        },
                        ticks: {
                          font: {
                            size: 11,
                            weight: 'bold'
                          },
                          maxRotation: 45,
                          minRotation: 0
                        }
                      },
                      y: { 
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)',
                          lineWidth: 1
                        },
                        ticks: {
                          font: {
                            size: 11
                          },
                          callback: function(value) {
                            return new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                              notation: 'compact'
                            }).format(value as number);
                          }
                        }
                      }
                    },
                    interaction: {
                      intersect: false,
                      mode: 'index'
                    },
                    animation: {
                      duration: 1500,
                      easing: 'easeInOutQuart'
                    }
                  }}
                />
              ) : (
                <Bar 
                  key="co2-chart"
                  data={co2ChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { 
                        position: 'top' as const,
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                          font: {
                            size: 12,
                            weight: 'bold'
                          }
                        }
                      },
                      title: { display: false },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: '#86BC29',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                          label: function(context) {
                            return new Intl.NumberFormat('fr-FR', {
                              style: 'decimal',
                              maximumFractionDigits: 0
                            }).format(context.parsed.y) + ' kg CO2';
                          }
                        }
                      }
                    },
                    scales: {
                      x: {
                        grid: {
                          display: false
                        },
                        ticks: {
                          font: {
                            size: 11,
                            weight: 'bold'
                          },
                          maxRotation: 45,
                          minRotation: 0
                        }
                      },
                      y: { 
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)',
                          lineWidth: 1
                        },
                        ticks: {
                          font: {
                            size: 11
                          },
                          callback: function(value) {
                            return new Intl.NumberFormat('fr-FR', {
                              style: 'decimal',
                              maximumFractionDigits: 0,
                              notation: 'compact'
                            }).format(value as number) + ' kg';
                          }
                        }
                      }
                    },
                    interaction: {
                      intersect: false,
                      mode: 'index'
                    },
                    animation: {
                      duration: 1500,
                      easing: 'easeInOutQuart'
                    }
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      )}

      {/* Tableau détaillé */}
      {selectedProduct && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
        <Card>
          <CardHeader>
            <CardTitle>Analyse détaillée</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Solution</th>
                    <th className="text-right py-3 px-2">Consommation/an</th>
                    {chartType === 'cost' ? (
                      <React.Fragment key="cost-headers">
                        <th className="text-right py-3 px-2">Coût énergie/an</th>
                        <th className="text-right py-3 px-2">Total {selectedPeriod} ans</th>
                      </React.Fragment>
                    ) : (
                      <React.Fragment key="co2-headers">
                        <th className="text-right py-3 px-2">Émissions CO2/an</th>
                        <th className="text-right py-3 px-2">Total CO2 {selectedPeriod} ans</th>
                      </React.Fragment>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sortedHeatingSystems.map((system, index) => (
                    <tr key={`${system.name}-${index}`} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center">
                          <div className="p-1 rounded mr-2" style={{ backgroundColor: system.color + '20' }}>
                            <div style={{ color: system.color }}>
                              {system.icon}
                            </div>
                          </div>
                          {system.name}
                        </div>
                      </td>
                      <td className="text-right py-3 px-2">
                        {(calculateEnergyConsumption(system) / 1000).toFixed(1)} MWh
                      </td>
                      {chartType === 'cost' ? (
                        <React.Fragment key={`cost-data-${system.name}-${index}`}>
                          <td className="text-right py-3 px-2">
                            {new Intl.NumberFormat('fr-FR', { 
                              style: 'currency', 
                              currency: 'EUR', 
                              maximumFractionDigits: 0 
                            }).format(calculateYearlyOperatingCost(system) - system.maintenanceCost)}
                          </td>
                          <td className="text-right py-3 px-2 font-semibold">
                            {new Intl.NumberFormat('fr-FR', { 
                              style: 'currency', 
                              currency: 'EUR', 
                              maximumFractionDigits: 0 
                            }).format(calculateTotalCost(system, selectedPeriod))}
                          </td>
                        </React.Fragment>
                      ) : (
                        <React.Fragment key={`co2-data-${system.name}-${index}`}>
                          <td className="text-right py-3 px-2">
                            {new Intl.NumberFormat('fr-FR', { 
                              style: 'decimal', 
                              maximumFractionDigits: 0 
                            }).format(calculateEnergyConsumption(system) * system.co2Factor)} kg
                          </td>
                          <td className="text-right py-3 px-2 font-semibold">
                            {new Intl.NumberFormat('fr-FR', { 
                              style: 'decimal', 
                              maximumFractionDigits: 0 
                            }).format(calculateEnergyConsumption(system) * system.co2Factor * selectedPeriod)} kg
                          </td>
                        </React.Fragment>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      )}
      
      {/* Modale d'envoi par email */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2 text-[#86BC29]" />
              Envoyer le comparatif par email
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Adresse email du destinataire</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="destinataire@exemple.com"
                required
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Pages à envoyer :</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeCostPage" 
                    checked={includeCostPage} 
                    onCheckedChange={(checked) => setIncludeCostPage(checked as boolean)}
                  />
                  <Label htmlFor="includeCostPage">Page Coûts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeCo2Page" 
                    checked={includeCo2Page} 
                    onCheckedChange={(checked) => setIncludeCo2Page(checked as boolean)}
                  />
                  <Label htmlFor="includeCo2Page">Page CO2</Label>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="copyToUser" 
                checked={copyToUser} 
                onCheckedChange={(checked) => setCopyToUser(checked as boolean)}
              />
              <Label htmlFor="copyToUser">Recevoir une copie par email</Label>
            </div>
            
            {copyToUser && (
              <div className="space-y-2">
                <Label htmlFor="userEmail">Votre email</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="votre@email.com"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleEmailModalClose}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Annuler
            </Button>
            <Button
              onClick={sendPdfByEmail}
              disabled={isSubmitting}
              className="bg-[#86BC29] hover:bg-[#86BC29]/90 text-white flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
      </div>
    </HydrationGuard>
  );
};

export default ComparatifPage;

