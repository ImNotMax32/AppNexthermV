'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ThermometerSun, 
  Wind, 
  Waves,
  Sparkles,
  Ruler,
  Award,
  Info,
  PlayCircle,
  PauseCircle,
  Cpu,
  Snowflake,
  Zap,
  GaugeCircle,
  BarChart3,
  ChevronLeft,
  Settings,
  Droplets,
  ChevronRight,
  Check,
  FileText
} from 'lucide-react';
import SaveCalculation from '@/components/SaveCalculation';
import { Product } from '@/app/protected/dimensionnement/resume/types/product';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown } from 'lucide-react';
import { generateModernPdf } from './utils/pdfGenerator'; 
import { 
  ClientInfo, 
  InstallerInfo, 
  Spec, 
  TechnicalSpecs,
  FormData,
  FormSection
} from '@/app/protected/dimensionnement/resume/types/showcase';
import { BuildingData } from '@/app/protected/dimensionnement/resume/types/building'

interface GeneratePdfData {
  fileName?: string;
  building: BuildingData;
  selectedProduct: Product;
  referenceNumber: string;
  clientInfo: {
    name: string;
    address: string;
    phone: string;
    city: string;
    postalCode: string;
  };
  installerInfo: {
    company: string;
    contact: string;
    email: string;
    phone: string;
    logo?: Blob | undefined; 
  };
}

interface ProductShowcaseProps {
  products: Product[];
  buildingData: BuildingData;  
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};


const specDescriptions = {
  reference: "La référence du modèle indique la gamme et la puissance nominale de la pompe à chaleur.",
  puissance_calo: "La puissance calorifique représente la capacité de chauffage de la pompe à chaleur. C'est l'énergie thermique fournie au bâtiment.",
  puissance_frigo: "La puissance frigorifique est la capacité de refroidissement. Elle représente l'énergie thermique extraite de la source froide.",
  puissance_absorbee: "La puissance absorbée est l'énergie électrique consommée par la pompe à chaleur pour fonctionner.",
  cop: "Le COP (Coefficient de Performance) est le rapport entre l'énergie thermique produite et l'énergie électrique consommée. Plus il est élevé, plus la pompe à chaleur est efficace.",
  etas: "Le ηs (ETAS) est l'efficacité énergétique saisonnière du chauffage. Il prend en compte les performances sur toute une saison de chauffe."
};

