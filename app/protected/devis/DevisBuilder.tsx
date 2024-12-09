'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Printer, Save } from 'lucide-react';
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
  product: {
    code: string;
    description: string;
    quantity: number;
    priceHT: number;
    tva: number;
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


export default function DevisBuilder() {
  
  // États de base
  const [logoUrl, setLogoUrl] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('nature');
  const [selectedLayout, setSelectedLayout] = useState('classique');
  const [pages, setPages] = useState(1);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();


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

  const [products, setProducts] = useState<Product[]>([{
    id: 1,
    code: '',
    description: '',
    quantity: 1,
    priceHT: 0, 
    tva: 20,
    totalHT: 0
  }]);

  
useEffect(() => {
  const conversionData = localStorage.getItem('quoteConversionData');
  console.log("Données trouvées:", conversionData);
  
  if (conversionData) {
    try {
      const data: QuoteConversionData = JSON.parse(conversionData);
      console.log("Données parsées:", data);
      
      // Mise à jour des produits
      if (data.products && data.products.length > 0) {
        const formattedProducts = data.products.map((product, index) => ({
          id: index + 1,
          code: product.code,
          description: product.description,
          quantity: product.quantity,
          priceHT: product.priceHT,
          tva: product.tva,
          totalHT: product.quantity * product.priceHT
        }));
        
        setProducts(formattedProducts);
        console.log("Produits mis à jour:", formattedProducts);
      }

      if (data.client) {
        setClientInfo(data.client);
        console.log("Client mis à jour:", data.client);
      }

      // Stockage des informations du bâtiment si nécessaire
      if (data.building) {
        localStorage.setItem('buildingInfo', JSON.stringify(data.building));
      }

      setTimeout(() => {
        localStorage.removeItem('quoteConversionData');
        console.log("LocalStorage nettoyé");
      }, 1000);

      toast({
        title: "Devis créé",
        description: `${data.products.length} produit(s) importé(s) avec succès`,
      });
    } catch (error) {
      console.error('Erreur lors de la lecture des données de conversion:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du dimensionnement",
        variant: "destructive",
      });
    }
  }
}, []);

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

  const updateProduct = (id: number, field: keyof Product, value: string | number) => {
    setProducts(products.map(product => {
      if (product.id === id) {
        const updatedProduct = { ...product, [field]: value };
        const { totalHT, totalTTC } = calculateProductTotal(updatedProduct);
        return { ...updatedProduct, totalHT, totalTTC };
      }
      return product;
    }));
  };

  const removeProduct = (id: number) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const calculateProductTotal = (product: Product) => {
    const totalHT = product.quantity * product.priceHT;
    const totalTTC = totalHT * (1 + product.tva / 100);
    return { totalHT, totalTTC };
  };

  const calculateTotals = () => {
    return products.reduce((acc, product) => {
      const { totalHT, totalTTC } = calculateProductTotal(product);
      return {
        totalHT: acc.totalHT + totalHT,
        totalTVA: acc.totalTVA + (totalTTC - totalHT),
        totalTTC: acc.totalTTC + totalTTC
      };
    }, { totalHT: 0, totalTVA: 0, totalTTC: 0 });
  };

  
const handleSave = async () => {
  try {
    // Calculer les totaux
    const totals = calculateTotals();

    // Créer l'objet devis
    const devisData = {
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
      status: 'draft', // Statut initial en brouillon
      created_at: new Date().toISOString(),
      tva_number: quoteInfo.tvaNumber
    };

    // Appel à Supabase pour sauvegarder le devis
    const { data, error } = await supabase
      .from('devis')
      .insert([devisData])
      .select();

    if (error) throw error;

    toast({
      title: "Succès",
      description: "Le devis a été sauvegardé avec succès",
    });

    // Redirige vers la liste des devis après sauvegarde
    router.push('/protected/devis/');

  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    toast({
      title: "Erreur",
      description: "Impossible de sauvegarder le devis",
      variant: "destructive",
    });
  }
};

// Et modifions le bouton pour imprimer/exporter en PDF
const handlePrint = async () => {
  try {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.querySelector('.devis-content');
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



  // Props communs pour les layouts
const commonProps = {
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
  handleLogoUpload
};

  return (
    <div className="max-w-5xl mx-auto p-6">
      <ToolBar 
        selectedTheme={selectedTheme}
        setSelectedTheme={setSelectedTheme}
        selectedLayout={selectedLayout}
        setSelectedLayout={setSelectedLayout}
      />
      
      {/* Ajout de la classe devis-content pour cibler spécifiquement le contenu du devis */}
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
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Exporter PDF
          </Button>
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
        </div>
    </div>
  );
}