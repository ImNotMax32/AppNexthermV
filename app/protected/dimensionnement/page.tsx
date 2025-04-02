'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input as BaseInput} from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, ArrowRight, Check, X, ThermometerSun, Info, Home } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Variants } from 'framer-motion';
import { useDeperditionCalculator } from './resume/utils/deperditionCalculator';

// Types pour l'input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  error?: boolean;
  required?: boolean;
}

interface SelectWithAnimationProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  error?: boolean;
  required?: boolean;
}

interface FormData {
  hasExistingCalculation: boolean;
  knownDeperdition: string;
  constructionYear: string;
  buildingType: string;
  floors: {
    ground: { surface: string; height: string };
    first: { surface: string; height: string };
    second: { surface: string; height: string };
  };
  buildingStructure: string;
  groundStructure: string;
  showAdvancedOptions: boolean;
  wallThickness: string;
  wallComposition: string;
  interiorInsulation: {
    enabled: boolean;
    material: string;
    thickness: string;
  };
  exteriorInsulation: {
    enabled: boolean;
    material: string;
    thickness: string;
  };
  atticInsulation: string;
  floorInsulation: string;
  windowSurface: string;
  windowType: string;
  adjacency: string;
  mainOrientation: string;
  ventilation: string;
  heatingTemp: string;
  department: string;
  termsAccepted: boolean;
}
interface FormErrors {
  [key: string]: boolean;
}

// Les animations variants restent les mêmes
const fadeInUp: Variants = {
  initial: { 
    opacity: 0, 
    y: 20 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

const staggerChildren: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const titleVariants: Variants = {
  initial: { 
    opacity: 0, 
    x: -20 
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  }
};

const subtitleVariants: Variants = {
  initial: { 
    opacity: 0, 
    x: -10 
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      delay: 0.2
    }
  }
};

const resultCardVariants: Variants = {
  initial: { 
    scale: 0.8, 
    opacity: 0 
  },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  },
  exit: { 
    scale: 0.8, 
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { value, onChange, className = '', label, type, required = false, error = false, ...rest } = props;
  const hasValue = value && value !== '';
  const hasError = error || (type === 'number' && hasValue && parseFloat(value) < 0);
  const errorMessage = type === 'number' && parseFloat(value) < 0 ? 
    'La valeur ne peut pas être négative' : 
    'Veuillez remplir ce champ';

  return (
    <motion.div
      variants={fadeInUp}
      className="space-y-2"
    >
      <div className="flex items-center gap-2">
        <Label className={
          hasError ? "text-red-500 font-medium" : 
          hasValue && !hasError ? "text-[#86BC29] font-medium" : ""
        }>
          {label}
          {required && !hasValue && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {hasValue && !hasError && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[#86BC29] flex-shrink-0"
          >
            <Check className="h-4 w-4" />
          </motion.span>
        )}
        {hasError && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-red-500 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </motion.span>
        )}
      </div>
      <BaseInput
        {...rest}
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        className={`transition-all duration-300 
          ${hasValue && !hasError ? 'ring-1 ring-[#86BC29]' : ''} 
          ${hasError ? 'ring-2 ring-red-500 bg-red-50' : ''}
          hover:ring-2 hover:ring-[#86BC29]/50
          focus:ring-2 focus:ring-[#86BC29] ${className}`}
      />
      {hasError && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-sm text-red-500"
        >
          {errorMessage}
        </motion.p>
      )}
    </motion.div>
  );
});

Input.displayName = 'Input';

// Composant Select amélioré
const SelectWithAnimation: React.FC<SelectWithAnimationProps> = ({ 
  label, 
  value, 
  onValueChange, 
  children,
  error = false,
  required = false
}) => {
  const hasValue = value && value !== '';
  
  // Définir des variants pour les animations (constants à chaque rendu)
  const selectValueVariants = {
    idle: { y: 0 },
    selected: { 
      y: [0, -5, 0],
      transition: { duration: 0.2 }
    }
  };
  
  return (
    <motion.div
      variants={fadeInUp}
      className="space-y-2"
    >
      <div className="flex items-center gap-2">
        <Label className={
          error ? "text-red-500 font-medium" : 
          hasValue ? "text-[#86BC29] font-medium" : ""
        }>
          {label}
          {required && !hasValue && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {hasValue && !error && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[#86BC29] flex-shrink-0"
          >
            <Check className="h-4 w-4" />
          </motion.span>
        )}
        {error && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-red-500 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </motion.span>
        )}
      </div>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger 
          className={`w-full transition-all duration-300 
            hover:ring-2 hover:ring-[#86BC29]/50
            ${error ? 'ring-2 ring-red-500 bg-red-50' : 
              hasValue ? 'ring-1 ring-[#86BC29]' : ''}`}
        >
          <motion.div
            initial="idle"
            animate={hasValue ? "selected" : "idle"}
            variants={selectValueVariants}
          >
            <SelectValue placeholder={`Sélectionnez ${label.toLowerCase()}`} />
          </motion.div>
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-sm text-red-500"
        >
          Veuillez remplir ce champ
        </motion.p>
      )}
    </motion.div>
  );
};

