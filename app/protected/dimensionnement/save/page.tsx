'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from '@/utils/supabase/client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Product } from '@/app/protected/dimensionnement/resume/types/product';
import { Search, Download, Trash2, Filter, SlidersHorizontal, Edit, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { generateModernPdf } from '@/app/protected/dimensionnement/resume/utils/pdfGenerator';

interface Calculation {
  id: string;
  user_id: string;
  project_name: string;
  parameters: {
    building: {
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
    };
    heating: {
      heatingTemp: string | null;
      ventilation: string | null;
      heatLoss: string | null;
      windowHeatLoss: string | null;
      roofHeatLoss: string | null;
      floorHeatLoss: string | null;
      airNeufLoss: string | null;
      thermalBridgeLoss: string | null;
    };
    heatPump: {
      type: string | null;
      system: string | null;
      emitterType: string | null;
      radiatorTemp: string | null;
      floorTemp: string | null;
      captorType: string | null;  // Ajout
      waterTable: string | null;  // Ajout
      support: string | null;     // Ajout
    };
    selectedProduct: Product;
    clientInfo: ClientInfo;
    installerInfo: InstallerInfo;
  };
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Mise à jour de l'interface QuoteConversionData
interface QuoteConversionData {
  products: {
    code: string;
    description: string;
    quantity: number;
    priceHT: number;
    tva: number;
  }[];
  heatPumpData: {
    type: string | null;
    system: string | null;
    captorType: string | null;
    waterTable: string | null;
    support: string | null;
  };
  building: {
    poolKit: string;
    freecoolingKit: string;
    hotWater: string;
    totalSurface: number;
  };
  client?: {
    name: string;
    address: string;
    zipCode: string;
    city: string;
    phone: string;
    email: string;
  };
}

export default function SavedFiles() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []); // Création du client une seule fois
  const [searchTerm, setSearchTerm] = useState('');
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [filteredCalculations, setFilteredCalculations] = useState<Calculation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const { toast } = useToast();

  const fetchCalculations = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('dimensionnements')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setCalculations(data);
        setFilteredCalculations(data); // Initialiser aussi les calculs filtrés
      }
    } catch (error) {
      console.error('Error fetching calculations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les dimensionnements sauvegardés",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  // Utiliser useEffect avec les bonnes dépendances
  useEffect(() => {
    const fetchData = async () => {
      await fetchCalculations();
    };
    fetchData();
  }, [fetchCalculations]);


  const deleteCalculation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dimensionnements')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Le dimensionnement a été supprimé avec succès",
      });
      setCalculations(calculations.filter(calc => calc.id !== id));
    } catch (error) {
      console.error('Error deleting calculation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le dimensionnement",
        variant: "destructive",
      });
    }
  };

  
  const filterAndSortCalculations = useCallback(() => {
    let filtered = [...calculations];
  
    if (searchTerm) {
      filtered = filtered.filter(calc => {
        const searchTermLower = searchTerm.toLowerCase();
        const searchableFields = [
          calc.project_name,
          calc.parameters?.building?.buildingType,
          calc.parameters?.building?.department,
          calc.parameters?.clientInfo?.name,
          calc.parameters?.clientInfo?.city,
          calc.parameters?.installerInfo?.company,
        ].map(field => (field || '').toLowerCase());
  
        return searchableFields.some(field => field.includes(searchTermLower));
      });
    }
  
    if (typeFilter !== 'all') {
      filtered = filtered.filter(calc => {
        const particularites = calc.parameters?.selectedProduct?.Particularites || [];
        
        if (typeFilter === 'geothermie') {
          return particularites.includes('Geothermie');
        } else if (typeFilter === 'aerothermie') {
          return particularites.includes('Aerothermie');
        }
        return true;
      });
    }
  
    // Filtrage par période
    const now = new Date();
    const timeFilters = {
      'week': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      'month': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      'sixMonths': new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
    };
  
    if (timeFilter !== 'all') {
      filtered = filtered.filter(calc => 
        new Date(calc.created_at) >= timeFilters[timeFilter as keyof typeof timeFilters]
      );
    }
  
    // Tri par date
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  
    setFilteredCalculations(filtered);
  }, [calculations, searchTerm, typeFilter, timeFilter, sortOrder]);

 
  useEffect(() => {
    fetchCalculations();
  }, []);

  useEffect(() => {
    if (calculations.length > 0) { // Seulement filtrer si nous avons des données
      filterAndSortCalculations();
    }
  }, [calculations, searchTerm, typeFilter, timeFilter, sortOrder, filterAndSortCalculations]);

  const regeneratePDF = useCallback(async (calculation: Calculation) => {
    try {
      if (!calculation.parameters) {
        throw new Error('Données du calcul manquantes');
      }
  
      // Debug log
      console.log('Données reçues pour le PDF:', calculation);
  
      // Création de l'objet avec des vérifications et valeurs par défaut
      const buildingData = calculation.parameters.building || {};
      const selectedProduct = calculation.parameters.selectedProduct || {};
      const clientInfo = calculation.parameters.clientInfo || {};
      const installerInfo = calculation.parameters.installerInfo || {};
  
      // Vérification du produit sélectionné
      if (!selectedProduct || Object.keys(selectedProduct).length === 0) {
        console.warn('Attention: Produit sélectionné manquant ou incomplet');
      }
  
      const pdfData = {
        fileName: `${calculation.projectName || 'projet'}_${new Date().toISOString().split('T')[0]}`,
        building: {
          constructionYear: buildingData.constructionYear || '',
          buildingType: buildingData.buildingType || '',
          heatLoss: buildingData.heatLoss || '0',
          totalSurface: buildingData.totalSurface || 0,
          ventilation: buildingData.ventilation || '',
          heatingTemp: buildingData.heatingTemp || '',
          department: buildingData.department || '',
          structure: buildingData.structure || '',
          groundStructure: buildingData.groundStructure || '',
          windowSurface: buildingData.windowSurface || '',
          adjacency: buildingData.adjacency || '',
          poolKit: buildingData.poolKit || 'Non',
          freecoolingKit: buildingData.freecoolingKit || 'Non',
          hotWater: buildingData.hotWater || 'Non'
        },
        selectedProduct: {
          Nom: selectedProduct.Nom || '',
          Particularites: selectedProduct.Particularites || [],
          Puissance: selectedProduct.Puissance || {
            min: 0,
            max: 0,
            increment: 0,
            baseModele: '',
            caracteristiques: {
              ratio_frigo: 0,
              ratio_absorbee: 0,
              cop_moyen: 0,
              etas_moyen: 0
            }
          },
          selectedModel: selectedProduct.selectedModel || {
            modele: '',
            puissance_calo: 0,
            puissance_frigo: 0,
            puissance_absorbee: 0,
            cop: 0,
            etas: 0
          },
          Emetteur: selectedProduct.Emetteur || {
            min: 0,
            max: 0
          }
        },
        referenceNumber: `REF-${calculation.id || 'TEMP'}`,
        clientInfo: {
          name: clientInfo.name || '',
          address: clientInfo.address || '',
          phone: clientInfo.phone || '',
          city: clientInfo.city || '',
          postalCode: clientInfo.postalCode || ''
        },
        installerInfo: {
          company: installerInfo.company || '',
          contact: installerInfo.contact || '',
          email: installerInfo.email || '',
          phone: installerInfo.phone || '',
          logo: installerInfo.logo || null
        }
      };
  
      // Debug logs détaillés
      console.log('Données du bâtiment:', pdfData.building);
      console.log('Données du produit:', pdfData.selectedProduct);
      console.log('Données formatées pour le PDF:', pdfData);
  
      await generateModernPdf(pdfData);
      
      toast({
        title: "Succès",
        description: "Le PDF a été généré avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast({
        title: "Erreur",
        description: `Impossible de générer le PDF : ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  }, [toast]);
  const editCalculation = useCallback(async (calculation: Calculation) => {
    if (!calculation.parameters) return;
    
    try {
      const { building, heatPump } = calculation.parameters;
      console.log("Données reçues de la DB :", calculation.parameters);
  
      // Stockage dans localStorage
      localStorage.setItem('kit_piscine', building.poolKit || 'Non');
      localStorage.setItem('kit_freecooling', building.freecoolingKit || 'Non');
      localStorage.setItem('kit_ECS', building.hotWater || 'Non');
  
      console.log("Données stockées dans localStorage :");
      console.log("kit_piscine:", localStorage.getItem('kit_piscine'));
      console.log("kit_freecooling:", localStorage.getItem('kit_freecooling'));
      console.log("kit_ECS:", localStorage.getItem('kit_ECS'));
      // Données du bâtiment
      Object.entries({
        'Annee_de_construction': building.constructionYear,
        'Type_de_construction': building.buildingType,
        'Surface_RDC': building.surfaceRDC,
        'Surface_1er_etage': building.surface1erEtage,
        'Surface_2e_etage': building.surface2eEtage,
        'ResultatDeperdition': building.heatLoss,
        'Ventilation': building.ventilation,
        'Temperature_de_chauffage': building.heatingTemp,
        'Departement': building.department,
        'Structure_de_la_construction': building.structure,
        'Structure_du_sol': building.groundStructure,
        'Surface_de_vitrage': building.windowSurface,
        'Mitoyennete': building.adjacency,
        'kit_piscine': building.poolKit,
        'kit_freecooling': building.freecoolingKit,
        'kit_ECS': building.hotWater
      }).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          localStorage.setItem(key, value);
        }
      });
  
      // Données de la PAC
      Object.entries({
        'type_pac': heatPump.type,
        'systeme_pac': heatPump.system,
        'emetteur_type': heatPump.emitterType,
        'temp_radiateur': heatPump.radiatorTemp,
        'temp_plancher': heatPump.floorTemp
      }).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          localStorage.setItem(key, value);
        }
      });
  
      if (calculation.parameters.selectedProduct) {
        localStorage.setItem('selected_product', JSON.stringify(calculation.parameters.selectedProduct));
      }
  
      router.push('/protected/dimensionnement/resume');
  
    } catch (error) {
      console.error('Erreur lors de l\'édition:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres du calcul",
        variant: "destructive",
      });
    }
  }, [router, toast]);

  
const getWaterKitModel = (powerKw: number) => {
  if (powerKw <= 17) return { code: "KEN 15", power: "13-17 kW" };
  if (powerKw <= 22) return { code: "KEN 20", power: "17-22 kW" };
  if (powerKw <= 27) return { code: "KEN 25", power: "22-27 kW" };
  if (powerKw <= 32) return { code: "KEN 30", power: "27-32 kW" };
  return { code: "KEN 35", power: "32+ kW" };
};

const getPoolKitModel = (powerKw: number) => {
  if (powerKw <= 17) return { code: "KP 15", power: "jusqu'à 17 kW" };
  if (powerKw <= 27) return { code: "KP 25", power: "17-27 kW" };
  return { code: "KP 35", power: "27+ kW" };
};

const convertToQuote = async (calculation: Calculation) => {
  try {
    const selectedProduct = calculation.parameters?.selectedProduct;
    const clientInfo = calculation.parameters?.clientInfo;
    const heatPump = calculation.parameters?.heatPump;
    const building = calculation.parameters?.building;
    
    if (!selectedProduct || !selectedProduct.selectedModel) {
      toast({
        title: "Erreur",
        description: "Impossible de convertir : informations produit manquantes",
        variant: "destructive",
      });
      return;
    }

    // Création des produits avec totalHT calculé
    const createProduct = (code: string, description: string, quantity: number = 1, priceHT: number = 0, tva: number = 20) => ({
      code,
      description,
      quantity,
      priceHT,
      tva,
      totalHT: quantity * priceHT // Ajout du totalHT
    });

    const products = [];

    // Produit principal
    const mainProduct = createProduct(
      selectedProduct.selectedModel.modele,
      `${selectedProduct.Nom}
Caractéristiques techniques:
- Puissance calorifique: ${selectedProduct.selectedModel.puissance_calo} kW
- Puissance frigorifique: ${selectedProduct.selectedModel.puissance_frigo} kW
- COP: ${selectedProduct.selectedModel.cop}
- ETAS: ${selectedProduct.selectedModel.etas}%
Type: ${selectedProduct.Particularites.join(', ')}
Type de capteur: ${heatPump?.captorType || 'Non spécifié'}
${heatPump?.captorType === 'Vertical' ? `Eau de nappe: ${heatPump?.waterTable}` : ''}`
    );
    products.push(mainProduct);

    // Kit eau de nappe
    const isGeothermal = selectedProduct.Particularites.includes('Geothermie');
    if (isGeothermal && heatPump?.captorType === 'Vertical' && heatPump?.waterTable === 'Oui') {
      const waterKit = getWaterKitModel(selectedProduct.selectedModel.puissance_calo);
      products.push(createProduct(
        waterKit.code,
        `Kit Eau de Nappe - ${waterKit.power}
Compatible avec ${selectedProduct.selectedModel.modele}
Inclut : pompe de relevage, filtres et accessoires`
      ));
    }

    // Kit piscine
    if (building?.poolKit === 'Oui') {
      const poolKit = getPoolKitModel(selectedProduct.selectedModel.puissance_calo);
      products.push(createProduct(
        poolKit.code,
        `Kit Piscine - ${poolKit.power}
Compatible avec ${selectedProduct.selectedModel.modele}
Inclut : échangeur et vannes de régulation`
      ));
    }

    const quoteData: QuoteConversionData = {
      products,
      heatPumpData: {
        type: heatPump?.type || null,
        system: heatPump?.system || null,
        captorType: heatPump?.captorType || null,
        waterTable: heatPump?.waterTable || null,
        support: heatPump?.support || null,
      },
      building: {
        poolKit: building?.poolKit || 'Non',
        freecoolingKit: building?.freecoolingKit || 'Non',
        hotWater: building?.hotWater || 'Non',
        totalSurface: building?.totalSurface || 0,
      },
      client: clientInfo ? {
        name: clientInfo.name || '',
        address: clientInfo.address || '',
        zipCode: clientInfo.postalCode || '',
        city: clientInfo.city || '',
        phone: clientInfo.phone || '',
        email: clientInfo.email || ''
      } : undefined
    };

    // Log de vérification avant stockage
    console.log("Données formatées pour conversion:", quoteData);
    console.log("Produits formatés:", products);

    // Stockage dans localStorage
    localStorage.setItem('quoteConversionData', JSON.stringify(quoteData));
    
    // Navigation après confirmation du stockage
    router.push('/protected/devis');

  } catch (error) {
    console.error('Erreur lors de la conversion en devis:', error);
    toast({
      title: "Erreur",
      description: "Impossible de convertir le dimensionnement en devis",
      variant: "destructive",
    });
  }
};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6 max-w-7xl"
    >
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Fichiers sauvegardés</h1>
        <p className="text-gray-600">
          Retrouvez et gérez tous vos dimensionnements sauvegardés
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-[#86BC29]">
              {calculations.length}
            </CardTitle>
            <CardDescription>Dimensionnements sauvegardés</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-[#86BC29]">
              {calculations.filter(calc => {
                const createdDate = new Date(calc.created_at);
                const now = new Date();
                return createdDate.getMonth() === now.getMonth() &&
                      createdDate.getFullYear() === now.getFullYear();
              }).length}
            </CardTitle>
            <CardDescription>Dimensionnements ce mois</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-[#86BC29]">
              {calculations.filter(calc => {
                const lastWeek = new Date();
                lastWeek.setDate(lastWeek.getDate() - 7);
                return new Date(calc.created_at) >= lastWeek;
              }).length}
            </CardTitle>
            <CardDescription>Dimensionnements cette semaine</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Barre de recherche et filtres */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                  placeholder="Rechercher un dimensionnement..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtres
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <div className="p-2">
                    <h4 className="font-semibold mb-2">Type de pompe</h4>
                    <DropdownMenuRadioGroup value={typeFilter} onValueChange={setTypeFilter}>
                      <DropdownMenuRadioItem value="all">Tous</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="geothermie">Géothermie</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="aerothermie">Aérothermie</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </div>
                  <div className="p-2 border-t">
                    <h4 className="font-semibold mb-2">Période</h4>
                    <DropdownMenuRadioGroup value={timeFilter} onValueChange={setTimeFilter}>
                      <DropdownMenuRadioItem value="all">Tout</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="week">Cette semaine</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="month">Dernier mois</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="sixMonths">6 derniers mois</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Trier par
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuRadioGroup value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}>
                    <DropdownMenuRadioItem value="newest">Plus récent</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="oldest">Plus ancien</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table des fichiers */}
      <Card>
        <CardHeader>
          <CardTitle>Vos projets</CardTitle>
          <CardDescription>
            Liste de tous vos dimensionnements sauvegardés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
          <TableHeader>
              <TableRow>
                <TableHead>Nom du projet</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type de pompe</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>Déperditions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredCalculations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Aucun dimensionnement sauvegardé
                  </TableCell>
                </TableRow>
              ) : (
                filteredCalculations.map((calc) => (
                  <TableRow key={calc.id}>
                    <TableCell className="font-medium">
                      {calc.project_name}
                    </TableCell>
                    <TableCell>
                      {new Date(calc.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      {calc.parameters?.heatPump?.type || 'Non spécifié'}
                    </TableCell>
                    <TableCell>
                      {calc.parameters?.building?.department || 'Non spécifié'}
                    </TableCell>
                    <TableCell>
                      {calc.parameters?.building?.heatLoss ? 
                        `${calc.parameters.building.heatLoss} kW` : 
                        'Non spécifié'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-[#86BC29]"
                          onClick={() => regeneratePDF(calc)}
                          title="Télécharger le PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-[#86BC29]"
                          onClick={() => convertToQuote(calc)}
                          title="Convertir en devis"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-blue-600"
                          onClick={() => editCalculation(calc)}
                          title="Modifier le projet"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-red-600"
                          onClick={() => deleteCalculation(calc.id)}
                          title="Supprimer le projet"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}