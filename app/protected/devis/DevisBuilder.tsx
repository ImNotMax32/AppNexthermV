'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Printer, Save, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClassicLayout } from './layouts/ClassicLayout';
import { ModernLayout, Modern2Layout } from './layouts/ModernLayout';
import { ContemporaryLayout, Contemporary2Layout } from './layouts/ContemporaryLayout';
import { MinimalLayout } from './layouts/MinimalLayout';
import { ToolBar } from '@/components/ui/ToolBar';
import { ITEMS_PER_PAGE, themes } from './types/devis';
import type { Product, CompanyInfo, ClientInfo, QuoteInfo } from './types/devis';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface QuoteConversionData {
  products: Array<{
    code: string;
    description: string;
    quantity: number;
    priceHT: number;
    tva: number;
  }>;
  client?: {
    name: string;
    address: string;
    zipCode: string;
    city: string;
    phone: string;
    email: string;
  };
  building?: any;
}

interface ProductData {
  id: number;
  code: string;
  description: string;
  quantity: number;
  priceHT: number;
  tva: number;
  totalHT: number;
  totalTTC?: number; // Ajouter ce champ pour correspondre à Product
}

const DEFAULT_PRODUCT: ProductData = {
  id: 1,
  code: '',
  description: '',
  quantity: 1,
  priceHT: 0,
  tva: 20,
  totalHT: 0
};