export default function DeperditionCalculator() {
    const [formData, setFormData] = useState<FormData>({
    hasExistingCalculation: false,
    knownDeperdition: '',
    constructionYear: '',
    buildingType: '',
    floors: {
      ground: { surface: '', height: '' },
      first: { surface: '', height: '' },
      second: { surface: '', height: '' }
    },
    buildingStructure: '',
    groundStructure: '',
    showAdvancedOptions: false,
    wallThickness: '',
    wallComposition: '',
    interiorInsulation: {
      enabled: false,
      material: '',
      thickness: ''
    },
    exteriorInsulation: {
      enabled: false,
      material: '',
      thickness: ''
    },
    atticInsulation: '',
    floorInsulation: '',
    windowSurface: '',
    windowType: '',
    adjacency: '',
    mainOrientation: '',
    ventilation: '',
    heatingTemp: '',
    department: '',
    termsAccepted: false
  });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
  
    const loadSavedData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/sign-in');
          return;
        }
  
        const isEditing = localStorage.getItem('isEditing');
        console.log('État initial isEditing:', isEditing);
        
        if (isEditing === 'true' && mounted) {
          const newFormData = {
            hasExistingCalculation: false,
            knownDeperdition: localStorage.getItem('ResultatDeperdition') || '',
            constructionYear: localStorage.getItem('Annee_de_construction') || '',
            buildingType: localStorage.getItem('Type_de_construction') || '',
            floors: {
              ground: {
                surface: localStorage.getItem('Surface_RDC') || '',
                height: '2.5' // Valeur par défaut
              },
              first: {
                surface: localStorage.getItem('Surface_1er_etage') || '',
                height: '2.5'
              },
              second: {
                surface: localStorage.getItem('Surface_2e_etage') || '',
                height: '2.5'
              }
            },
            buildingStructure: localStorage.getItem('Structure_de_la_construction') || '',
            groundStructure: localStorage.getItem('Structure_du_sol') || '',
            showAdvancedOptions: false,
            wallThickness: localStorage.getItem('wallThickness') || '',
            wallComposition: localStorage.getItem('wallComposition') || '',
            interiorInsulation: {
              enabled: localStorage.getItem('interiorInsulation') === 'true',
              material: localStorage.getItem('interiorMaterial') || '',
              thickness: localStorage.getItem('interiorThickness') || ''
            },
            exteriorInsulation: {
              enabled: localStorage.getItem('exteriorInsulation') === 'true',
              material: localStorage.getItem('exteriorMaterial') || '',
              thickness: localStorage.getItem('exteriorThickness') || ''
            },
            atticInsulation: localStorage.getItem('atticInsulation') || '',
            floorInsulation: localStorage.getItem('floorInsulation') || '',
            windowSurface: localStorage.getItem('Surface_de_vitrage') || '',
            windowType: localStorage.getItem('windowType') || '',
            adjacency: localStorage.getItem('Mitoyennete') || '',
            mainOrientation: localStorage.getItem('mainOrientation') || '',
            ventilation: localStorage.getItem('Ventilation') || '',
            heatingTemp: localStorage.getItem('Temperature_de_chauffage') || '',
            department: localStorage.getItem('Departement') || '',
            termsAccepted: true
          };
  
          console.log('Mise à jour du formulaire avec:', newFormData);
          setFormData(newFormData);
          
          // Important: Ne supprimer isEditing qu'après avoir chargé les données
          localStorage.removeItem('isEditing');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
  
    loadSavedData();
  
    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []);

  const [result, setResult] = useState<{
    totalLoss: number;
    details?: {
      wallLoss: number;
      windowLoss: number;
      roofLoss: number;
      floorLoss: number;
      airLoss: number;
      thermalBridge: number;
    };
  } | null>(null);

  // Nouveau state pour les erreurs
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const { calculateAll } = useDeperditionCalculator(formData);
  const supabase = createClient();
  const router = useRouter();

  const validateForm = () => {
    const errors: FormErrors = {};
  
    // Nouvelle condition pour les déperditions connues
    if (formData.hasExistingCalculation) {
      if (!formData.knownDeperdition || parseFloat(formData.knownDeperdition) <= 0) {
        errors.knownDeperdition = true;
      }
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    }
  
    if (!formData.constructionYear) errors.constructionYear = true;
    if (!formData.buildingType) errors.buildingType = true;
    if (!formData.buildingStructure) errors.buildingStructure = true;
    if (!formData.groundStructure) errors.groundStructure = true;
    if (!formData.windowSurface) errors.windowSurface = true;
    if (!formData.windowType) errors.windowType = true;
    if (!formData.adjacency) errors.adjacency = true;
    if (!formData.mainOrientation) errors.mainOrientation = true;
    if (!formData.ventilation) errors.ventilation = true;
    if (!formData.heatingTemp) errors.heatingTemp = true;
    if (!formData.department) errors.department = true;

    // Validation des étages
    if (!formData.floors.ground.surface || parseFloat(formData.floors.ground.surface) <= 0) {
      errors.groundSurface = true;
    }
    if (!formData.floors.ground.height || parseFloat(formData.floors.ground.height) <= 0) {
      errors.groundHeight = true;
    }

    if (formData.buildingType === "1 Étage" || formData.buildingType === "2 Étages") {
      if (!formData.floors.first.surface || parseFloat(formData.floors.first.surface) <= 0) {
        errors.firstSurface = true;
      }
      if (!formData.floors.first.height || parseFloat(formData.floors.first.height) <= 0) {
        errors.firstHeight = true;
      }
    }

    if (formData.buildingType === "2 Étages") {
      if (!formData.floors.second.surface || parseFloat(formData.floors.second.surface) <= 0) {
        errors.secondSurface = true;
      }
      if (!formData.floors.second.height || parseFloat(formData.floors.second.height) <= 0) {
        errors.secondHeight = true;
      }
    }

    // Validation des options avancées si activées
    if (formData.showAdvancedOptions) {
      if (!formData.wallThickness || parseFloat(formData.wallThickness) <= 0) {
        errors.wallThickness = true;
      }
      if (!formData.wallComposition) errors.wallComposition = true;
      if (!formData.atticInsulation) errors.atticInsulation = true;
      if (!formData.floorInsulation) errors.floorInsulation = true;

      if (formData.interiorInsulation.enabled) {
        if (!formData.interiorInsulation.material) errors.interiorMaterial = true;
        if (!formData.interiorInsulation.thickness || 
            parseFloat(formData.interiorInsulation.thickness) <= 0) {
          errors.interiorThickness = true;
        }
      }

      if (formData.exteriorInsulation.enabled) {
        if (!formData.exteriorInsulation.material) errors.exteriorMaterial = true;
        if (!formData.exteriorInsulation.thickness || 
            parseFloat(formData.exteriorInsulation.thickness) <= 0) {
          errors.exteriorThickness = true;
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/sign-in');
      }
    };
    checkAuth();
  }, []);

  const handleChange = (field: string, value: any) => {
    if (field === 'buildingType') {
      // Réinitialisation des étages selon le type de bâtiment sélectionné
      setFormData(prev => ({
        ...prev,
        [field]: value,
        floors: {
          ground: prev.floors.ground, // Garde le RDC inchangé
          first: {
            surface: value === 'RDC' ? '' : prev.floors.first.surface,
            height: value === 'RDC' ? '' : prev.floors.first.height
          },
          second: {
            surface: value === '2 Étages' ? prev.floors.second.surface : '',
            height: value === '2 Étages' ? prev.floors.second.height : ''
          }
        }
      }));
  
      // Mise à jour du localStorage pour les surfaces
      if (value === 'RDC') {
        localStorage.setItem('Surface_1er_etage', '0');
        localStorage.setItem('Surface_2e_etage', '0');
      } else if (value === '1 Étage') {
        localStorage.setItem('Surface_2e_etage', '0');
      }
    } else {
      // Comportement normal pour les autres champs
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Reset le résultat et les erreurs à chaque modification
    setResult(null);
    setFormErrors(prev => ({ ...prev, [field]: false }));
  
    // Sauvegarde dans localStorage avec les bonnes clés
    switch(field) {
      case 'constructionYear':
        localStorage.setItem('Annee_de_construction', value);
        break;
      case 'buildingType':
        localStorage.setItem('Type_de_construction', value);
        break;
      case 'ventilation':
        localStorage.setItem('Ventilation', value);
        break;
      case 'heatingTemp':
        localStorage.setItem('Temperature_de_chauffage', value);
        break;
      case 'department':
        localStorage.setItem('Departement', value);
        break;
      case 'buildingStructure':
        localStorage.setItem('Structure_de_la_construction', value);
        break;
      case 'groundStructure':
        localStorage.setItem('Structure_du_sol', value);
        break;
      case 'windowSurface':
        localStorage.setItem('Surface_de_vitrage', value);
        break;
      case 'adjacency':
        localStorage.setItem('Mitoyennete', value);
        break;
      default:
        localStorage.setItem(field, value);
    }
  };

  const handleFloorChange = (floor: 'ground' | 'first' | 'second', field: 'surface' | 'height', value: string) => {
    setFormData(prev => ({
      ...prev,
      floors: {
        ...prev.floors,
        [floor]: {
          ...prev.floors[floor],
          [field]: value
        }
      }
    }));

    // Reset le résultat et les erreurs
    setResult(null);
    setFormErrors(prev => ({ ...prev, [`${floor}${field.charAt(0).toUpperCase() + field.slice(1)}`]: false }));
  
    // Sauvegarde dans localStorage
    if (field === 'surface') {
      switch(floor) {
        case 'ground':
          localStorage.setItem('Surface_RDC', value);
          break;
        case 'first':
          localStorage.setItem('Surface_1er_etage', value);
          break;
        case 'second':
          localStorage.setItem('Surface_2e_etage', value);
          break;
      }
    }
  };

  const toggleAdvancedOptions = () => {
    setFormData(prev => ({
      ...prev,
      showAdvancedOptions: !prev.showAdvancedOptions
    }));
  };

  const resultRef = React.useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    if (!formData.termsAccepted) {
      alert("Veuillez accepter les conditions d'utilisation");
      return;
    }
  
    if (formData.hasExistingCalculation) {
      if (!formData.knownDeperdition || parseFloat(formData.knownDeperdition) <= 0) {
        setFormErrors({ knownDeperdition: true });
        return;
      }
      
      const deperditionValue = parseFloat(formData.knownDeperdition);
      setResult({
        totalLoss: deperditionValue,
      });
      
      // Stocker la valeur totale
      localStorage.setItem('ResultatDeperdition', deperditionValue.toString());
      sessionStorage.setItem('ResultatDeperdition', deperditionValue.toString());
      
      router.push('/protected/dimensionnement/methode');
      return;
    }
  
    if (!validateForm()) {
      const firstErrorElement = document.querySelector('.text-red-500');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
  
    const calculationResult = calculateAll();
    if (calculationResult) {
      setResult(calculationResult);
      
      // Stocker la valeur totale
      localStorage.setItem('ResultatDeperdition', calculationResult.totalLoss.toString());
      sessionStorage.setItem('ResultatDeperdition', calculationResult.totalLoss.toString());
  
      // Stocker les valeurs détaillées dans le sessionStorage
      if (calculationResult.details) {
        sessionStorage.setItem('windowHeatLoss', calculationResult.details.windowLoss.toString());
        sessionStorage.setItem('roofHeatLoss', calculationResult.details.roofLoss.toString());
        sessionStorage.setItem('FloorHeatLoss', calculationResult.details.floorLoss.toString());
        sessionStorage.setItem('airNeufLoss', calculationResult.details.airLoss.toString());
        sessionStorage.setItem('thermalBridgeLoss', calculationResult.details.thermalBridge.toString());
        // La valeur des murs est déjà incluse dans ResultatDeperdition
      }
  
      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  };

  return (
    <>
    <motion.div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <Card>
        {/* Le titre va ici, juste après l'ouverture de la Card */}
        <CardHeader className="space-y-3 p-4 sm:p-6 border-b border-gray-100">
          <motion.div
            initial="initial"
            animate="animate"
            variants={titleVariants}
          >
            <div className="flex items-center justify-center mb-1">
              <div className="h-px w-12 bg-[#86BC29]/50 mr-3"></div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-[#86BC29]">
                Calcul des déperditions
              </CardTitle>
              <div className="h-px w-12 bg-[#86BC29]/50 ml-3"></div>
            </div>
            <CardDescription className="text-base text-center text-gray-500 mb-4">
              {formData.hasExistingCalculation 
                ? "Entrez les déperditions connues de votre bâtiment"
                : "Calculez les déperditions thermiques de votre bâtiment"}
            </CardDescription>
          </motion.div>

          {/* Texte de présentation plus léger */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-3 text-center text-sm text-gray-600 max-w-3xl mx-auto"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#86BC29]/10 flex items-center justify-center mr-2">
                <Home className="w-4 h-4 text-[#86BC29]" />
              </div>
              <span>Caractéristiques du bâtiment</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-gray-200"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#86BC29]/10 flex items-center justify-center mr-2">
                <ThermometerSun className="w-4 h-4 text-[#86BC29]" />
              </div>
              <span>Calcul précis</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-gray-200"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#86BC29]/10 flex items-center justify-center mr-2">
                <Info className="w-4 h-4 text-[#86BC29]" />
              </div>
              <span>Conseils personnalisés</span>
            </div>
          </motion.div>
        </CardHeader>

<CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6">
  {/* Section des boutons Oui/Non améliorée */}
  <motion.div 
    className="space-y-4 sm:space-y-6 text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Label className="text-base sm:text-lg block mb-3 sm:mb-4">
      Possédez-vous déjà les déperditions de votre bâtiment ?
    </Label>
    <motion.div 
      className="flex justify-center gap-4 sm:gap-6"
      initial="initial"
      animate="animate"
      variants={staggerChildren}
    >
      <motion.div
        variants={fadeInUp}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          variant={formData.hasExistingCalculation ? "default" : "outline"}
          onClick={() => handleChange('hasExistingCalculation', true)}
          className={`w-28 sm:w-32 h-10 sm:h-12 text-base sm:text-lg transition-all duration-300
            ${formData.hasExistingCalculation 
              ? 'bg-[#86BC29] hover:bg-[#75a625] text-white shadow-lg' 
              : 'hover:border-[#86BC29] hover:text-[#86BC29]'}`}
        >
          Oui
        </Button>
      </motion.div>
      <motion.div
        variants={fadeInUp}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          variant={!formData.hasExistingCalculation ? "default" : "outline"}
          onClick={() => handleChange('hasExistingCalculation', false)}
          className={`w-28 sm:w-32 h-10 sm:h-12 text-base sm:text-lg transition-all duration-300
            ${!formData.hasExistingCalculation 
              ? 'bg-[#86BC29] hover:bg-[#75a625] text-white shadow-lg' 
              : 'hover:border-[#86BC29] hover:text-[#86BC29]'}`}
        >
          Non
        </Button>
      </motion.div>
    </motion.div>
  </motion.div>

  {/* Contenu conditionnel */}
  <AnimatePresence mode="wait">
    {formData.hasExistingCalculation ? (
      <motion.div
        key="known-deperdition"
        {...fadeInUp}
        className="space-y-4"
      >
        <Input
          label="Déperdition connue (kW)"
          type="number"
          value={formData.knownDeperdition}
          onChange={(e) => handleChange('knownDeperdition', e.target.value)}
          placeholder="Ex: 5.2"
          error={formErrors.knownDeperdition}
          required
        />
        
        {/* Conditions d'utilisation */}
        <motion.div variants={fadeInUp} className="space-y-2 mt-6">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => handleChange('termsAccepted', checked)}
                    className="mt-1" 
                  />
                  <div className="flex flex-wrap items-center space-x-1">
                    <Label htmlFor="terms" className="text-sm sm:text-base">
                      J'accepte les
                    </Label>
                    <a 
                      href="/assets/img/CU.pdf" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm sm:text-base text-[#585858] hover:text-[#000000] underline underline-offset-2"
                    >
                      conditions d'utilisation
                    </a>
                  </div>
                </div>
              </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            className="w-full bg-[#86BC29] hover:bg-[#75a625] text-white py-2 sm:py-3 text-sm sm:text-base font-medium rounded-lg shadow transition-all duration-200"
            onClick={handleCalculate}
            disabled={!formData.termsAccepted}
          >
            <ArrowRight className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Continuer
          </Button>
        </motion.div>
      </motion.div>
    ) : (
              <motion.div
              initial="initial"
              animate="animate"
              variants={staggerChildren}
              className="space-y-6"
            >
              {/* Section 1 */}
              <motion.div variants={fadeInUp} className="space-y-6">
                <motion.h3 
                  variants={subtitleVariants}
                  className="text-2xl sm:text-3xl font-semibold text-[#86BC29] border-b-2 border-[#86BC29] pb-2"
                >
                  1 - Caractéristiques du bâtiment
                </motion.h3>
                
                {/* Année et Type de construction */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectWithAnimation
                    label="Année de construction"
                    value={formData.constructionYear}
                    onValueChange={(value) => handleChange('constructionYear', value)}
                    error={formErrors.constructionYear}
                    required
                  >
                    <SelectItem value="Avant 1974">Avant 1974</SelectItem>
                    <SelectItem value="De 1974 à 1980">De 1974 à 1980</SelectItem>
                    <SelectItem value="De 1981 à 1988">De 1981 à 1988</SelectItem>
                    <SelectItem value="De 1989 à 1999">De 1989 à 1999</SelectItem>
                    <SelectItem value="De 2000 à 2004">De 2000 à 2004</SelectItem>
                    <SelectItem value="De 2005 à 2012">De 2005 à 2012</SelectItem>
                    <SelectItem value="De 2013 à 2019">De 2013 à 2019</SelectItem>
                    <SelectItem value="De 2020 à 2024">De 2020 à 2024</SelectItem>
                  </SelectWithAnimation>

                  <SelectWithAnimation
                    label="Type de construction"
                    value={formData.buildingType}
                    onValueChange={(value) => handleChange('buildingType', value)}
                    error={formErrors.buildingType}
                    required
                  >
                    <SelectItem value="RDC">RDC</SelectItem>
                    <SelectItem value="1 Étage">1 Étage</SelectItem>
                    <SelectItem value="2 Étages">2 Étages</SelectItem>
                  </SelectWithAnimation>
                </div>

                {/* Section des étages */}
                <div className="space-y-4">
                  {/* RDC */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Surface RDC (m²)"
                      type="number"
                      value={formData.floors.ground.surface}
                      onChange={(e) => handleFloorChange('ground', 'surface', e.target.value)}
                      placeholder="Ex: 100"
                      error={formErrors.groundSurface}
                      required
                    />
                    <Input
                      label="Hauteur sous plafond RDC (m)"
                      type="number"
                      value={formData.floors.ground.height}
                      onChange={(e) => handleFloorChange('ground', 'height', e.target.value)}
                      placeholder="Ex: 2.5"
                      error={formErrors.groundHeight}
                      required
                    />
                  </div>

                  {/* 1er étage */}
                  {(formData.buildingType === "1 Étage" || formData.buildingType === "2 Étages") && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Surface 1er étage (m²)"
                        type="number"
                        value={formData.floors.first.surface}
                        onChange={(e) => handleFloorChange('first', 'surface', e.target.value)}
                        placeholder="Ex: 100"
                        error={formErrors.firstSurface}
                        required
                      />
                      <Input
                        label="Hauteur sous plafond 1er étage (m)"
                        type="number"
                        value={formData.floors.first.height}
                        onChange={(e) => handleFloorChange('first', 'height', e.target.value)}
                        placeholder="Ex: 2.5"
                        error={formErrors.firstHeight}
                        required
                      />
                    </div>
                  )}

                  {/* 2ème étage */}
                  {formData.buildingType === "2 Étages" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Surface 2e étage (m²)"
                        type="number"
                        value={formData.floors.second.surface}
                        onChange={(e) => handleFloorChange('second', 'surface', e.target.value)}
                        placeholder="Ex: 100"
                        error={formErrors.secondSurface}
                        required
                      />
                      <Input
                        label="Hauteur sous plafond 2e étage (m)"
                        type="number"
                        value={formData.floors.second.height}
                        onChange={(e) => handleFloorChange('second', 'height', e.target.value)}
                        placeholder="Ex: 2.5"
                        error={formErrors.secondHeight}
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Structure de construction et Structure du sol */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectWithAnimation
                    label="Structure de la construction"
                    value={formData.buildingStructure}
                    onValueChange={(value) => handleChange('buildingStructure', value)}
                    error={formErrors.buildingStructure}
                    required
                  >
                    <SelectItem value="Carré">Carré</SelectItem>
                    <SelectItem value="Rectangulaire">Rectangulaire</SelectItem>
                    <SelectItem value="Maison en L">Maison en L</SelectItem>
                    <SelectItem value="Maison en U">Maison en U</SelectItem>
                  </SelectWithAnimation>

                  <SelectWithAnimation
                    label="Structure du sol"
                    value={formData.groundStructure}
                    onValueChange={(value) => handleChange('groundStructure', value)}
                    error={formErrors.groundStructure}
                    required
                  >
                    <SelectItem value="Une cave enterrée">Une cave enterrée</SelectItem>
                    <SelectItem value="Une cave semi-enterrée">Une cave semi-enterrée</SelectItem>
                    <SelectItem value="Un vide sanitaire">Un vide sanitaire</SelectItem>
                    <SelectItem value="Terre plein">Terre plein</SelectItem>
                  </SelectWithAnimation>
                </div>
              </motion.div>
{/* Options avancées */}
<motion.div variants={fadeInUp} className="space-y-4">
  <div className="flex items-center space-x-2">
    <Checkbox
      id="advanced-options"
      checked={formData.showAdvancedOptions}
      onCheckedChange={toggleAdvancedOptions}
    />
    <Label htmlFor="advanced-options">
      Calcul des déperditions murales avancées
    </Label>
  </div>

  <AnimatePresence>
    {formData.showAdvancedOptions && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {/* Épaisseur des murs */}
<div className="space-y-2">
  <div className="flex items-center gap-2">
    <Label className={
      formErrors.wallThickness ? "text-red-500 font-medium" : 
      formData.wallThickness ? "text-[#86BC29] font-medium" : ""
    }>
      Épaisseur des murs (cm)
      {formErrors.wallThickness && <span className="text-red-500 ml-1">*</span>}
    </Label>
    {formData.wallThickness && !formErrors.wallThickness && (
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-[#86BC29] flex-shrink-0"
      >
        <Check className="h-4 w-4" />
      </motion.span>
    )}
          </div>
          <Select 
            value={formData.wallThickness}
            onValueChange={(value) => handleChange('wallThickness', value)}
          >
            <SelectTrigger className={`
              transition-all duration-300
              ${formErrors.wallThickness ? 'ring-2 ring-red-500 bg-red-50' : ''}
              ${formData.wallThickness && !formErrors.wallThickness ? 'ring-1 ring-[#86BC29]' : ''}
              hover:ring-2 hover:ring-[#86BC29]/50
            `}>
              <SelectValue placeholder="Sélectionnez l'épaisseur" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map(thickness => (
                <SelectItem key={thickness} value={thickness.toString()}>
                  {thickness} cm
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.wallThickness && (
            <p className="text-sm text-red-500">Ce champ est requis</p>
          )}
        </div>

        {/* Composition des murs */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className={
              formErrors.wallComposition ? "text-red-500 font-medium" : 
              formData.wallComposition ? "text-[#86BC29] font-medium" : ""
            }>
              Composition des murs
              {formErrors.wallComposition && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {formData.wallComposition && !formErrors.wallComposition && (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[#86BC29] flex-shrink-0"
              >
                <Check className="h-4 w-4" />
              </motion.span>
            )}
          </div>
          <Select 
            value={formData.wallComposition}
            onValueChange={(value) => handleChange('wallComposition', value)}
          >
            <SelectTrigger className={`
              transition-all duration-300
              ${formErrors.wallComposition ? 'ring-2 ring-red-500 bg-red-50' : ''}
              ${formData.wallComposition && !formErrors.wallComposition ? 'ring-1 ring-[#86BC29]' : ''}
              hover:ring-2 hover:ring-[#86BC29]/50
            `}>
              <SelectValue placeholder="Sélectionnez la composition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Béton">Béton</SelectItem>
              <SelectItem value="Brique">Brique</SelectItem>
              <SelectItem value="Parpaing">Parpaing</SelectItem>
              <SelectItem value="Bois">Bois</SelectItem>
              <SelectItem value="Pierre">Pierre</SelectItem>
            </SelectContent>
          </Select>
          {formErrors.wallComposition && (
            <p className="text-sm text-red-500">Ce champ est requis</p>
          )}
        </div>
          {/* Isolation intérieure */}
          <div className="space-y-2 col-span-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="interior-isolation"
                checked={formData.interiorInsulation.enabled}
                onCheckedChange={(checked) => 
                  handleChange('interiorInsulation', {
                    ...formData.interiorInsulation,
                    enabled: checked
                  })
                }
              />
              <Label htmlFor="interior-isolation">
                Isolation intérieure
              </Label>
            </div>

            {formData.interiorInsulation.enabled && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className={
                      formErrors.interiorMaterial ? "text-red-500 font-medium" : 
                      formData.interiorInsulation.material ? "text-[#86BC29] font-medium" : ""
                    }>
                      Matériau
                      {formErrors.interiorMaterial && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {formData.interiorInsulation.material && !formErrors.interiorMaterial && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-[#86BC29] flex-shrink-0"
                      >
                        <Check className="h-4 w-4" />
                      </motion.span>
                    )}
                  </div>
                  <Select 
                    value={formData.interiorInsulation.material}
                    onValueChange={(value) => 
                      handleChange('interiorInsulation', {
                        ...formData.interiorInsulation,
                        material: value
                      })
                    }
                  >
                    <SelectTrigger className={`
                      transition-all duration-300
                      ${formErrors.interiorMaterial ? 'ring-2 ring-red-500 bg-red-50' : ''}
                      ${formData.interiorInsulation.material && !formErrors.interiorMaterial ? 'ring-1 ring-[#86BC29]' : ''}
                      hover:ring-2 hover:ring-[#86BC29]/50
                    `}>
                      <SelectValue placeholder="Sélectionnez le matériau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laine de verre">Laine de verre</SelectItem>
                      <SelectItem value="Polystyrène">Polystyrène</SelectItem>
                      <SelectItem value="Laine de roche">Laine de roche</SelectItem>
                      <SelectItem value="Chanvre">Chanvre</SelectItem>
                      <SelectItem value="Ouate de cellulose">Ouate de cellulose</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.interiorMaterial && (
                    <p className="text-sm text-red-500">Ce champ est requis</p>
                  )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className={
                        formErrors.interiorThickness ? "text-red-500 font-medium" : 
                        formData.interiorInsulation.thickness ? "text-[#86BC29] font-medium" : ""
                      }>
                        Épaisseur (cm)
                        {formErrors.interiorThickness && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {formData.interiorInsulation.thickness && !formErrors.interiorThickness && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-[#86BC29] flex-shrink-0"
                        >
                          <Check className="h-4 w-4" />
                        </motion.span>
                      )}
                    </div>
                    <BaseInput
                      type="number"
                      value={formData.interiorInsulation.thickness}
                      onChange={(e) => 
                        handleChange('interiorInsulation', {
                          ...formData.interiorInsulation,
                          thickness: e.target.value
                        })
                      }
                      placeholder="Ex: 10"
                      className={`transition-all duration-300
                        ${formErrors.interiorThickness ? 'ring-2 ring-red-500' : ''}
                        ${formData.interiorInsulation.thickness && !formErrors.interiorThickness ? 'ring-1 ring-[#86BC29]' : ''}
                        hover:ring-2 hover:ring-[#86BC29]/50
                      `}
                    />
                    {formErrors.interiorThickness && (
                      <p className="text-sm text-red-500">Ce champ est requis</p>
                    )}
                  </div>
              </div>
            )}
          </div>

          {/* Isolation extérieure */}
          <div className="space-y-2 col-span-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="exterior-isolation"
                checked={formData.exteriorInsulation.enabled}
                onCheckedChange={(checked) => 
                  handleChange('exteriorInsulation', {
                    ...formData.exteriorInsulation,
                    enabled: checked
                  })
                }
              />
              <Label htmlFor="exterior-isolation">
                Isolation extérieure
              </Label>
            </div>

            {formData.exteriorInsulation.enabled && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className={
                      formErrors.exteriorMaterial ? "text-red-500 font-medium" : 
                      formData.exteriorInsulation.material ? "text-[#86BC29] font-medium" : ""
                    }>
                      Matériau
                      {formErrors.exteriorMaterial && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {formData.exteriorInsulation.material && !formErrors.exteriorMaterial && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-[#86BC29] flex-shrink-0"
                      >
                        <Check className="h-4 w-4" />
                      </motion.span>
                    )}
                  </div>
                  <Select 
                    value={formData.exteriorInsulation.material}
                    onValueChange={(value) => 
                      handleChange('exteriorInsulation', {
                        ...formData.exteriorInsulation,
                        material: value
                      })
                    }
                  >
                    <SelectTrigger className={`
                      transition-all duration-300
                      ${formErrors.exteriorMaterial ? 'ring-2 ring-red-500 bg-red-50' : ''}
                      ${formData.exteriorInsulation.material && !formErrors.exteriorMaterial ? 'ring-1 ring-[#86BC29]' : ''}
                      hover:ring-2 hover:ring-[#86BC29]/50
                    `}>
                      <SelectValue placeholder="Sélectionnez le matériau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Polystyrène">Polystyrène</SelectItem>
                      <SelectItem value="Laine de roche">Laine de roche</SelectItem>
                      <SelectItem value="Fibres de bois">Fibres de bois</SelectItem>
                      <SelectItem value="Liège">Liège</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.exteriorMaterial && (
                    <p className="text-sm text-red-500">Ce champ est requis</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className={
                      formErrors.exteriorThickness ? "text-red-500 font-medium" : 
                      formData.exteriorInsulation.thickness ? "text-[#86BC29] font-medium" : ""
                    }>
                      Épaisseur (cm)
                      {formErrors.exteriorThickness && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {formData.exteriorInsulation.thickness && !formErrors.exteriorThickness && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-[#86BC29] flex-shrink-0"
                      >
                        <Check className="h-4 w-4" />
                      </motion.span>
                    )}
                  </div>
                  <BaseInput
                    type="number"
                    value={formData.exteriorInsulation.thickness}
                    onChange={(e) => 
                      handleChange('exteriorInsulation', {
                        ...formData.exteriorInsulation,
                        thickness: e.target.value
                      })
                    }
                    placeholder="Ex: 10"
                    className={`transition-all duration-300
                      ${formErrors.exteriorThickness ? 'ring-2 ring-red-500' : ''}
                      ${formData.exteriorInsulation.thickness && !formErrors.exteriorThickness ? 'ring-1 ring-[#86BC29]' : ''}
                      hover:ring-2 hover:ring-[#86BC29]/50
                    `}
                  />
                  {formErrors.exteriorThickness && (
                    <p className="text-sm text-red-500">Ce champ est requis</p>
                  )}
                </div>
              </div>
            )}
          </div>

                  {/* Isolation des combles */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className={
                formErrors.atticInsulation ? "text-red-500 font-medium" : 
                formData.atticInsulation ? "text-[#86BC29] font-medium" : ""
              }>
                Isolation des combles
                {formErrors.atticInsulation && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {formData.atticInsulation && !formErrors.atticInsulation && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[#86BC29] flex-shrink-0"
                >
                  <Check className="h-4 w-4" />
                </motion.span>
              )}
            </div>
            <Select 
              value={formData.atticInsulation}
              onValueChange={(value) => handleChange('atticInsulation', value)}
            >
              <SelectTrigger className={`
                transition-all duration-300
                ${formErrors.atticInsulation ? 'ring-2 ring-red-500 bg-red-50' : ''}
                ${formData.atticInsulation && !formErrors.atticInsulation ? 'ring-1 ring-[#86BC29]' : ''}
                hover:ring-2 hover:ring-[#86BC29]/50
              `}>
                <SelectValue placeholder="Sélectionnez l'isolation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Isolé - Laine de verre">Isolé - Laine de verre</SelectItem>
                <SelectItem value="Isolé - Laine de roche">Isolé - Laine de roche</SelectItem>
                <SelectItem value="Isolé - Soufflé">Isolé - Soufflé</SelectItem>
                <SelectItem value="Pas isolé">Pas isolé</SelectItem>
                <SelectItem value="Aménagé">Aménagé</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.atticInsulation && (
              <p className="text-sm text-red-500">Ce champ est requis</p>
            )}
          </div>

          {/* Isolation des étages */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className={
                formErrors.floorInsulation ? "text-red-500 font-medium" : 
                formData.floorInsulation ? "text-[#86BC29] font-medium" : ""
              }>
                Isolation des étages
                {formErrors.floorInsulation && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {formData.floorInsulation && !formErrors.floorInsulation && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[#86BC29] flex-shrink-0"
                >
                  <Check className="h-4 w-4" />
                </motion.span>
              )}
            </div>
            <Select 
              value={formData.floorInsulation}
              onValueChange={(value) => handleChange('floorInsulation', value)}
            >
              <SelectTrigger className={`
                transition-all duration-300
                ${formErrors.floorInsulation ? 'ring-2 ring-red-500 bg-red-50' : ''}
                ${formData.floorInsulation && !formErrors.floorInsulation ? 'ring-1 ring-[#86BC29]' : ''}
                hover:ring-2 hover:ring-[#86BC29]/50
              `}>
                <SelectValue placeholder="Sélectionnez l'isolation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pas isolée">Pas isolée</SelectItem>
                <SelectItem value="Isolé - Laine de verre">Isolé - Laine de verre</SelectItem>
                <SelectItem value="Isolé - Laine de roche">Isolé - Laine de roche</SelectItem>
                <SelectItem value="Isolé - Soufflé">Isolé - Soufflé</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.floorInsulation && (
              <p className="text-sm text-red-500">Ce champ est requis</p>
            )}
          </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
              {/* Section 2 - Façade bâtiment */}
              <motion.div variants={fadeInUp} className="space-y-4">
                <motion.h3 
                  variants={subtitleVariants}
                  className="text-2xl sm:text-3xl font-semibold text-[#86BC29] border-b-2 border-[#86BC29] pb-2"
                >
                  2 - Façade bâtiment
                </motion.h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectWithAnimation
                    label="Surface de vitrage"
                    value={formData.windowSurface}
                    onValueChange={(value) => handleChange('windowSurface', value)}
                    error={formErrors.windowSurface}
                    required
                  >
                    <SelectItem value="10">Faible (10%)</SelectItem>
                    <SelectItem value="15">Normal (15%)</SelectItem>
                    <SelectItem value="20">Élevée (20%)</SelectItem>
                    <SelectItem value="25">Très élevée (25%)</SelectItem>
                  </SelectWithAnimation>

                  <SelectWithAnimation
                    label="Mitoyenneté"
                    value={formData.adjacency}
                    onValueChange={(value) => handleChange('adjacency', value)}
                    error={formErrors.adjacency}
                    required
                  >
                    <SelectItem value="Non">Non</SelectItem>
                    <SelectItem value="1 côté">1 côté</SelectItem>
                    <SelectItem value="2 côtés">2 côtés</SelectItem>
                  </SelectWithAnimation>

                  <SelectWithAnimation
                    label="Type de vitrage"
                    value={formData.windowType}
                    onValueChange={(value) => handleChange('windowType', value)}
                    error={formErrors.windowType}
                    required
                  >
                    <SelectItem value="SV Métal">SV Métal</SelectItem>
                    <SelectItem value="SV Bois/PVC">SV Bois/PVC</SelectItem>
                    <SelectItem value="DV Métal">DV Métal</SelectItem>
                    <SelectItem value="DV Bois/PVC">DV Bois/PVC</SelectItem>
                    <SelectItem value="DV Argon">DV Argon</SelectItem>
                    <SelectItem value="DV VIR">DV VIR</SelectItem>
                    <SelectItem value="DV RT2012">DV RT2012</SelectItem>
                  </SelectWithAnimation>

                  <SelectWithAnimation
                    label="Orientation principale"
                    value={formData.mainOrientation}
                    onValueChange={(value) => handleChange('mainOrientation', value)}
                    error={formErrors.mainOrientation}
                    required
                  >
                    <SelectItem value="Nord">Nord</SelectItem>
                    <SelectItem value="Sud">Sud</SelectItem>
                    <SelectItem value="Est">Est</SelectItem>
                    <SelectItem value="Ouest">Ouest</SelectItem>
                  </SelectWithAnimation>
                </div>
              </motion.div>

              {/* Section 3 - Autre */}
              <motion.div variants={fadeInUp} className="space-y-4">
                <motion.h3 
                  variants={subtitleVariants}
                  className="text-2xl sm:text-3xl font-semibold text-[#86BC29] border-b-2 border-[#86BC29] pb-2"
                >
                  3 - Autre
                </motion.h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectWithAnimation
                    label="Ventilation"
                    value={formData.ventilation}
                    onValueChange={(value) => handleChange('ventilation', value)}
                    error={formErrors.ventilation}
                    required
                  >
                    <SelectItem value="Ventilation naturelle">Ventilation naturelle</SelectItem>
                    <SelectItem value="VMC simple flux">VMC simple flux</SelectItem>
                    <SelectItem value="VMC hygro">VMC hygro</SelectItem>
                    <SelectItem value="Double flux">Double flux</SelectItem>
                  </SelectWithAnimation>

                  <SelectWithAnimation
                    label="Température de chauffage"
                    value={formData.heatingTemp}
                    onValueChange={(value) => handleChange('heatingTemp', value)}
                    error={formErrors.heatingTemp}
                    required
                  >
                    {[18, 19, 20, 21, 22].map(temp => (
                      <SelectItem key={temp} value={temp.toString()}>
                        {temp} °C
                      </SelectItem>
                    ))}
                  </SelectWithAnimation>

                  <Input
                    label="Département"
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    placeholder="Ex: 26"
                    error={formErrors.department}
                    required
                  />
                </div>
              </motion.div>

              {/* Conditions d'utilisation et bouton de calcul suivent dans la dernière partie... */}
              <motion.div variants={fadeInUp} className="space-y-2 mt-6">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => handleChange('termsAccepted', checked)}
                    className="mt-1" 
                  />
                  <div className="flex flex-wrap items-center space-x-1">
                    <Label htmlFor="terms" className="text-sm sm:text-base">
                      J'accepte les
                    </Label>
                    <a 
                      href="/assets/img/CU.pdf" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm sm:text-base text-[#585858] hover:text-[#000000] underline underline-offset-2"
                    >
                      conditions d'utilisation
                    </a>
                  </div>
                </div>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="mt-6 sm:mt-8"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  className="w-full bg-[#86BC29] hover:bg-[#75a625] text-white py-2 sm:py-3 text-sm sm:text-base font-medium rounded-lg shadow transition-all duration-200"
                  onClick={handleCalculate}
                  disabled={!formData.termsAccepted}
                >
                  <Calculator className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Calculer les déperditions
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Affichage du résultat */}
        <AnimatePresence>
          {result && (
            <motion.div 
              ref={resultRef}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={resultCardVariants}
              className="mt-8 bg-gradient-to-r from-[#86BC29]/20 to-[#75a625]/10 rounded-lg p-4 sm:p-6 border border-[#86BC29]/20"
            >
              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-[#86BC29]">Résultat du calcul</h3>
                <p className="text-gray-600 text-sm sm:text-base mt-1">
                  Voici les déperditions thermiques estimées pour votre bâtiment
                </p>
              </div>
              
              <div className="flex flex-col items-center justify-center gap-4 sm:gap-8 mb-6">
                <motion.div 
                  className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border-2 border-[#86BC29] flex items-center justify-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <span className="text-5xl sm:text-6xl font-bold text-[#86BC29]">
                    {result.totalLoss.toFixed(1)}
                    <span className="text-3xl sm:text-4xl ml-1">kW</span>
                  </span>
                </motion.div>
                
                <div className="text-center w-full max-w-2xl">
                  <p className="text-sm sm:text-base text-gray-600">
                    Cette valeur représente la <span className="font-semibold">puissance nécessaire</span> pour 
                    chauffer votre bâtiment.
                  </p>
                  
                  {/* Commentaire automatique sur les résultats */}
                  {result.details && (
                    <motion.div 
                      className="mt-4 p-4 bg-[#f8f9fa] rounded-lg border border-gray-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      {(() => {
                        // Trouver le poste avec le plus de déperditions
                        const details = result.details;
                        const items = [
                          { name: 'Murs', value: details.wallLoss, key: 'wallLoss', percentage: 0 },
                          { name: 'Fenêtres', value: details.windowLoss, key: 'windowLoss', percentage: 0 },
                          { name: 'Toit', value: details.roofLoss, key: 'roofLoss', percentage: 0 },
                          { name: 'Sol', value: details.floorLoss, key: 'floorLoss', percentage: 0 },
                          { name: 'Ventilation', value: details.airLoss, key: 'airLoss', percentage: 0 },
                          { name: 'Ponts thermiques', value: details.thermalBridge, key: 'thermalBridge', percentage: 0 }
                        ];
                        
                        // Trier par valeur décroissante
                        items.sort((a, b) => b.value - a.value);
                        
                        // Calculer le pourcentage de chaque poste
                        const total = items.reduce((acc, item) => acc + item.value, 0);
                        items.forEach(item => {
                          item.percentage = (item.value / total) * 100;
                        });
                        
                        const highestLoss = items[0];
                        const secondHighest = items[1];
                        
                        return (
                          <div className="space-y-2 text-sm sm:text-base">
                            <p className="font-medium">
                              {(() => {
                                // Adapter l'article et le texte en fonction du nom
                                const masculins = ['Toit', 'Sol'];
                                const pluriels = ['Murs', 'Ponts thermiques', 'Fenêtres'];
                                const getArticle = (name: string): string => {
                                  if (pluriels.includes(name)) {
                                    return "Les ";
                                  } else if (masculins.includes(name)) {
                                    return "Le ";
                                  } else {
                                    return "La ";
                                  }
                                };
                                
                                // Texte adapté avec l'article correct
                                const article = getArticle(highestLoss.name);
                                const nomMinuscule = highestLoss.name.charAt(0).toLowerCase() + highestLoss.name.slice(1);
                                
                                return (
                                  <>{article}<span className="text-[#86BC29] font-bold">{nomMinuscule}</span> {pluriels.includes(highestLoss.name) ? "représentent" : "représente"} votre principale source de déperdition avec 
                                  <span className="font-bold"> {highestLoss.percentage.toFixed(0)}%</span> des pertes totales.</>
                                );
                              })()}
                            </p>
                            
                            {highestLoss.key === 'wallLoss' && (
                              <p>Envisagez d'améliorer l'isolation de vos murs pour réduire considérablement vos besoins énergétiques.</p>
                            )}
                            {highestLoss.key === 'windowLoss' && (
                              <p>Le remplacement par des fenêtres à double ou triple vitrage permettrait de réduire significativement ces déperditions.</p>
                            )}
                            {highestLoss.key === 'roofLoss' && (
                              <p>Renforcer l'isolation de votre toiture pourrait diminuer considérablement votre consommation énergétique.</p>
                            )}
                            {highestLoss.key === 'floorLoss' && (
                              <p>L'amélioration de l'isolation du sol permettrait de réduire cette source importante de déperdition.</p>
                            )}
                            {highestLoss.key === 'airLoss' && (
                              <p>L'installation d'un système de ventilation à récupération de chaleur pourrait diminuer ces pertes tout en maintenant une bonne qualité d'air intérieur.</p>
                            )}
                            {highestLoss.key === 'thermalBridge' && (
                              <p>Traiter les ponts thermiques de votre bâtiment permettrait de réduire significativement ces déperditions.</p>
                            )}
                            
                            <p className="mt-2">
                              {(() => {
                                // Adapter la transition en fonction du composant secondaire
                                const avecPluriel = ['Murs', 'Ponts thermiques', 'Fenêtres'];
                                const avecMasculin = ['Toit', 'Sol'];
                                const getPreposition = (name: string): string => {
                                  if (avecPluriel.includes(name)) {
                                    return "aux ";
                                  } else if (avecMasculin.includes(name)) {
                                    return "au ";
                                  } else {
                                    return "à la ";
                                  }
                                };
                                
                                const preposition = getPreposition(secondHighest.name);
                                const nomComplet = secondHighest.name.toLowerCase();
                                
                                return (
                                  <>Une attention particulière portée {preposition}<span className="text-[#86BC29] font-medium">{nomComplet}</span> ({secondHighest.percentage.toFixed(0)}%) 
                                  permettrait également d'améliorer l'efficacité énergétique de votre bâtiment.</>
                                );
                              })()}
                            </p>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </div>
              </div>
              
              {result.details && (
                <div className="mt-4 space-y-4">
                  <div className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Détail des déperditions:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm sm:text-base">
                    {(() => {
                      // Calculer le poste avec le plus de déperditions pour le mettre en évidence
                      const details = result.details;
                      const items = [
                        { name: 'Murs', value: details.wallLoss, key: 'wallLoss', percentage: 0 },
                        { name: 'Fenêtres', value: details.windowLoss, key: 'windowLoss', percentage: 0 },
                        { name: 'Toit', value: details.roofLoss, key: 'roofLoss', percentage: 0 },
                        { name: 'Sol', value: details.floorLoss, key: 'floorLoss', percentage: 0 },
                        { name: 'Ventilation', value: details.airLoss, key: 'airLoss', percentage: 0 },
                        { name: 'Ponts thermiques', value: details.thermalBridge, key: 'thermalBridge', percentage: 0 }
                      ];
                      
                      // Trouver la valeur maximale
                      const maxValue = Math.max(...items.map(item => item.value));
                      
                      return items.map(item => (
                        <div 
                          key={item.key}
                          className={`${
                            item.value === maxValue 
                              ? 'bg-[#86BC29]/10 border-[#86BC29] shadow-md' 
                              : 'bg-white border-gray-200'
                          } p-3 rounded-lg shadow-sm border transition-all duration-300 hover:shadow-md`}
                        >
                          <div className="font-medium text-gray-700">{item.name}</div>
                          <div className={`font-semibold ${
                            item.value === maxValue ? 'text-[#86BC29] text-lg' : 'text-[#86BC29]'
                          }`}>
                            {item.value.toFixed(1)} <span className="text-sm">kW</span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  </motion.div>
  <AnimatePresence>
    {result && (
      <motion.div
        className="mt-6 sm:mt-8"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          onClick={() => router.push('/protected/dimensionnement/methode')}
          className="w-full bg-[#86BC29] hover:bg-[#75a625] text-white py-2 sm:py-3 text-sm sm:text-base font-medium rounded-lg shadow transition-all duration-200"
        >
          <ArrowRight className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Continuer vers le choix de la méthode
        </Button>
      </motion.div>
    )}
  </AnimatePresence>
  </>
);
}