"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import SignaturePad from "@/components/SignaturePad";
import { Check, X, Pen, Activity, ChevronDown, ChevronUp, FileText, Gauge, Thermometer, Zap, Droplets, Settings } from "lucide-react";
import { Progress } from "../../../components/ui/progress";

interface FicheMiseEnServiceData {
  // En-tête
  type: string;
  modele: string;
  numeroSerie: string;
  generateur: string;
  generateurAutre: string;
  
  // Adresse installation
  nomPrenom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  nombreEtages: string;
  
  // Surfaces dynamiques pour les étages
  [key: `surfaceEtage${number}`]: string;
  
  // Surfaces et application
  surfaceRDC: string;
  plancherChauffant: boolean;
  radiateurs: boolean;
  ventiloConvecteurs: boolean;
  ballonTampon: string; // "Oui" ou "Non"
  ballonTamponOui: boolean;
  ballonTamponNon: boolean;
  ballonTamponVolume: string;
  pompePosition: string; // "Intérieur" ou "Extérieur"
  pompeType: string; // "Neuf" ou "Rénovation"
  ancienGaz: string;
  
  // Paramètres hydrauliques
  distanceLiaisons: string;
  diametreLiaisons: string;
  tempDepartEauChauffage: string;
  tempRetourEauChauffage: string;
  tempDepartEauFroide: string;
  tempRetourEauFroide: string;
  pressionRemplissage: string;
  
  // Kit ECS
  kitECS170: boolean;
  kitECS270: boolean;
  kitECSAutre: boolean;
  kitECSAutreTexte: string;
  pacReversible: string; // "Oui" ou "Non"
  tauxMonopropyleneGlycol: string;
  
  // Paramètres capteur
  typeCapteur: string; // "Tranchées", "Horizontal", "Vertical", "Eau de nappe"
  nombreBouclesCapteur: string;
  surfaceCapteur: string;
  longueurCapteur: string;
  diameterCapteur: string;
  tempAllerEauGlycolee: string;
  tempRetourEauGlycolee: string;
  tempAllerEauNappe: string;
  tempRetourEauNappe: string;
  typeCharge: string; // "R410a" ou "R32"
  chargeKg: string;
  tauxMonopropylene: string;
  
  // Paramètres électriques
  longueurAlimentation: string;
  tensionFonctionnement: string;
  intensiteAbsorbee: string;
  verificationCycle: string;
  
  // Paramètres frigorifiques
  pressionBP: string;
  pressionBPTemp: string;
  pressionHP: string;
  pressionHPTemp: string;
  tempAspiration: string;
  tempLiquide: string;
  surchauffe: string;
  sousRefroidissement: string;
  tempRefoulement: string;
  
  // Installateur
  nomSociete: string;
  dateInstallation: string;
  nomTechnicien: string;
  telephoneTechnicien: string;
  etudeThermique: string;
  realisePar1: string;
  etudeTechnique: string;
  realisePar2: string;
  contratEntretien: string; // "Oui" ou "Non"
  signature: string;
}