export default function DevisBuilder() {
  
  // États de base
  const [logoUrl, setLogoUrl] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('nature');
  const [selectedLayout, setSelectedLayout] = useState('classique');
  const [pages, setPages] = useState(1);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [existingQuotes, setExistingQuotes] = useState<Array<{id: string, reference: string}>>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('');
  const searchParams = useSearchParams();
  const devisId = searchParams.get('id');
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

    // États des informations
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    address: '',
    zipCode: '',
    city: '',
    phone: '',
    email: '',
    siret: ''
  });

  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: '',
    address: '',
    zipCode: '',
    city: '',
    phone: '',
    email: ''
  });

  const [quoteInfo, setQuoteInfo] = useState<QuoteInfo>({
    reference: '',
    creationDate: new Date().toISOString().split('T')[0],
    validityDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    tvaNumber: ''
  });

  const [products, setProducts] = useState<ProductData[]>([]);
  // Fonction de réinitialisation du formulaire
  const resetForm = useCallback(() => {
    setCompanyInfo({
      name: '',
      address: '',
      zipCode: '',
      city: '',
      phone: '',
      email: '',
      siret: ''
    });
    setClientInfo({
      name: '',
      address: '',
      zipCode: '',
      city: '',
      phone: '',
      email: ''
    });
    setQuoteInfo({
      reference: '',
      creationDate: new Date().toISOString().split('T')[0],
      validityDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      tvaNumber: ''
    });
    setProducts([DEFAULT_PRODUCT]);
  }, []);

  const loadInitialData = useCallback(async () => {
  try {
    setIsLoading(true);

    // Si on a un ID de devis, on charge depuis Supabase
    if (devisId) {
      // Récupérer l'utilisateur courant
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Charger le devis en vérifiant qu'il appartient à l'utilisateur
      const { data, error } = await supabase
        .from('devis')
        .select('*')
        .eq('id', devisId)
        .eq('user_id', user.id)  // Ajouter cette condition
        .single();

      if (error) {
        throw new Error('Devis non trouvé ou accès non autorisé');
      }

      if (data) {
        setCompanyInfo(data.company_info);
        setClientInfo(data.client_info);
        setQuoteInfo({
          reference: data.reference,
          creationDate: data.creation_date,
          validityDate: data.validity_date,
          tvaNumber: data.tva_number
        });
        setProducts(data.products);
      }
    } else {
          // Sinon, on essaie de charger depuis localStorage
          const savedData = localStorage.getItem('quoteConversionData');
          
          if (savedData) {
            const data = JSON.parse(savedData);
            console.log("Données chargées depuis localStorage:", data);
            
            // Vérification que products est un tableau et qu'il contient des éléments
            if (data.products && Array.isArray(data.products) && data.products.length > 0) {
              // Ajout de l'ID pour chaque produit
              const formattedProducts = data.products.map((product: any, index: number) => ({
                id: index + 1,
                code: product.code || '',
                description: product.description || '',
                quantity: product.quantity || 1,
                priceHT: product.priceHT || 0,
                tva: product.tva || 20,
                totalHT: product.totalHT || (product.quantity * product.priceHT) || 0
              }));
    
              console.log("Produits formatés à définir:", formattedProducts);
              setProducts(formattedProducts);
              
              if (data.client) {
                setClientInfo({
                  name: data.client.name || '',
                  address: data.client.address || '',
                  zipCode: data.client.zipCode || '',
                  city: data.client.city || '',
                  phone: data.client.phone || '',
                  email: data.client.email || ''
                });
              }
    
              setQuoteInfo(prev => ({
                ...prev,
                reference: `DEV-${new Date().getTime()}`
              }));
    
              // Ne pas supprimer le localStorage immédiatement pour le debug
              // localStorage.removeItem('quoteConversionData');
              
              toast({
                title: "Succès",
                description: "Les données du dimensionnement ont été chargées"
              });
              return;
            } else {
              console.warn("Données de produits invalides:", data);
            }
          } else {
            console.log("Aucune donnée trouvée dans localStorage");
          }
    
          // Si on arrive ici, soit il n'y a pas de données, soit elles sont invalides
          console.log("Initialisation avec produit par défaut");
          setProducts([DEFAULT_PRODUCT]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive"
        });
        setProducts([DEFAULT_PRODUCT]);
      } finally {
        setIsLoading(false);
      }
    }, [devisId, supabase, toast]);

  // Effet pour le chargement initial
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Effet pour charger les devis existants
  useEffect(() => {
    const loadExistingQuotes = async () => {
      try {
        const { data, error } = await supabase
          .from('devis')
          .select('id, reference')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setExistingQuotes(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des devis:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des devis",
          variant: "destructive"
        });
      }
    };

    loadExistingQuotes();
  }, [supabase, toast]);

  // Effet pour gérer le nombre de pages
  useEffect(() => {
    const calculatedPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));
    setPages(calculatedPages);
  }, [products]);

  // Gestionnaires d'événements
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    }
  };

  const removeLogo = () => {
    setLogoUrl('');
  };
  const updateProduct = useCallback((id: number, field: keyof ProductData, value: any) => {
    setProducts(prevProducts => prevProducts.map(product => {
      if (product.id === id) {
        const updatedProduct = { ...product, [field]: value };
        const totalHT = updatedProduct.quantity * updatedProduct.priceHT;
        return { ...updatedProduct, totalHT };
      }
      return product;
    }));
  }, []);

  const removeProduct = useCallback((id: number) => {
    setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
  }, []);

  const calculateProductTotal = (product: ProductData) => {
    const totalHT = product.quantity * product.priceHT;
    const totalTTC = totalHT * (1 + product.tva / 100);
    return { totalHT, totalTTC };
  };

  const calculateTotals = useCallback(() => {
    return products.reduce((acc, product) => {
      const { totalHT, totalTTC } = calculateProductTotal(product);
      return {
        totalHT: acc.totalHT + totalHT,
        totalTVA: acc.totalTVA + (totalTTC - totalHT),
        totalTTC: acc.totalTTC + totalTTC
      };
    }, { totalHT: 0, totalTVA: 0, totalTTC: 0 });
  }, [products]);

 const handleSave = async () => {
  try {
    // Récupérer l'utilisateur courant
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Utilisateur non authentifié');
    }

    const totals = calculateTotals();

    const devisData = {
      user_id: user.id, // Ajout de l'ID de l'utilisateur
      reference: quoteInfo.reference || `DEV-${new Date().getTime()}`,
      creation_date: quoteInfo.creationDate,
      validity_date: quoteInfo.validityDate,
      company_info: companyInfo,
      client_info: clientInfo,
      products: products,
      totals: {
        totalHT: totals.totalHT,
        totalTVA: totals.totalTVA,
        totalTTC: totals.totalTTC
      },
      status: 'draft',
      created_at: new Date().toISOString(),
      tva_number: quoteInfo.tvaNumber
    };

    const { data, error } = await supabase
      .from('devis')
      .insert([devisData])
      .select();

    if (error) throw error;

    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 3000);

    toast({
      title: "Succès",
      description: "Le devis a été sauvegardé avec succès",
    });

    router.push('/protected/devis/');

  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    toast({
      title: "Erreur",
      description: error instanceof Error ? error.message : "Impossible de sauvegarder le devis",
      variant: "destructive",
    });
  }
};

