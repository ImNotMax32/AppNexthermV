'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface FormErrors {
  [key: string]: boolean;
}

// Types
interface SelectWithAnimationProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  error?: boolean;
  required?: boolean;
}

interface HeatingMethodFormData {
  heatPumpType: string;
  heatPumpSystem: string;
  emitterType: string;
  emitterTemperature: string;
  captorType: string;
  waterTable: string;
  captorFilling: string;
  aerothermySupport: string;
  poolKit: string;
  freecoolingKit: string;
  hotWater: string;
}

// Animations variants
const fadeInUp = {
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
const containerVariants = {
  hidden: { 
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const titleVariants = {
  hidden: { 
    opacity: 0,
    x: -20
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

const pulseVariants = {
  idle: {
    scale: 1,
    opacity: 0.8
  },
  hover: {
    scale: 1.05,
    opacity: 1,
    transition: {
      duration: 0.3,
      yoyo: Infinity
    }
  },
  selected: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.2
    }
  }
};

const selectValueVariants = {
  filled: {
    y: [0, -10, 0],
    transition: { duration: 0.2 }
  },
  empty: {
    y: 0
  }
};

// SelectWithAnimation component
const SelectWithAnimation: React.FC<SelectWithAnimationProps> = ({ 
  label, 
  value, 
  onValueChange, 
  children,
  error = false,
  required = false
 }) => {
  const hasValue = value && value !== '';
  
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
            initial="empty"
            animate={hasValue ? "filled" : "empty"}
            variants={selectValueVariants}
          >
            <SelectValue placeholder={`Sélectionnez ${label.toLowerCase()}`} />
          </motion.div>
        </SelectTrigger>
        <SelectContent>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
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

export default function HeatingMethodPage() {
  const [formData, setFormData] = useState<HeatingMethodFormData>({
    heatPumpType: '',
    heatPumpSystem: '',
    emitterType: '',
    emitterTemperature: '',
    captorType: '',
    waterTable: '',
    captorFilling: '',
    aerothermySupport: '',
    poolKit: '',
    freecoolingKit: '',
    hotWater: ''
  });
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/sign-in');
      }
    };
    checkAuth();
  }, []);


  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    // Validation de base pour tous les types
    if (!formData.heatPumpType) errors.heatPumpType = true;
    if (!formData.heatPumpSystem) errors.heatPumpSystem = true;
    if (!formData.emitterType) errors.emitterType = true;
    if (!formData.emitterTemperature) errors.emitterTemperature = true;
    if (!formData.poolKit) errors.poolKit = true;
    if (!formData.freecoolingKit) errors.freecoolingKit = true;
    if (!formData.hotWater) errors.hotWater = true;
  
    // Validation spécifique pour la géothermie
    if (formData.heatPumpType === 'Géothermie') {
      // Validation du type de capteur toujours requise pour la géothermie
      if (!formData.captorType) errors.captorType = true;
      
      // Validation de l'eau de nappe uniquement si le capteur est vertical
      if (formData.captorType === 'Vertical') {
        if (!formData.waterTable) errors.waterTable = true;
      }
    }
  
    // Validation spécifique pour l'aérothermie
    if (formData.heatPumpType === 'Aérothermie') {
      if (!formData.aerothermySupport) errors.aerothermySupport = true;
    }
  
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // La fonction handleNext reste la même
  const handleNext = () => {
    if (validateForm()) {
      router.push('/protected/dimensionnement/resume');
    } else {
      // Scroll to first error if any
      const firstErrorElement = document.querySelector('[data-error="true"]');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  const handleChange = (field: keyof HeatingMethodFormData, value: string) => {
    // Mise à jour du state avec réinitialisation des champs dépendants
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Réinitialisation des champs dépendants lors du changement de type de PAC
      if (field === 'heatPumpType') {
        // Si le type est Aérothermie, définir automatiquement le système à Air/Eau
        if (value === 'Aérothermie') {
          newData.heatPumpSystem = 'Air/Eau';
        } else {
          newData.heatPumpSystem = '';
        }
        newData.captorType = '';
        newData.waterTable = '';
        newData.captorFilling = '';
        newData.aerothermySupport = '';
      }
      
      // Réinitialisation des champs dépendants lors du changement de type de capteur
      if (field === 'captorType') {
        newData.waterTable = '';
        newData.captorFilling = '';
      }
      
      // Réinitialisation de la température lors du changement de type d'émetteur
      if (field === 'emitterType') {
        newData.emitterTemperature = '';
      }
      
      return newData;
    });
  
    // Sauvegarde dans localStorage avec gestion des cas spécifiques
    switch(field) {
      case 'heatPumpType':
        localStorage.setItem('type_pac', value);
        // Nettoyer les valeurs liées dans le localStorage
        if (value === 'Aérothermie') {
          localStorage.setItem('systeme_pac', 'Air/Eau');
        } else {
          localStorage.removeItem('systeme_pac');
        }
        localStorage.removeItem('capteur_type');
        localStorage.removeItem('eau_nappe');
        localStorage.removeItem('support_aerothermie');
        break;
  
      case 'heatPumpSystem':
        localStorage.setItem('systeme_pac', value);
        break;
  
      case 'emitterType':
        localStorage.setItem('emetteur_type', value);
        // Nettoyer la température dans le localStorage
        localStorage.removeItem('temp_radiateur');
        localStorage.removeItem('temp_plancher');
        break;
  
      case 'emitterTemperature':
        if (formData.emitterType === 'Radiateur') {
          localStorage.setItem('temp_radiateur', value);
        } else {
          localStorage.setItem('temp_plancher', value);
        }
        break;
  
      case 'captorType':
        localStorage.setItem('capteur_type', value);
        // Nettoyer les valeurs liées dans le localStorage
        localStorage.removeItem('eau_nappe');
        break;
  
      case 'waterTable':
        localStorage.setItem('eau_nappe', value);
        break;
  
      case 'aerothermySupport':
        localStorage.setItem('support_aerothermie', value);
        break;
  
      case 'poolKit':
        localStorage.setItem('kit_piscine', value);
        break;
  
      case 'freecoolingKit':
        localStorage.setItem('kit_freecooling', value);
        break;
  
      case 'hotWater':
        localStorage.setItem('kit_ECS', value);
        break;
    }
  
    // Effacer les erreurs pour le champ modifié
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  useEffect(() => {
    const loadFromLocalStorage = () => {
      const keys = [
        'type_pac',
        'systeme_pac',
        'emetteur_type',
        'temp_radiateur',
        'temp_plancher',
        'kit_piscine',
        'kit_freecooling',
        'kit_ECS'
      ];
  
      const savedData: any = {};
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          savedData[key] = value;
        }
      });
  
      if (Object.keys(savedData).length > 0) {
        setFormData(prev => ({
          ...prev,
          ...savedData
        }));
      }
    };
  
    loadFromLocalStorage();
  }, []);

  const isGeothermal = formData.heatPumpType === 'Géothermie';
  const router = useRouter();
  return (
    <motion.div 
      className="max-w-6xl mx-auto p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="text-center mb-8"
        variants={titleVariants}
      >
        <motion.h1 
          className="text-3xl font-bold text-[#86BC29] mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
        >
          Méthode de chauffage
        </motion.h1>
        <motion.div 
          className="text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Étape 2/4
        </motion.div>
      </motion.div>
  
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {/* Card 1: Système de chauffage */}
        <motion.div variants={cardVariants}>
          <Card className="overflow-hidden">
            <motion.div
              whileHover={{ backgroundColor: "rgba(134, 188, 41, 0.05)" }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader>
                <CardTitle className="text-[#86BC29]">Système de chauffage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <SelectWithAnimation
                  label="Type de pompe à chaleur"
                  value={formData.heatPumpType}
                  onValueChange={(value) => handleChange('heatPumpType', value)}
                  error={formErrors.heatPumpType}
                  required
                >
                  <SelectItem value="Géothermie">Géothermie</SelectItem>
                  <SelectItem value="Aérothermie">Aérothermie</SelectItem>
                </SelectWithAnimation>
  
                <SelectWithAnimation
                  label="Système de PAC"
                  value={formData.heatPumpSystem}
                  onValueChange={(value) => handleChange('heatPumpSystem', value)}
                  error={formErrors.heatPumpSystem}
                  required
                >
                  {formData.heatPumpType === 'Aérothermie' ? (
                    <SelectItem value="Air/Eau">Air/Eau</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="Eau/Eau">Eau/Eau</SelectItem>
                      <SelectItem value="Sol/Sol">Sol/Sol</SelectItem>
                      <SelectItem value="Sol/Eau">Sol/Eau</SelectItem>
                      <SelectItem value="Eau glycolée/Sol">Eau glycolée/Sol</SelectItem>
                    </>
                  )}
                </SelectWithAnimation>
  
                <div className="space-y-4">
                  <Label className={`font-medium ${formErrors.emitterType ? 'text-red-500' : ''}`}>
                    Type d'émetteur
                    {formErrors.emitterType && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      whileHover="hover"
                      animate={formData.emitterType === 'Radiateur' ? 'selected' : 'idle'}
                      variants={pulseVariants}
                    >
                      <Button
                        variant={formData.emitterType === 'Radiateur' ? 'default' : 'outline'}
                        className={`w-full flex flex-col items-center p-4 h-auto
                          ${formData.emitterType === 'Radiateur' 
                            ? 'bg-[#86BC29] hover:bg-[#75a625] text-white' 
                            : 'hover:border-[#86BC29] hover:text-[#86BC29]'}
                          ${formErrors.emitterType ? 'border-red-500 bg-red-50' : ''}`}
                        onClick={() => handleChange('emitterType', 'Radiateur')}
                      >
                        <motion.div 
                          className="h-16 w-16 mb-2 flex items-center justify-center"
                          whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          <img 
                            src="/assets/img/heating.png" 
                            alt="Radiateur" 
                            className="w-12 h-12 object-contain"
                          />
                        </motion.div>
                        <span className="text-sm">Radiateur</span>
                      </Button>
                    </motion.div>
  
                    <motion.div
                      whileHover="hover"
                      animate={formData.emitterType === 'Plancher' ? 'selected' : 'idle'}
                      variants={pulseVariants}
                    >
                      <Button
                        variant={formData.emitterType === 'Plancher' ? 'default' : 'outline'}
                        className={`w-full flex flex-col items-center p-4 h-auto
                          ${formData.emitterType === 'Plancher' 
                            ? 'bg-[#86BC29] hover:bg-[#75a625] text-white' 
                            : 'hover:border-[#86BC29] hover:text-[#86BC29]'}
                          ${formErrors.emitterType ? 'border-red-500 bg-red-50' : ''}`}
                        onClick={() => handleChange('emitterType', 'Plancher')}
                      >
                        <motion.div 
                          className="h-16 w-16 mb-2 flex items-center justify-center"
                          whileHover={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 0.5 }}
                        >
                          <img 
                            src="/assets/img/heatfloor.png" 
                            alt="Plancher" 
                            className="w-12 h-12 object-contain"
                          />
                        </motion.div>
                        <span className="text-sm">Plancher</span>
                      </Button>
                    </motion.div>
                  </div>
                  {formErrors.emitterType && (
                    <p className="text-sm text-red-500">Veuillez sélectionner un type d'émetteur</p>
                  )}
                </div>
  
                {formData.emitterType && (
                  <SelectWithAnimation
                    label="Température"
                    value={formData.emitterTemperature}
                    onValueChange={(value) => handleChange('emitterTemperature', value)}
                    error={formErrors.emitterTemperature}
                    required
                  >
                    {formData.emitterType === 'Radiateur' ? (
                      <>
                        <SelectItem value="40">40°</SelectItem>
                        <SelectItem value="45">45°</SelectItem>
                        <SelectItem value="50">50°</SelectItem>
                        <SelectItem value="55">55°</SelectItem>
                        <SelectItem value="60">60°</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="30">30°</SelectItem>
                        <SelectItem value="35">35°</SelectItem>
                        <SelectItem value="40">40°</SelectItem>
                        <SelectItem value="45">45°</SelectItem>
                      </>
                    )}
                  </SelectWithAnimation>
                )}
              </CardContent>
            </motion.div>
          </Card>
        </motion.div>
  
        {/* Card 2: Accessoires spécifiques */}
        <motion.div variants={cardVariants}>
          <Card className="overflow-hidden">
            <motion.div
              whileHover={{ backgroundColor: "rgba(134, 188, 41, 0.05)" }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader>
                <CardTitle className="text-[#86BC29]">
                  {isGeothermal ? 'Accessoires Géothermie' : 'Accessoires Aérothermie'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
              {isGeothermal ? (
                  <>
                    <SelectWithAnimation
                      label="Type de capteur"
                      value={formData.captorType}
                      onValueChange={(value) => handleChange('captorType', value)}
                      error={formErrors.captorType}
                      required
                    >
                      <SelectItem value="Horizontal">Horizontal</SelectItem>
                      <SelectItem value="Vertical">Vertical</SelectItem>
                    </SelectWithAnimation>

                    {/* Afficher l'option "Eau de nappe" uniquement si le capteur est vertical */}
                    {formData.captorType === 'Vertical' && (
                      <SelectWithAnimation
                        label="Eau de nappe"
                        value={formData.waterTable}
                        onValueChange={(value) => handleChange('waterTable', value)}
                        error={formErrors.waterTable}
                        required
                      >
                        <SelectItem value="Oui">Oui</SelectItem>
                        <SelectItem value="Non">Non</SelectItem>
                      </SelectWithAnimation>
                    )}
                  </>
                ) : (
                  <SelectWithAnimation
                    label="Support"
                    value={formData.aerothermySupport}
                    onValueChange={(value) => handleChange('aerothermySupport', value)}
                    error={formErrors.aerothermySupport}
                    required
                  >
                    <SelectItem value="Support muraux">Support muraux</SelectItem>
                    <SelectItem value="Support sol">Support sol</SelectItem>
                    <SelectItem value="Sans support">Sans support</SelectItem>
                  </SelectWithAnimation>
  )}
              </CardContent>
            </motion.div>
          </Card>
        </motion.div>
  
        {/* Card 3: Options */}
        <motion.div variants={cardVariants}>
          <Card className="overflow-hidden">
            <motion.div
              whileHover={{ backgroundColor: "rgba(134, 188, 41, 0.05)" }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader>
                <CardTitle className="text-[#86BC29]">Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <SelectWithAnimation
                  label="Kit Piscine"
                  value={formData.poolKit}
                  onValueChange={(value) => handleChange('poolKit', value)}
                  error={formErrors.poolKit}
                  required
                >
                  <SelectItem value="Oui">Oui</SelectItem>
                  <SelectItem value="Non">Non</SelectItem>
                </SelectWithAnimation>
  
                <SelectWithAnimation
                  label="Kit freecooling"
                  value={formData.freecoolingKit}
                  onValueChange={(value) => handleChange('freecoolingKit', value)}
                  error={formErrors.freecoolingKit}
                  required
                >
                  <SelectItem value="Oui">Oui</SelectItem>
                  <SelectItem value="Non">Non</SelectItem>
                </SelectWithAnimation>
  
                <SelectWithAnimation
                  label="ECS (Eau Chaude Sanitaire)"
                  value={formData.hotWater}
                  onValueChange={(value) => handleChange('hotWater', value)}
                  error={formErrors.hotWater}
                  required
                >
                  <SelectItem value="Oui">Oui</SelectItem>
                  <SelectItem value="Non">Non</SelectItem>
                </SelectWithAnimation>
  
                <div className="flex flex-col gap-4 pt-4">
                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    <Button 
                      variant="outline" 
                      className="w-full text-[#86BC29] border-[#86BC29] hover:bg-[#86BC29] hover:text-white"
                      onClick={() => router.push('/protected/dimensionnement')}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Étape précédente
                    </Button>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                  >
                    <Button 
                      className="w-full bg-[#86BC29] hover:bg-[#75a625] text-white"
                      onClick={handleNext}
                    >
                      Étape suivante
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </motion.div>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  )};