export default function FicheMiseEnServicePage() {
  const signatureRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // État pour gérer les sections repliées/dépliées
  const [expandedSections, setExpandedSections] = useState({
    typePac: true, // Toujours déplié
    adresse: true,
    hydraulique: false,
    capteur: false,
    electrique: false,
    frigorifique: false,
    installateur: false
  });
  
  // Fonction pour basculer l'état d'une section
  const toggleSection = (section: keyof typeof expandedSections) => {
    if (section === 'typePac') return; // La section type PAC reste toujours dépliée
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const [formData, setFormData] = useState<FicheMiseEnServiceData>({
    type: "",
    modele: "",
    numeroSerie: "",
    generateur: "",
    generateurAutre: "",
    nomPrenom: "",
    adresse: "",
    codePostal: "",
    ville: "",
    nombreEtages: "",
    surfaceRDC: "",
    plancherChauffant: false,
    radiateurs: false,
    ventiloConvecteurs: false,
    ballonTampon: "",
    ballonTamponOui: false,
    ballonTamponNon: false,
    ballonTamponVolume: "",
    pompePosition: "",
    pompeType: "",
    ancienGaz: "",
    distanceLiaisons: "",
    diametreLiaisons: "",
    tempDepartEauChauffage: "",
    tempRetourEauChauffage: "",
    tempDepartEauFroide: "",
    tempRetourEauFroide: "",
    pressionRemplissage: "",
    kitECS170: false,
    kitECS270: false,
    kitECSAutre: false,
    kitECSAutreTexte: "",
    pacReversible: "",
    tauxMonopropyleneGlycol: "",
    typeCapteur: "",
    nombreBouclesCapteur: "",
    surfaceCapteur: "",
    longueurCapteur: "",
    diameterCapteur: "",
    tempAllerEauGlycolee: "",
    tempRetourEauGlycolee: "",
    tempAllerEauNappe: "",
    tempRetourEauNappe: "",
    typeCharge: "",
    chargeKg: "",
    tauxMonopropylene: "",
    longueurAlimentation: "",
    tensionFonctionnement: "",
    intensiteAbsorbee: "",
    verificationCycle: "",
    pressionBP: "",
    pressionBPTemp: "",
    pressionHP: "",
    pressionHPTemp: "",
    tempAspiration: "",
    tempLiquide: "",
    surchauffe: "",
    sousRefroidissement: "",
    tempRefoulement: "",
    nomSociete: "",
    dateInstallation: "",
    nomTechnicien: "",
    telephoneTechnicien: "",
    etudeThermique: "",
    realisePar1: "",
    etudeTechnique: "",
    realisePar2: "",
    contratEntretien: "",
    signature: "",
  });

  // Fonction pour calculer le pourcentage de remplissage du formulaire
  const calculateProgress = () => {
    const requiredFields = [
      formData.type,
      formData.modele,
      formData.numeroSerie,
      formData.nomPrenom,
      formData.adresse,
      formData.codePostal,
      formData.ville,
      formData.nombreEtages,
      formData.surfaceRDC,
      formData.distanceLiaisons,
      formData.diametreLiaisons,
      formData.tempDepartEauChauffage,
      formData.tempRetourEauChauffage,
      formData.pressionRemplissage,
      formData.pacReversible,
      formData.tauxMonopropyleneGlycol
    ];
    const filledFields = requiredFields.filter(field => field && field.toString().trim() !== '').length;
    return Math.round((filledFields / requiredFields.length) * 100);
  };
  
  const progressValue = calculateProgress();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signatureError, setSignatureError] = useState(false);
  
  // Agents commerciaux
  const agents = [
    { id: 'max1', name: 'Max 1', email: 'max.barrault@live.fr' },
    { id: 'max2', name: 'Max 2', email: 'mb.barrault@outlook.fr' }
  ];
  
  const [selectedAgent, setSelectedAgent] = useState('');
  const [copyToUser, setCopyToUser] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FicheMiseEnServiceData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Fonctions pour gérer les choix mutuellement exclusifs
  const handleTypeChange = (value: string) => {
    handleInputChange('type', value);
  };
  
  const handleModeleChange = (value: string) => {
    handleInputChange('modele', value);
  };
  
  const handleGenerateurChange = (value: string) => {
    handleInputChange('generateur', value);
  };
  
  const handleBallonTamponChange = (value: string) => {
    handleInputChange('ballonTampon', value);
  };
  
  const handlePompePositionChange = (value: string) => {
    handleInputChange('pompePosition', value);
  };
  
  const handlePompeTypeChange = (value: string) => {
    handleInputChange('pompeType', value);
  };
  
  // Gestion des checkboxes Kit ECS
  const handleKitECSChange = (type: 'kitECS170' | 'kitECS270' | 'kitECSAutre', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [type]: checked
    }));
  };
  
  const handleTypeCapteurChange = (value: string) => {
    handleInputChange('typeCapteur', value);
  };
  
  const handleTypeChargeChange = (value: string) => {
    handleInputChange('typeCharge', value);
  };
  
  const handleContratEntretienChange = (value: string) => {
    handleInputChange('contratEntretien', value);
  };

  const handleCheckboxChange = (field: keyof FicheMiseEnServiceData, value: boolean) => {
    handleInputChange(field, value);
  };
  
  const handleSignatureChange = (signatureData: string) => {
    handleInputChange('signature', signatureData);
    if (signatureData) {
      setSignatureError(false);
    }
  };

  // Fonctions pour gérer la signature
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!signatureRef.current) return;
    
    const canvas = signatureRef.current;
    const ctx = (canvas as any).getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    setSignatureError(false);
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    ctx.beginPath();
    ctx.moveTo(
      clientX - rect.left,
      clientY - rect.top
    );
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !signatureRef.current) return;
    
    const canvas = signatureRef.current;
    const ctx = (canvas as any).getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault(); // Empêcher le défilement sur mobile
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    ctx.lineTo(
      clientX - rect.left,
      clientY - rect.top
    );
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || !signatureRef.current) return;
    
    const canvas = signatureRef.current;
    const ctx = (canvas as any).getContext('2d');
    if (!ctx) return;
    
    ctx.closePath();
    setIsDrawing(false);
    
    // Sauvegarder la signature comme une image base64
    const signatureData = (canvas as any).toDataURL();
    handleInputChange('signature', signatureData);
  };

  const clearSignature = () => {
    if (!signatureRef.current) return;
    
    const canvas = signatureRef.current;
    const ctx = (canvas as any).getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleInputChange('signature', '');
  };

  // Initialiser le canvas de signature
  useEffect(() => {
    if (!signatureRef.current) return;
    
    const canvas = signatureRef.current;
    const ctx = (canvas as any).getContext('2d');
    if (!ctx) return;
    
    // Configurer le style du trait
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    
    // Ajuster la taille du canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const resizeCanvas = () => {
      const signatureData = (canvas as any).toDataURL();
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Restaurer le style
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000';
      
      // Restaurer l'image
      if (signatureData) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = signatureData;
      }
    };
    
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier si la signature est présente
    if (!formData.signature) {
      setSignatureError(true);
      toast.error("La signature est obligatoire pour soumettre le formulaire");
      return;
    }
    
    setIsModalOpen(true);
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAgent('');
  };
  
  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId);
  };
  
  const handleSendEmail = async () => {
    await sendEmail();
  };

  const sendEmail = async () => {
    if (!selectedAgent) {
      toast.error("Veuillez sélectionner un agent commercial");
      return;
    }

    if (copyToUser && !userEmail) {
      toast.error("Veuillez saisir votre email pour recevoir une copie");
      return;
    }

    try {
      const selectedAgentData = agents.find(agent => agent.id === selectedAgent);
      
      const response = await fetch('/api/send-commissioning-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          agentEmail: selectedAgentData?.email,
          agentName: selectedAgentData?.name,
          copyToUser,
          userEmail: copyToUser ? userEmail : null,
        }),
      });

      if (response.ok) {
        toast.success(`Fiche de mise en service envoyée avec succès à ${selectedAgentData?.name}!`);
        setIsModalOpen(false);
        setSelectedAgent('');
        setCopyToUser(false);
        setUserEmail('');
        // Reset form
        setFormData({
          type: "",
          modele: "",
          numeroSerie: "",
          generateur: "",
          generateurAutre: "",
          nomPrenom: "",
          adresse: "",
          codePostal: "",
          ville: "",
          nombreEtages: "",
          surfaceRDC: "",
          plancherChauffant: false,
          radiateurs: false,
          ventiloConvecteurs: false,
          ballonTampon: "",
          ballonTamponOui: false,
          ballonTamponNon: false,
          ballonTamponVolume: "",
          pompePosition: "",
          pompeType: "",
          ancienGaz: "",
          distanceLiaisons: "",
          diametreLiaisons: "",
          tempDepartEauChauffage: "",
          tempRetourEauChauffage: "",
          tempDepartEauFroide: "",
          tempRetourEauFroide: "",
          pressionRemplissage: "",
          kitECS170: false,
          kitECS270: false,
          kitECSAutre: false,
          kitECSAutreTexte: "",
          pacReversible: "",
          tauxMonopropyleneGlycol: "",
          typeCapteur: "",
          nombreBouclesCapteur: "",
          surfaceCapteur: "",
          longueurCapteur: "",
          diameterCapteur: "",
          tempAllerEauGlycolee: "",
          tempRetourEauGlycolee: "",
          tempAllerEauNappe: "",
          tempRetourEauNappe: "",
          typeCharge: "",
          chargeKg: "",
          tauxMonopropylene: "",
          longueurAlimentation: "",
          tensionFonctionnement: "",
          intensiteAbsorbee: "",
          verificationCycle: "",
          pressionBP: "",
          pressionBPTemp: "",
          pressionHP: "",
          pressionHPTemp: "",
          tempAspiration: "",
          tempLiquide: "",
          surchauffe: "",
          sousRefroidissement: "",
          tempRefoulement: "",
          nomSociete: "",
          dateInstallation: "",
          nomTechnicien: "",
          telephoneTechnicien: "",
          etudeThermique: "",
          realisePar1: "",
          etudeTechnique: "",
          realisePar2: "",
          contratEntretien: "",
          signature: "",
        });
      } else {
        toast.error("Erreur lors de l'envoi de la fiche de mise en service");
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de l'envoi de la fiche de mise en service");
    }
  };

  return (
    <motion.div
      key="fiche-mise-en-service-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4 max-w-5xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#86BC29]">Fiche de mise en service</h1>
        <div className="flex items-center gap-3">
          <div className="text-lg font-medium">{progressValue}%</div>
          <div className="w-40">
            <Progress value={progressValue} className="h-2" />
          </div>
        </div>
      </div>
      <form className="space-y-6">
        {/* Type PAC - Toujours déplié */}
        <Card className="shadow-sm">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-[#86BC29]">Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              {/* TYPE - Première colonne */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type" className="text-base font-medium block mb-2">TYPE DE PAC</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                      <Checkbox 
                        id="sol-eau" 
                        checked={formData.type === 'SOL/EAU'}
                        onCheckedChange={(checked) => handleInputChange('type', checked ? 'SOL/EAU' : '')}
                        className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                      />
                      <Label htmlFor="sol-eau" className="text-sm font-medium">SOL/EAU</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                      <Checkbox 
                        id="sol-sol" 
                        checked={formData.type === 'SOL/SOL'}
                        onCheckedChange={(checked) => handleInputChange('type', checked ? 'SOL/SOL' : '')}
                        className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                      />
                      <Label htmlFor="sol-sol" className="text-sm font-medium">SOL/SOL</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                      <Checkbox 
                        id="eau-glycolee-eau" 
                        checked={formData.type === 'EAU GLYCOLÉE/EAU'}
                        onCheckedChange={(checked) => handleInputChange('type', checked ? 'EAU GLYCOLÉE/EAU' : '')}
                        className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                      />
                      <Label htmlFor="eau-glycolee-eau" className="text-sm font-medium">EAU GLYCOLÉE/EAU</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                      <Checkbox 
                        id="eau-glycolee-sol" 
                        checked={formData.type === 'EAU GLYCOLÉE/SOL'}
                        onCheckedChange={(checked) => handleInputChange('type', checked ? 'EAU GLYCOLÉE/SOL' : '')}
                        className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                      />
                      <Label htmlFor="eau-glycolee-sol" className="text-sm font-medium">EAU GLYCOLÉE/SOL</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                      <Checkbox 
                        id="eau-nappe-eau" 
                        checked={formData.type === 'EAU DE NAPPE/EAU'}
                        onCheckedChange={(checked) => handleInputChange('type', checked ? 'EAU DE NAPPE/EAU' : '')}
                        className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                      />
                      <Label htmlFor="eau-nappe-eau" className="text-sm font-medium">EAU DE NAPPE/EAU</Label>
                    </div>
                  </div>
                </div>

                {/* MODÈLE */}
                <div>
                  <Label htmlFor="modele" className="text-base font-medium block mb-2">MODÈLE</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                      <Checkbox 
                        id="optipack2" 
                        checked={formData.modele === 'OPTIPACK2'}
                        onCheckedChange={(checked) => handleInputChange('modele', checked ? 'OPTIPACK2' : '')}
                        className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                      />
                      <Label htmlFor="optipack2" className="text-sm font-medium">OPTIPACK2</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                      <Checkbox 
                        id="optipackduo2" 
                        checked={formData.modele === 'OPTIPACKDUO2'}
                        onCheckedChange={(checked) => handleInputChange('modele', checked ? 'OPTIPACKDUO2' : '')}
                        className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                      />
                      <Label htmlFor="optipackduo2" className="text-sm font-medium">OPTIPACKDUO2</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                      <Checkbox 
                        id="smartpack2" 
                        checked={formData.modele === 'SMARTPACK2'}
                        onCheckedChange={(checked) => handleInputChange('modele', checked ? 'SMARTPACK2' : '')}
                        className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                      />
                      <Label htmlFor="smartpack2" className="text-sm font-medium">SMARTPACK2</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                      <Checkbox 
                        id="smartpack3" 
                        checked={formData.modele === 'SMARTPACK3'}
                        onCheckedChange={(checked) => handleInputChange('modele', checked ? 'SMARTPACK3' : '')}
                        className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                      />
                      <Label htmlFor="smartpack3" className="text-sm font-medium">SMARTPACK3</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deuxième colonne */}
              <div className="space-y-6">
                {/* N° SÉRIE */}
                <div>
                  <Label htmlFor="numeroSerie" className="text-base font-medium flex items-center">
                    N° SÉRIE
                    <span className="ml-1 text-red-500">*</span>
                    <span className="text-sm text-gray-500 ml-2">(impératif)</span>
                  </Label>
                  <Input
                    id="numeroSerie"
                    value={formData.numeroSerie}
                    onChange={(e) => handleInputChange('numeroSerie', e.target.value)}
                    className="mt-2 border-gray-300 focus:border-[#86BC29] focus:ring-[#86BC29]"
                    placeholder="Ex: NH12345678"
                  />
                </div>

                {/* GÉNÉRATEUR */}
                <div>
                  <Label htmlFor="generateur" className="text-base font-medium block mb-2">GÉNÉRATEUR (kW)</Label>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2">
                      {[2, 4, 5, 6, 8, 10, 13, 17, 20, 25, 30, 35, 40].map((value) => (
                        <div key={value} className="flex items-center space-x-2 bg-white px-2 py-1 rounded border border-gray-200">
                          <Checkbox 
                            id={`gen-${value}`}
                            checked={formData.generateur === value.toString()}
                            onCheckedChange={(checked) => handleInputChange('generateur', checked ? value.toString() : '')}
                            className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                          />
                          <Label htmlFor={`gen-${value}`} className="text-sm font-medium">{value}</Label>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3">
                      <Label htmlFor="generateurAutre" className="text-sm font-medium">AUTRE (à préciser)</Label>
                      <Input
                        id="generateurAutre"
                        value={formData.generateur.includes('AUTRE') ? formData.generateur.replace('AUTRE:', '') : ''}
                        onChange={(e) => handleInputChange('generateur', e.target.value ? `AUTRE:${e.target.value}` : '')}
                        className="mt-1 border-gray-300"
                        placeholder="Préciser la puissance..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adresse d'installation et Surfaces - Section repliable */}
        <Card className="shadow-sm">
          <CardHeader 
            className="bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleSection('adresse')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#86BC29] flex items-center gap-2">
                <FileText size={20} />
                Adresse d'installation et Surfaces
              </CardTitle>
              {expandedSections.adresse ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </CardHeader>
          {expandedSections.adresse && (
            <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Nom, Prénom */}
              <div>
                <Label htmlFor="nomPrenom" className="text-base font-medium block mb-2">Nom, Prénom (chantier)</Label>
                <Input
                  id="nomPrenom"
                  value={formData.nomPrenom}
                  onChange={(e) => handleInputChange('nomPrenom', e.target.value)}
                  className="border-gray-300 focus:border-[#86BC29] focus:ring-[#86BC29]"
                  placeholder="Ex: Dupont Jean"
                />
              </div>
              
              {/* Adresse */}
              <div>
                <Label htmlFor="adresse" className="text-base font-medium block mb-2">Rue, Voie, Quartier</Label>
                <Input
                  id="adresse"
                  value={formData.adresse}
                  onChange={(e) => handleInputChange('adresse', e.target.value)}
                  className="border-gray-300 focus:border-[#86BC29] focus:ring-[#86BC29]"
                  placeholder="Ex: 123 rue des Lilas"
                />
              </div>
              
              {/* Code postal et Ville */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="codePostal" className="text-base font-medium block mb-2">Code postal</Label>
                  <Input
                    id="codePostal"
                    value={formData.codePostal}
                    onChange={(e) => handleInputChange('codePostal', e.target.value)}
                    className="border-gray-300 focus:border-[#86BC29] focus:ring-[#86BC29]"
                    placeholder="Ex: 75000"
                  />
                </div>
                <div>
                  <Label htmlFor="ville" className="text-base font-medium block mb-2">Ville</Label>
                  <Input
                    id="ville"
                    value={formData.ville}
                    onChange={(e) => handleInputChange('ville', e.target.value)}
                    className="border-gray-300 focus:border-[#86BC29] focus:ring-[#86BC29]"
                    placeholder="Ex: Paris"
                  />
                </div>
              </div>
              
              {/* Nombre d'étages avec menu déroulant */}
              <div>
                <Label htmlFor="nombreEtages" className="text-base font-medium block mb-2">Nombre d'étages</Label>
                <Select
                  value={formData.nombreEtages}
                  onValueChange={(value) => handleInputChange('nombreEtages', value)}
                >
                  <SelectTrigger className="w-full border-gray-300 focus:border-[#86BC29] focus:ring-[#86BC29]">
                    <SelectValue placeholder="Sélectionnez le nombre d'étages" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4].map((value) => (
                      <SelectItem key={value} value={value.toString()}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Surfaces dynamiques en fonction du nombre d'étages */}
              <div className="space-y-4">
                <Label className="text-base font-medium block">Surfaces chauffées</Label>
                
                {/* RDC toujours présent */}
                <div>
                  <Label htmlFor="surfaceRDC" className="text-sm font-medium block mb-1">Surface chauffée RDC (m²)</Label>
                  <Input
                    id="surfaceRDC"
                    value={formData.surfaceRDC}
                    onChange={(e) => handleInputChange('surfaceRDC', e.target.value)}
                    className="border-gray-300 focus:border-[#86BC29] focus:ring-[#86BC29]"
                    placeholder="Ex: 120"
                    type="number"
                  />
                </div>
                
                {/* Surfaces des étages dynamiques */}
                {parseInt(formData.nombreEtages) > 0 && Array.from({length: parseInt(formData.nombreEtages)}).map((_, index) => (
                  <div key={`etage-${index + 1}`}>
                    <Label htmlFor={`surfaceEtage${index + 1}`} className="text-sm font-medium block mb-1">
                      Surface chauffée Étage {index + 1} (m²)
                    </Label>
                    <Input
                      id={`surfaceEtage${index + 1}`}
                      value={formData[`surfaceEtage${index + 1}`] || ''}
                      onChange={(e) => handleInputChange(`surfaceEtage${index + 1}`, e.target.value)}
                      className="border-gray-300 focus:border-[#86BC29] focus:ring-[#86BC29]"
                      placeholder={`Ex: 80`}
                      type="number"
                    />
                  </div>
                ))}
              </div>
              
              {/* Application */}
              <div className="bg-gray-50 p-4 rounded-md">
                <Label className="text-base font-medium block mb-3">Type d'application</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-gray-200">
                    <Checkbox 
                      id="plancherChauffant"
                      checked={formData.plancherChauffant}
                      onCheckedChange={(checked) => handleCheckboxChange('plancherChauffant', checked as boolean)}
                      className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                    />
                    <Label htmlFor="plancherChauffant" className="text-sm font-medium">Plancher Chauffant</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-gray-200">
                    <Checkbox 
                      id="radiateurs"
                      checked={formData.radiateurs}
                      onCheckedChange={(checked) => handleCheckboxChange('radiateurs', checked as boolean)}
                      className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                    />
                    <Label htmlFor="radiateurs" className="text-sm font-medium">Radiateurs</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-gray-200">
                    <Checkbox 
                      id="ventiloConvecteurs"
                      checked={formData.ventiloConvecteurs}
                      onCheckedChange={(checked) => handleCheckboxChange('ventiloConvecteurs', checked as boolean)}
                      className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                    />
                    <Label htmlFor="ventiloConvecteurs" className="text-sm font-medium">Ventilo-convecteurs</Label>
                  </div>
                </div>
              </div>
              
              {/* Ballon tampon */}
              <div className="bg-gray-50 p-4 rounded-md">
                <Label className="text-base font-medium block mb-3">Ballon tampon</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-md border border-gray-200">
                    <Checkbox 
                      id="ballonTamponOui"
                      checked={formData.ballonTamponOui}
                      onCheckedChange={(checked) => {
                        handleCheckboxChange('ballonTamponOui', checked as boolean);
                        if (checked) handleCheckboxChange('ballonTamponNon', false);
                      }}
                      className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                    />
                    <Label htmlFor="ballonTamponOui" className="text-sm font-medium">Oui</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-md border border-gray-200">
                    <Checkbox 
                      id="ballonTamponNon"
                      checked={formData.ballonTamponNon}
                      onCheckedChange={(checked) => {
                        handleCheckboxChange('ballonTamponNon', checked as boolean);
                        if (checked) handleCheckboxChange('ballonTamponOui', false);
                      }}
                      className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                    />
                    <Label htmlFor="ballonTamponNon" className="text-sm font-medium">Non</Label>
                  </div>
                  
                  {formData.ballonTamponOui && (
                    <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-md border border-gray-200">
                      <Label htmlFor="ballonTamponVolume" className="text-sm font-medium">Volume (litres)</Label>
                      <Input
                        id="ballonTamponVolume"
                        value={formData.ballonTamponVolume}
                        onChange={(e) => handleInputChange('ballonTamponVolume', e.target.value)}
                        className="w-24 border-gray-300 focus:border-[#86BC29] focus:ring-[#86BC29]"
                        type="number"
                        placeholder="Ex: 200"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Application */}
              <div className="bg-gray-50 p-4 rounded-md">
                <Label className="text-base font-medium block mb-3">Type d'application</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-gray-200">
                    <Checkbox 
                      id="plancherChauffant"
                      checked={formData.plancherChauffant}
                      onCheckedChange={(checked) => handleCheckboxChange('plancherChauffant', checked as boolean)}
                      className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                    />
                    <Label htmlFor="plancherChauffant" className="text-sm font-medium">Plancher Chauffant</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-gray-200">
                    <Checkbox 
                      id="radiateurs"
                      checked={formData.radiateurs}
                      onCheckedChange={(checked) => handleCheckboxChange('radiateurs', checked as boolean)}
                      className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                    />
                    <Label htmlFor="radiateurs" className="text-sm font-medium">Radiateurs</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-gray-200">
                    <Checkbox 
                      id="ventiloConvecteurs"
                      checked={formData.ventiloConvecteurs}
                      onCheckedChange={(checked) => handleCheckboxChange('ventiloConvecteurs', checked as boolean)}
                      className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                    />
                    <Label htmlFor="ventiloConvecteurs" className="text-sm font-medium">Ventilo-convecteurs</Label>
                  </div>
                </div>
              </div>
              
              {/* Ballon tampon */}
              <div className="bg-gray-50 p-4 rounded-md">
                <Label className="text-base font-medium block mb-3">Ballon tampon</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-md border border-gray-200">
                    <Checkbox 
                      id="ballonTamponOui"
                      checked={formData.ballonTamponOui}
                      onCheckedChange={(checked) => {
                        handleCheckboxChange('ballonTamponOui', checked as boolean);
                        if (checked) handleCheckboxChange('ballonTamponNon', false);
                      }}
                      className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                    />
                    <Label htmlFor="ballonTamponOui" className="text-sm font-medium">Oui</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-md border border-gray-200">
                    <Checkbox 
                      id="ballonTamponNon"
                      checked={formData.ballonTamponNon}
                      onCheckedChange={(checked) => {
                        handleCheckboxChange('ballonTamponNon', checked as boolean);
                        if (checked) handleCheckboxChange('ballonTamponOui', false);
                      }}
                      className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                    />
                    <Label htmlFor="ballonTamponNon" className="text-sm font-medium">Non</Label>
                  </div>
                  
                  {formData.ballonTamponOui && (
                    <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-md border border-gray-200">
                      <Label htmlFor="ballonTamponVolume" className="text-sm font-medium">Volume (litres)</Label>
                      <Input
                        id="ballonTamponVolume"
                        value={formData.ballonTamponVolume}
                        onChange={(e) => handleInputChange('ballonTamponVolume', e.target.value)}
                        className="w-24 border-gray-300 focus:border-[#86BC29] focus:ring-[#86BC29]"
                        type="number"
                        placeholder="Ex: 200"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Position de la pompe à chaleur */}
              <div className="bg-gray-50 p-4 rounded-md">
                <Label className="text-base font-medium block mb-3">Position de la pompe à chaleur</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-gray-200">
                    <Checkbox 
                      id="pompeInterieur" 
                      checked={formData.pompePosition === 'Intérieur'}
                      onCheckedChange={(checked) => {
                        if (checked) handleInputChange('pompePosition', 'Intérieur');
                      }}
                      className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                    />
                    <Label htmlFor="pompeInterieur" className="text-sm font-medium">Intérieur</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-gray-200">
                    <Checkbox 
                      id="pompeExterieur" 
                      checked={formData.pompePosition === 'Extérieur'}
                      onCheckedChange={(checked) => {
                        if (checked) handleInputChange('pompePosition', 'Extérieur');
                      }}
                      className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                    />
                    <Label htmlFor="pompeExterieur" className="text-sm font-medium">Extérieur</Label>
                  </div>
                </div>
              </div>
              
              {/* Type d'installation */}
              <div className="bg-gray-50 p-4 rounded-md">
                <Label className="text-base font-medium block mb-3">Type d'installation</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-gray-200">
                    <Checkbox 
                      id="pompeNeuf" 
                      checked={formData.pompeType === 'Neuf'}
                      onCheckedChange={(checked) => {
                        if (checked) handleInputChange('pompeType', 'Neuf');
                      }}
                      className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                    />
                    <Label htmlFor="pompeNeuf" className="text-sm font-medium">Neuf</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-gray-200">
                    <Checkbox 
                      id="pompeRenovation" 
                      checked={formData.pompeType === 'Rénovation'}
                      onCheckedChange={(checked) => {
                        if (checked) handleInputChange('pompeType', 'Rénovation');
                      }}
                      className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                    />
                    <Label htmlFor="pompeRenovation" className="text-sm font-medium">Rénovation</Label>
                  </div>
                </div>
              </div>
              
              {/* Ancien gaz (si rénovation) */}
              {formData.pompeType === 'Rénovation' && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <Label htmlFor="ancienGaz" className="text-base font-medium block mb-3">Ancien gaz</Label>
                  <Input
                    id="ancienGaz"
                    value={formData.ancienGaz}
                    onChange={(e) => handleInputChange('ancienGaz', e.target.value)}
                    className="border-gray-300 focus:border-[#86BC29] focus:ring-[#86BC29]"
                    placeholder="Ex: R410A"
                  />
                </div>
              )}
            </div>
            </CardContent>
          )}
        </Card>

        {/* Paramètres hydrauliques - Section repliable */}
        <Card className="shadow-sm">
          <CardHeader 
            className="bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleSection('hydraulique')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#86BC29] flex items-center gap-2">
                <Droplets size={20} />
                Paramètres hydrauliques
              </CardTitle>
              {expandedSections.hydraulique ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </CardHeader>
          {expandedSections.hydraulique && (
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                {/* Distance et diamètre des liaisons */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="distanceLiaisons" className="text-base font-medium block mb-2">Distance des liaisons chauffage</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="distanceLiaisons"
                        value={formData.distanceLiaisons}
                        onChange={(e) => handleInputChange('distanceLiaisons', e.target.value)}
                        className="border-gray-300 focus:border-[#86BC29] focus:ring-[#86BC29]"
                        type="number"
                        placeholder="Ex: 15"
                      />
                      <span className="text-sm text-gray-600 min-w-[20px]">m</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="diametreLiaisons" className="text-base font-medium block mb-2">Diamètre des liaisons</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Ø</span>
                      <Input
                        id="diametreLiaisons"
                        value={formData.diametreLiaisons}
                        onChange={(e) => handleInputChange('diametreLiaisons', e.target.value)}
                        className="border-gray-300 focus:border-[#86BC29] focus:ring-[#86BC29]"
                        type="number"
                        placeholder="Ex: 25"
                      />
                      <span className="text-sm text-gray-600 min-w-[25px]">mm</span>
                    </div>
                  </div>
                </div>

                {/* Températures */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tempDepartEauChauffage" className="text-base font-medium block mb-2">Température départ eau chauffage</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="tempDepartEauChauffage"
                          value={formData.tempDepartEauChauffage}
                          onChange={(e) => handleInputChange('tempDepartEauChauffage', e.target.value)}
                          className="border-gray-300 focus:border-[#86BC29] focus:ring-[#86BC29]"
                          type="number"
                          placeholder="Ex: 45"
                        />
                        <span className="text-sm text-gray-600">°C</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="tempRetourEauChauffage" className="text-base font-medium block mb-2">Température retour eau chauffage</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="tempRetourEauChauffage"
                          value={formData.tempRetourEauChauffage}
                          onChange={(e) => handleInputChange('tempRetourEauChauffage', e.target.value)}
                          className="border-gray-300 focus:border-[#86BC29] focus:ring-[#86BC29]"
                          type="number"
                          placeholder="Ex: 35"
                        />
                        <span className="text-sm text-gray-600">°C</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tempDepartEauFroide" className="text-base font-medium block mb-2">Température départ eau froide (clim)</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="tempDepartEauFroide"
                          value={formData.tempDepartEauFroide}
                          onChange={(e) => handleInputChange('tempDepartEauFroide', e.target.value)}
                          className="border-gray-300 focus:border-[#86BC29] focus:ring-[#86BC29]"
                          type="number"
                          placeholder="Ex: 7"
                        />
                        <span className="text-sm text-gray-600">°C</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="tempRetourEauFroide" className="text-base font-medium block mb-2">Température retour eau froide (clim)</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="tempRetourEauFroide"
                          value={formData.tempRetourEauFroide}
                          onChange={(e) => handleInputChange('tempRetourEauFroide', e.target.value)}
                          className="border-gray-300 focus:border-[#86BC29] focus:ring-[#86BC29]"
                          type="number"
                          placeholder="Ex: 12"
                        />
                        <span className="text-sm text-gray-600">°C</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pression de remplissage */}
                <div className="md:col-span-2">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <Label htmlFor="pressionRemplissage" className="text-base font-medium block mb-3">Pression de remplissage installation (vase à 1.5 Bars)</Label>
                    <div className="flex items-center space-x-2 max-w-xs">
                      <Input
                        id="pressionRemplissage"
                        value={formData.pressionRemplissage}
                        onChange={(e) => handleInputChange('pressionRemplissage', e.target.value)}
                        className="border-gray-300 focus:border-[#86BC29] focus:ring-[#86BC29]"
                        type="number"
                        step="0.1"
                        placeholder="Ex: 1.5"
                      />
                      <span className="text-sm text-gray-600">Bars</span>
                    </div>
                  </div>
                </div>

                {/* Kit ECS */}
                <div className="md:col-span-2">
                  <div className="bg-gray-50 p-4 rounded-md space-y-4">
                    <Label className="text-base font-medium block">Kit ECS</Label>
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="kitECS170"
                          checked={formData.kitECS170}
                          onCheckedChange={(checked) => handleKitECSChange('kitECS170', checked as boolean)}
                          className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                        />
                        <Label htmlFor="kitECS170" className="text-sm font-medium">170 l</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="kitECS270"
                          checked={formData.kitECS270}
                          onCheckedChange={(checked) => handleKitECSChange('kitECS270', checked as boolean)}
                          className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                        />
                        <Label htmlFor="kitECS270" className="text-sm font-medium">270 l</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="kitECSAutre"
                          checked={formData.kitECSAutre}
                          onCheckedChange={(checked) => handleKitECSChange('kitECSAutre', checked as boolean)}
                          className="data-[state=checked]:bg-[#86BC29] data-[state=checked]:border-[#86BC29]"
                        />
                        <Label htmlFor="kitECSAutre" className="text-sm font-medium">Autre (à préciser)</Label>
                      </div>
                    </div>
                    
                    {formData.kitECSAutre && (
                      <div className="mt-3">
                        <Input
                          id="kitECSAutreTexte"
                          value={formData.kitECSAutreTexte}
                          onChange={(e) => handleInputChange('kitECSAutreTexte', e.target.value)}
                          className="border-gray-300 focus:border-[#86BC29] focus:ring-[#86BC29] max-w-xs"
                          placeholder="Préciser le type de kit ECS"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* PAC réversible et taux de monopropylène glycol */}
                <div className="md:col-span-2">
                  <div className="bg-gray-50 p-4 rounded-md space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-base font-medium block mb-3">PAC réversible</Label>
                        <RadioGroup 
                          value={formData.pacReversible} 
                          onValueChange={(value) => handleInputChange('pacReversible', value)}
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Oui" id="pacReversibleOui" className="border-[#86BC29] text-[#86BC29]" />
                            <Label htmlFor="pacReversibleOui" className="text-sm font-medium">Oui</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Non" id="pacReversibleNon" className="border-[#86BC29] text-[#86BC29]" />
                            <Label htmlFor="pacReversibleNon" className="text-sm font-medium">Non</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div>
                        <Label htmlFor="tauxMonopropyleneGlycol" className="text-base font-medium block mb-2">
                          Taux de monopropylène glycol
                          <span className="text-sm text-gray-600 block">(15% impératif minimum)</span>
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="tauxMonopropyleneGlycol"
                            value={formData.tauxMonopropyleneGlycol}
                            onChange={(e) => handleInputChange('tauxMonopropyleneGlycol', e.target.value)}
                            className="border-gray-300 focus:border-[#86BC29] focus:ring-[#86BC29] max-w-xs"
                            type="number"
                            min="15"
                            placeholder="Ex: 20"
                          />
                          <span className="text-sm text-gray-600">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Paramètres capteur - Section repliable */}
        <Card className="shadow-sm">
          <CardHeader 
            className="bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleSection('capteur')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#86BC29] flex items-center gap-2">
                <Thermometer size={20} />
                Paramètres capteur
              </CardTitle>
              {expandedSections.capteur ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </CardHeader>
          {expandedSections.capteur && (
            <CardContent className="pt-6">
              <div className="text-gray-500 text-center py-8">
                Section à compléter - Paramètres capteur
              </div>
            </CardContent>
          )}
        </Card>

        {/* Paramètres électriques - Section repliable */}
        <Card className="shadow-sm">
          <CardHeader 
            className="bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleSection('electrique')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#86BC29] flex items-center gap-2">
                <Zap size={20} />
                Paramètres électriques
              </CardTitle>
              {expandedSections.electrique ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </CardHeader>
          {expandedSections.electrique && (
            <CardContent className="pt-6">
              <div className="text-gray-500 text-center py-8">
                Section à compléter - Paramètres électriques
              </div>
            </CardContent>
          )}
        </Card>

        {/* Paramètres frigorifiques - Section repliable */}
        <Card className="shadow-sm">
          <CardHeader 
            className="bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleSection('frigorifique')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#86BC29] flex items-center gap-2">
                <Gauge size={20} />
                Paramètres frigorifiques en mode chauffage
              </CardTitle>
              {expandedSections.frigorifique ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </CardHeader>
          {expandedSections.frigorifique && (
            <CardContent className="pt-6">
              <div className="text-gray-500 text-center py-8">
                Section à compléter - Paramètres frigorifiques
              </div>
            </CardContent>
          )}
        </Card>

        {/* Installateur - Section repliable */}
        <Card className="shadow-sm">
          <CardHeader 
            className="bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleSection('installateur')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#86BC29] flex items-center gap-2">
                <Settings size={20} />
                Installateur
              </CardTitle>
              {expandedSections.installateur ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </CardHeader>
          {expandedSections.installateur && (
            <CardContent className="pt-6">
              <div className="text-gray-500 text-center py-8">
                Section à compléter - Informations installateur
              </div>
            </CardContent>
          )}
        </Card>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4 mt-8">
          <Button 
            type="button" 
            variant="outline"
            className="border-gray-300 hover:bg-gray-100 hover:text-gray-800 px-6 py-2 text-base"
          >
            Annuler
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            className="bg-[#86BC29] hover:bg-[#75a625] text-white px-8 py-2 text-base font-medium shadow-sm flex items-center gap-2"
          >
            <Check size={18} />
            Envoyer la fiche
          </Button>
        </div>
      </form>

      {/* Modal de sélection d'agent */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer la fiche de mise en service</DialogTitle>
            <DialogDescription>
              Sélectionnez l'agent commercial qui recevra la fiche de mise en service.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Agent commercial</Label>
              <div className="space-y-2 mt-2">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={agent.id}
                      name="agent"
                      value={agent.id}
                      checked={selectedAgent === agent.id}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="w-4 h-4 text-[#86BC29] border-gray-300 focus:ring-[#86BC29]"
                    />
                    <Label htmlFor={agent.id} className="cursor-pointer">
                      {agent.name} ({agent.email})
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copyToUser"
                  checked={copyToUser}
                  onCheckedChange={(checked) => setCopyToUser(checked as boolean)}
                />
                <Label htmlFor="copyToUser">Recevoir une copie par email</Label>
              </div>
              
              {copyToUser && (
                <div>
                  <Label htmlFor="userEmail">Votre email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSendEmail}
                className="bg-[#86BC29] hover:bg-[#75a625]"
              >
                Envoyer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