// Et modifions le bouton pour imprimer/exporter en PDF
const handlePrint = async () => {
  try {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.querySelector('.devis-content') as HTMLElement;
    if (!element) {
      throw new Error('Contenu du devis non trouvé');
    }

    const opt = {
      margin: [10, 10, 10, 0],
      filename: `devis-${quoteInfo.reference || 'sans-reference'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };

    await html2pdf().set(opt).from(element).save();
    
    toast({
      title: "Succès",
      description: "Le devis a été exporté en PDF avec succès",
    });
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    toast({
      title: "Erreur",
      description: "Impossible de générer le PDF",
      variant: "destructive",
    });
  }
};

  // Props communs mémorisés pour les composants enfants
  const commonProps = useMemo(() => ({
    pages,
    products,
    setProducts,
    updateProduct,
    removeProduct,
    selectedTheme,
    themes,
    ITEMS_PER_PAGE,
    calculateTotals,
    companyInfo,
    clientInfo,
    quoteInfo,
    setQuoteInfo, 
    setClientInfo,
    setCompanyInfo,
    logoUrl,
    removeLogo,
    handleLogoUpload,
    isLoading
  }), [
    pages,
    products,
    selectedTheme,
    companyInfo,
    clientInfo,
    quoteInfo,
    logoUrl,
    updateProduct,
    removeProduct,
    calculateTotals,
    isLoading
  ]);
  if (isLoading) {
    return <div>Chargement...</div>;
  }

return (
  <div className="max-w-5xl mx-auto p-6">
    <AnimatePresence>
      {showSaveConfirmation && (
        <motion.div
          initial={{ opacity: 1, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 1, y: -50 }}
          style={{ 
            backgroundColor: 'rgba(134, 188, 41, 0.8)',
            borderColor: '#86BC29'
          }}
          className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center gap-3 z-50 border border-[#86BC29]"
        >
          <div className="rounded-full p-1" style={{ backgroundColor: '#86BC29' }}>
            <Check className="h-4 w-4 text-white" />
          </div>
          <span className="font-medium text-gray-800">
            Devis enregistré avec succès!
          </span>
        </motion.div>
      )}
    </AnimatePresence>

    <ToolBar 
      selectedTheme={selectedTheme}
      setSelectedTheme={setSelectedTheme}
      selectedLayout={selectedLayout}
      setSelectedLayout={setSelectedLayout}
    />
    
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="devis-content space-y-8"
    >
      {Array.from({ length: pages }, (_, i) => {
        const pageProps = {
          ...commonProps,
          pageNumber: i + 1
        };

        switch(selectedLayout) {
          case 'moderne':
            return <ModernLayout key={i} {...pageProps} />;
          case 'moderne2':
            return <Modern2Layout key={i} {...pageProps} />;
          case 'contemporain':
            return <ContemporaryLayout key={i} {...pageProps} />;
          case 'contemporain2':
            return <Contemporary2Layout key={i} {...pageProps} />;
          case 'minimal':
            return <MinimalLayout key={i} {...pageProps} />;
          default:
            return <ClassicLayout key={i} {...pageProps} />;
        }
      })}
    </motion.div>

    <div className="flex justify-end gap-4 mt-8">
      <Button 
        className="gap-2"
        style={{ 
          backgroundColor: themes[selectedTheme].primary,
          color: 'white'
        }}
        onClick={handleSave}
      >
        <Save className="h-4 w-4" />
        Enregistrer
      </Button>
      <Button variant="outline" className="gap-2" onClick={handlePrint}>
        <Printer className="h-4 w-4" />
        Exporter PDF
      </Button>
    </div>
  </div>
);
};