const ProductShowcase: React.FC<ProductShowcaseProps> = ({ products, buildingData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('specs');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [[page, direction], setPage] = useState([0, 0]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [openSpec, setOpenSpec] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [formData, setFormData] = useState({
    pdfName: '',  // Valeur par défaut vide
    client: {
      name: '',
      address: '',
      phone: '',
      city: '',
      postalCode: '',
      email: ''  // Ajoutez si nécessaire
    },
    installer: {
      company: '',
      contact: '',
      email: '',
      phone: '',
      logo: null,
    }
  });
  
  


  const paginate = (newDirection: number) => {
    const newPage = page + newDirection;
    if (newPage >= 0 && newPage < products.length) {
      setPage([newPage, newDirection]);
    } else if (newPage < 0) {
      setPage([products.length - 1, newDirection]);
    } else {
      setPage([0, newDirection]);
    }
    setCurrentIndex(newPage < 0 ? products.length - 1 : newPage >= products.length ? 0 : newPage);
    setIsPlaying(true); // Réinitialiser l'état de lecture
  };

  // Effet mis à jour pour la gestion des vidéos
  useEffect(() => {
    const currentVideo = videoRef.current;
    if (currentVideo) {
      currentVideo.currentTime = 0;
      currentVideo.play().catch(error => {
        console.log('Auto-play was prevented:', error);
      });
    }

    return () => {
      if (currentVideo) {
        currentVideo.pause();
      }
    };
  }, [page]);

  // Effet séparé pour la gestion du play/pause
  useEffect(() => {
    const currentVideo = videoRef.current;
    if (currentVideo) {
      if (isPlaying) {
        currentVideo.play().catch(error => {
          console.log('Play was prevented:', error);
        });
      } else {
        currentVideo.pause();
      }
    }
  }, [isPlaying]);

  const toggleVideo = () => {
    setIsPlaying(!isPlaying);
  };

  // Mise à jour du composant SpecCard pour un meilleur contrôle de l'affichage
  const SpecCard: React.FC<{
    spec: any;
    isOpen: boolean;
    onToggle: () => void;
    className?: string;
  }> = ({ spec, isOpen, onToggle, className = '' }) => {
    return (
      <div className={`bg-gray-50 rounded-xl border border-gray-100 ${className}`}>
        <div 
          onClick={onToggle}
          className="flex items-center p-6 cursor-pointer hover:shadow-lg transition-all"
        >
          <div className="mr-4 bg-white p-3 rounded-full shadow-sm">
            {spec.icon}
          </div>
          <div className="flex-grow">
            <p className="text-sm text-gray-500 font-medium">{spec.label}</p>
            <p className="text-xl font-bold text-gray-800">{spec.value}</p>
          </div>
        </div>
  
        {/* Ajout d'une condition style inline pour éviter l'espace vide */}
        <div style={{ display: isOpen ? 'block' : 'none' }} className="border-t border-gray-100">
          <div className="p-6 bg-white/50">
            <p className="text-gray-600 text-sm leading-relaxed">
              {spec.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

   // Vérification pour afficher ou masquer les flèches
    const isFirstProduct = page === 0;
    const isLastProduct = page === products.length - 1;

  const currentProduct = products[page];
// Modification de la fonction getTechnicalSpecs
const getTechnicalSpecs = (product: Product): TechnicalSpecs | Spec[] => {
  const selectedModel = product.selectedModel;
  if (!selectedModel) {
    return [
      {
        type: 'power',
        icon: <ThermometerSun className="text-[#86BC29]" size={24} />,
        label: "Puissance",
        value: `${product.Puissance.min} - ${product.Puissance.max} kW`,
        description: specDescriptions.reference
      },
      {
        type: 'cop',
        icon: <Wind className="text-[#86BC29]" size={24} />,
        label: "COP",
        value: `${product.Cop.max}`,
        description: specDescriptions.cop
      },
      {
        type: 'etas',
        icon: <Sparkles className="text-[#86BC29]" size={24} />,
        label: "ETAS",
        value: `${product.Etas.max}%`,
        description: specDescriptions.etas
      }
    ];
  }

  return {
    reference: {
      type: 'reference',
      icon: <Cpu className="text-[#86BC29]" size={24} />,
      label: "Référence",
      value: selectedModel.modele,
      description: specDescriptions.reference
    },
    powerSpecs: [
      {
        type: 'puissance_calo',
        icon: <ThermometerSun className="text-[#86BC29]" size={24} />,
        label: "P. calorifique",
        value: `${selectedModel.puissance_calo} kW`,
        description: specDescriptions.puissance_calo
      },
      {
        type: 'puissance_frigo',
        icon: <Snowflake className="text-[#86BC29]" size={24} />,
        label: "P. frigorifique",
        value: `${selectedModel.puissance_frigo} kW`,
        description: specDescriptions.puissance_frigo
      },
      {
        type: 'puissance_absorbee',
        icon: <Zap className="text-[#86BC29]" size={24} />,
        label: "P. absorbée",
        value: `${selectedModel.puissance_absorbee} kW`,
        description: specDescriptions.puissance_absorbee
      }
    ],
    performanceSpecs: [
      {
        type: 'cop',
        icon: <GaugeCircle className="text-[#86BC29]" size={24} />,
        label: "COP",
        value: selectedModel.cop.toFixed(2),
        description: specDescriptions.cop
      },
      {
        type: 'etas',
        icon: <BarChart3 className="text-[#86BC29]" size={24} />,
        label: "ηs",
        value: `${selectedModel.etas}%`,
        description: specDescriptions.etas
      }
    ]
  };
};


const handleInputChange = (section: FormSection, field: string, value: any) => {
  setFormData(prev => {
    if (section === 'general') {
      return {
        ...prev,
        [field]: value
      };
    }
    return {
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    };
  });
};

const handleGeneratePdf = async () => {
  try {
    let logoBlob: Blob | undefined = undefined;
    
    if (formData.installer.logo) {
      logoBlob = formData.installer.logo;
    }

    // Conversion pour correspondre au type attendu
    const sanitizedBuildingData: BuildingData = {
      totalSurface: buildingData.totalSurface,
      constructionYear: buildingData.constructionYear || undefined,
      buildingType: buildingData.buildingType || undefined,
      heatLoss: buildingData.heatLoss || undefined,
      ventilation: buildingData.ventilation || undefined,
      heatingTemp: buildingData.heatingTemp || undefined,
      department: buildingData.department || undefined,
      structure: buildingData.structure || undefined,
      groundStructure: buildingData.groundStructure || undefined,
      windowSurface: buildingData.windowSurface || undefined,
      adjacency: buildingData.adjacency || undefined,
      poolKit: buildingData.poolKit || undefined,
      freecoolingKit: buildingData.freecoolingKit || undefined,
      hotWater: buildingData.hotWater || undefined
    };

    const pdfData: GeneratePdfData = {
      fileName: formData.pdfName,
      building: sanitizedBuildingData,
      selectedProduct: products[page],
      referenceNumber: "REF-" + new Date().getTime(),
      clientInfo: formData.client,
      installerInfo: {
        ...formData.installer,
        logo: logoBlob
      }
    };
    
    await generateModernPdf(pdfData);
    setShowForm(false);
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
  }
};

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  handleGeneratePdf();
};

// Dans ProductShowcase.tsx
const handleSaveCalculation = async (data: any) => {
  try {
    // Puisque la sauvegarde est déjà gérée dans SaveCalculation,
    // nous n'avons plus besoin de l'appel API ici.
    // Nous pouvons simplement gérer les actions post-sauvegarde
    
    // Par exemple, mettre à jour l'état local si nécessaire
    // setStoredCalculations(prev => [...prev, data]);
    
    // Ou effectuer d'autres actions après la sauvegarde
    console.log('Sauvegarde réussie:', data);

    return data;
  } catch (error) {
    console.error('Erreur post-sauvegarde:', error);
    throw error;
  }
};

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Section vidéo hero avec fond blanc */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full h-[500px] bg-white overflow-hidden rounded-t-xl"
      >
        <AnimatePresence initial={false} custom={direction}>
        <motion.video
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
            }}
            ref={videoRef}
            src={currentProduct.Image.startsWith('/') ? currentProduct.Image : `/${currentProduct.Image}`}
            className="w-full h-full object-contain"
            loop
            muted
        />
        </AnimatePresence>

        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleVideo}
            className="absolute bottom-4 right-4 bg-[#86BC29] p-3 rounded-full hover:bg-[#75a625] transition-all"
          >
            {isPlaying ? (
              <PauseCircle className="w-6 h-6 text-white" />
            ) : (
              <PlayCircle className="w-6 h-6 text-white" />
            )}
          </motion.button>
      </motion.div>

      {/* Navigation et titre modernisé */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-6 bg-white shadow-lg rounded-b-xl"
      >
        <div className="flex items-center justify-between mb-2">
          {/* Conteneur flèche gauche avec texte */}
          <div className="flex flex-col items-center min-w-[100px]">
            {!isFirstProduct ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => paginate(-1)}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors border border-gray-200 mb-1"
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>
                <span className="text-xs text-gray-500">Produit précédent</span>
              </>
            ) : (
              <div className="w-12 h-12" /> // Maintien de l'espacement
            )}
          </div>

          <motion.h2
            key={currentProduct.Nom}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-center text-gray-800 flex flex-col items-center mb-8"
          >
            <span className="text-sm text-[#86BC29] uppercase tracking-wider mb-2">
              Produit compatible
            </span>
            <span className="text-3xl mb-2">{currentProduct.Nom}</span>
            {currentProduct.selectedModel && (
              <span className="text-2xl text-[#86BC29] font-semibold mt-2">
                {currentProduct.selectedModel.puissance_calo} kW
              </span>
            )}
          </motion.h2>

          {/* Conteneur flèche droite avec texte */}
          <div className="flex flex-col items-center min-w-[100px]">
            {!isLastProduct ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => paginate(1)}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors border border-gray-200 mb-1"
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
                <span className="text-xs text-gray-500">Produit suivant</span>
              </>
            ) : (
              <div className="w-12 h-12" /> // Maintien de l'espacement
            )}
          </div>
        </div>

        {/* Navigation des onglets modernisée */}
        <div className="flex justify-center space-x-4 mb-8">
          {['specs', 'details'].map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-full transition-all font-medium ${
                activeTab === tab
                  ? 'bg-[#86BC29] text-white shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {tab === 'specs' ? 'Spécifications' : 'Détails'}
            </motion.button>
          ))}
        </div>

         {/* Contenu modernisé */}
         <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl"
          >
            {activeTab === 'specs' ? (
              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
                {(() => {
                  const specs = getTechnicalSpecs(currentProduct);
                  if (Array.isArray(specs)) {
                    // Rendu pour le cas où selectedModel est null
                    return specs.map((spec) => (
                      <SpecCard
                        key={spec.type}
                        spec={spec}
                        isOpen={openSpec === spec.type}
                        onToggle={() => setOpenSpec(openSpec === spec.type ? null : spec.type)}
                      />
                    ));
                  }
                  // Rendu pour le cas où selectedModel existe
                  return (
                    <>
                      <motion.div variants={fadeInUp} className="w-full flex justify-center">
                        <div className="w-full max-w-2xl">
                          <SpecCard
                            spec={specs.reference}
                            isOpen={openSpec === 'reference'}
                            onToggle={() => setOpenSpec(openSpec === 'reference' ? null : 'reference')}
                            className="bg-[#86BC29]/10"
                          />
                        </div>
                      </motion.div>

                      <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-4">
                        {specs.powerSpecs.map((spec) => (
                          <SpecCard
                            key={spec.type}
                            spec={spec}
                            isOpen={openSpec === spec.type}
                            onToggle={() => setOpenSpec(openSpec === spec.type ? null : spec.type)}
                          />
                        ))}
                      </motion.div>

                      <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-4">
                        {specs.performanceSpecs.map((spec) => (
                          <SpecCard
                            key={spec.type}
                            spec={spec}
                            isOpen={openSpec === spec.type}
                            onToggle={() => setOpenSpec(openSpec === spec.type ? null : spec.type)}
                          />
                        ))}
                      </motion.div>
                    </>
                  );
                })()}
              </motion.div>
            ) : (
              <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              {/* Section Description */}
              <motion.div
                variants={fadeInUp}
                className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium mb-3 flex items-center text-gray-800">
                  <Info className="w-5 h-5 mr-2 text-[#86BC29]" />
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">{currentProduct.Description}</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Section Caractéristiques */}
                <motion.div
                  variants={fadeInUp}
                  className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-shadow h-full"
                >
                  <h3 className="font-medium mb-3 flex items-center text-gray-800">
                    <Award className="w-5 h-5 mr-2 text-[#86BC29] flex-shrink-0" />
                    Caractéristiques
                  </h3>
                  <div className="space-y-3">
                    {/* Plage de puissance */}
                    <div className="flex items-start gap-2">
                      <ThermometerSun className="w-4 h-4 text-[#86BC29] mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Plage de puissance :</span>
                        <br />
                        <span>{currentProduct.Puissance.min} - {currentProduct.Puissance.max} kW</span>
                      </div>
                    </div>

                    {/* Performance */}
                    <div className="flex items-start gap-2">
                      <GaugeCircle className="w-4 h-4 text-[#86BC29] mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Performance :</span>
                        <br />
                        <span>COP max : {currentProduct.Cop.max}</span>
                        <br />
                        <span>ETAS max : {currentProduct.Etas.max}%</span>
                      </div>
                    </div>

                    {/* Particularités en liste */}
                    <div className="mt-4">
                      <span className="font-medium mb-2 block">Particularités :</span>
                      <ul className="space-y-2">
                        {currentProduct.Particularites.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-center text-sm"
                          >
                            <span className="w-1.5 h-1.5 bg-[#86BC29] rounded-full mr-2 flex-shrink-0"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>

                {/* Section Dimensions et Spécifications */}
                <motion.div
                  variants={fadeInUp}
                  className="space-y-6"
                >
                  {/* Dimensions */}
                  <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-shadow">
                    <h3 className="font-medium mb-3 flex items-center text-gray-800">
                      <Ruler className="w-5 h-5 mr-2 text-[#86BC29] flex-shrink-0" />
                      Dimensions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-sm">
                        <p className="font-medium">Module simple :</p>
                        <p>L : {currentProduct.Dimension.largeur} mm</p>
                        <p>P : {currentProduct.Dimension.longueur} mm</p>
                        <p>H : {currentProduct.Dimension.hauteur} mm</p>
                      </div>
                      {(typeof currentProduct.Dimension2.largeur === 'string' ? 
                          currentProduct.Dimension2.largeur !== "-" : 
                          currentProduct.Dimension2.largeur !== undefined) && (
                          <div className="text-sm">
                            <p className="font-medium">Module double :</p>
                            <p>L : {currentProduct.Dimension2.largeur} mm</p>
                            <p>P : {currentProduct.Dimension2.longueur} mm</p>
                            <p>H : {currentProduct.Dimension2.hauteur} mm</p>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Spécifications supplémentaires */}
                  <div className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-shadow">
                    <h3 className="font-medium mb-3 flex items-center text-gray-800">
                      <Settings className="w-5 h-5 mr-2 text-[#86BC29] flex-shrink-0" />
                      Spécifications
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Waves className="w-4 h-4 text-[#86BC29] flex-shrink-0" />
                        <span>Température émetteur : {currentProduct.Emetteur.min}°C - {currentProduct.Emetteur.max}°C</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-[#86BC29] flex-shrink-0" />
                        <span>Kit Piscine : {currentProduct.Kit_Piscine ? 'Oui' : 'Non'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Snowflake className="w-4 h-4 text-[#86BC29] flex-shrink-0" />
                        <span>Freecooling : {currentProduct.Freecooling ? 'Oui' : 'Non'}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Section du formulaire et des boutons - NOUVEAU CODE */}
<div className="mt-8 space-y-6">
  {/* Bouton principal "Je choisis ce produit" */}
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => {
      // Sauvegarder le produit sélectionné dans le localStorage
      const selectedProduct = products[page];
      localStorage.setItem('selected_product', JSON.stringify(selectedProduct));
      setShowActionButtons(true); // Nouvel état pour afficher les boutons d'action
    }}
    className="w-full px-6 py-4 bg-[#86BC29] text-white rounded-xl font-medium flex items-center justify-center shadow-lg hover:bg-[#75a625] transition-colors text-lg"
  >
    <motion.div
      whileHover={{ rotate: 360 }}
      transition={{ duration: 0.5 }}
    >
      <Check className="w-6 h-6 mr-3" />
    </motion.div>
    Je choisis ce produit
  </motion.button>

  {/* Boutons d'action - apparaissent après avoir cliqué sur "Je choisis ce produit" */}
  <AnimatePresence>
    {showActionButtons && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
      >
        {/* Bloc PDF */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-4"
        >
          <h3 className="text-lg font-semibold text-[#86BC29] mb-2">
            Document client
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Imprimer un résumé du calcul afin de le présenter à votre client
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="w-full px-4 py-3 bg-[#86BC29] text-white rounded-lg font-medium flex items-center justify-center shadow hover:bg-[#75a625] transition-colors"
          >
            <FileText className="w-5 h-5 mr-2" />
            Générer un PDF
          </motion.button>
        </motion.div>

        {/* Bloc Enregistrement */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-4"
        >
          <h3 className="text-lg font-semibold text-[#86BC29] mb-2">
            Sauvegarde projet
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Enregistrer le projet pour le modifier à n'importe quel moment
          </p>
          <SaveCalculation onSave={handleSaveCalculation} />
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>

{/* Modal du formulaire */}
<AnimatePresence>
  {showForm && (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl w-full max-w-3xl p-6 shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Informations pour le PDF</h2>
          <button 
            onClick={() => setShowForm(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Information du document</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du fichier PDF
            </label>
            <input
              type="text"
              value={formData.pdfName || ''} // Ajout du || '' pour éviter les undefined
              onChange={(e) => handleInputChange('general', 'pdfName', e.target.value)}
              placeholder="Laissez vide pour un nom générique"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Client */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Informations Client</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.client.name}
                  onChange={(e) => handleInputChange('client', 'name', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={formData.client.address}
                  onChange={(e) => handleInputChange('client', 'address', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={formData.client.phone}
                  onChange={(e) => handleInputChange('client', 'phone', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input
                  type="text"
                  value={formData.client.city}
                  onChange={(e) => handleInputChange('client', 'city', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code Postal</label>
                <input
                  type="text"
                  value={formData.client.postalCode}
                  onChange={(e) => handleInputChange('client', 'postalCode', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                  pattern="[0-9]{5}"
                  title="Code postal à 5 chiffres"
                />
              </div>
            </div>
          </div>

          {/* Section Installateur */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Informations Installateur</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Société</label>
                <input
                  type="text"
                  value={formData.installer.company}
                  onChange={(e) => handleInputChange('installer', 'company', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input
                  type="text"
                  value={formData.installer.contact}
                  onChange={(e) => handleInputChange('installer', 'contact', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.installer.email}
                  onChange={(e) => handleInputChange('installer', 'email', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={formData.installer.phone}
                  onChange={(e) => handleInputChange('installer', 'phone', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo de l'entreprise</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleInputChange('installer', 'logo', e.target.files[0]);
                      }
                    }}
                    accept="image/*"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {formData.installer.logo && (
                    <span className="text-sm text-green-600">Logo sélectionné ✓</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="flex justify-end pt-6 space-x-4">
            <motion.button
              type="button"
              onClick={() => setShowForm(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium shadow-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-[#86BC29] text-white rounded-lg font-medium flex items-center shadow-lg hover:bg-[#75a625] transition-colors"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Générer le PDF
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
</div>

            {/* Indicateurs de progression modernisés */}
            <div className="mt-8 flex justify-center space-x-3">
      {products.map((_, index) => (
        <motion.button
          key={index}
          initial={{ scale: 0 }}
          animate={{
            scale: 1,
            backgroundColor: index === page ? '#86BC29' : '#e5e7eb'
          }}
          whileHover={{ scale: 1.2 }}
          onClick={() => setPage([index, index > page ? 1 : -1])}
          className={`w-3 h-3 rounded-full transition-all ${
            index === page ? 'shadow-md' : ''
          }`}
        />
      ))}
    </div>

      </motion.div>
    </div>
  );
};

export default ProductShowcase;