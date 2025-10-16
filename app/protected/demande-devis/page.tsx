'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Send, FileText, X, User, Mail } from 'lucide-react';

interface FormData {
  // Informations générales
  entreprise: string;
  reference: string;
  date: string;
  interlocuteur: string;
  
  // Élément d'étude - choix unique
  typeProjet: 'neuf' | 'renovation' | 'remplacementChaudiere' | '';
  typeMaison: string;
  zoneClimatique: string;
  altitude: string;
  
  // Zones dynamiques
  zones: Array<{
    id: string;
    surface: string;
    volume: string;
    emetteur: string;
  }>;
  
  // Déperditions
  deperditions: string;
  tExterieure: string;
  tDepartEau: string;
  tAmbiante: string;
  
  // Type de pompe à chaleur - choix principal
  typePAC: 'geothermie' | 'aerothermie' | '';
  
  // Fluide frigorigène
  fluideFrigo: 'r32' | 'r410' | '';
  
  // Aérothermie (si typePAC = aerothermie)
  aeroType: 'airEau' | '';
  aeroConfig: 'monoBloc' | 'biBloc' | '';
  
  // Géothermie (si typePAC = geothermie)
  geoType: 'eauGlycoleEau' | 'solEau' | 'solSol' | 'eauGlycoleSol' | '';
  
  // Gammes
  optipack: boolean;
  smartpack: boolean;
  optipackDuo: boolean;
  smartpackSupport: boolean;
  smartpackHabillage: boolean;
  
  // Accessoires Aérothermie
  supportsMuraux: boolean;
  supportsSol: boolean;
  
  // Type capteur Géothermie
  horizontal: boolean;
  vertical: boolean;
  charge: boolean;
  nonCharge: boolean;
  eauNappe: boolean;
  
  // Options
  kitPiscine: boolean;
  reversible: boolean;
  kitFreecooling: boolean;
  
  // Dimensions
  longueur: string;
  largeur: string;
  profondeur: string;
  kitResistanceElectrique: boolean;
  ballonTampon: boolean;
  resistanceElectriqueAMonter: boolean;
  resistanceElectriqueTuyauterie: boolean;
  puissanceResistance1: string;
  puissanceResistance2: string;
  
  // Information bassin
  prive: boolean;
  public: boolean;
  estivale: boolean;
  annuel: boolean;
  
  // Régulation
  thermostat: boolean;
  radio: boolean;
  filaire: boolean;
  connecte: boolean;
  loiEau: boolean;
  
  // Eau Chaude Sanitaire
  ecsOui: boolean;
  ecsNon: boolean;
  nombrePersonnes: string;
  nombrePointsTirage: string;
}

function DemandeDevisContent() {
  const [formData, setFormData] = useState<FormData>({
    entreprise: '',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    interlocuteur: '',
    typeProjet: '',
    typeMaison: '',
    zoneClimatique: '',
    altitude: '',
    zones: [{ id: '1', surface: '', volume: '', emetteur: '' }],
    deperditions: '',
    tExterieure: '',
    tDepartEau: '',
    tAmbiante: '',
    typePAC: '',
    fluideFrigo: '',
    aeroType: '',
    aeroConfig: '',
    geoType: '',
    optipack: false,
    smartpack: false,
    optipackDuo: false,
    smartpackSupport: false,
    smartpackHabillage: false,
    supportsMuraux: false,
    supportsSol: false,
    horizontal: false,
    vertical: false,
    charge: false,
    nonCharge: false,
    eauNappe: false,
    kitPiscine: false,
    reversible: false,
    kitFreecooling: false,
    longueur: '',
    largeur: '',
    profondeur: '',
    kitResistanceElectrique: false,
    ballonTampon: false,
    resistanceElectriqueAMonter: false,
    resistanceElectriqueTuyauterie: false,
    puissanceResistance1: '',
    puissanceResistance2: '',
    prive: false,
    public: false,
    estivale: false,
    annuel: false,
    thermostat: false,
    radio: false,
    filaire: false,
    connecte: false,
    loiEau: false,
    ecsOui: false,
    ecsNon: false,
    nombrePersonnes: '',
    nombrePointsTirage: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [copyToUser, setCopyToUser] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  // Référence pour éviter les appels multiples du useEffect de pré-remplissage
  const hasProcessedPrefill = useRef(false);

  const agents = [
    { id: 'max1', name: 'Max 1', email: 'max.barrault@live.fr' },
    { id: 'max2', name: 'Max 2', email: 'mb.barrault@outlook.fr' }
  ];

  const searchParams = useSearchParams();

  // Pré-remplissage du formulaire depuis sessionStorage
  useEffect(() => {
    const prefill = searchParams.get('prefill');
    console.log('🔍 Paramètre prefill détecté:', prefill);
    
    if (prefill === 'true' && !hasProcessedPrefill.current) {
      hasProcessedPrefill.current = true; // Marquer comme traité
      
      try {
        const savedFormData = sessionStorage.getItem('formData');
        console.log('📦 Données brutes depuis sessionStorage:', savedFormData);
        
        if (savedFormData) {
          const parsedData = JSON.parse(savedFormData);
          console.log('📋 Données parsées:', parsedData);
          
          // Adapter les données sauvegardées au nouveau format si nécessaire
          const adaptedData = {
            ...formData,
            ...parsedData,
            // S'assurer que zones est un tableau avec des IDs string
            zones: Array.isArray(parsedData.zones) && parsedData.zones.length > 0 
              ? parsedData.zones.map((zone: any, index: number) => ({
                  id: zone.id?.toString() || (index + 1).toString(),
                  surface: zone.surface || '',
                  volume: zone.volume || '',
                  emetteur: zone.emetteur || ''
                }))
              : [
                  {
                    id: '1',
                    surface: '',
                    volume: '',
                    emetteur: ''
                  }
                ]
          };
          
          console.log('✅ Données adaptées pour le formulaire:', adaptedData);
          setFormData(adaptedData);
          
          // Nettoyer sessionStorage après utilisation
          // Attendre un court délai pour s'assurer que les données sont bien appliquées
          setTimeout(() => {
            sessionStorage.removeItem('formData');
            console.log('🗑️ Données supprimées de sessionStorage après application');
          }, 1000);
          
          toast.success("Formulaire pré-rempli avec les données de dimensionnement");
        } else {
          console.log('⚠️ Aucune donnée trouvée dans sessionStorage');
        }
      } catch (error) {
        console.error('❌ Erreur lors du pré-remplissage:', error);
        toast.error("Erreur lors du pré-remplissage du formulaire");
      }
    }
  }, [searchParams]);

  const handleInputChange = (field: keyof FormData, value: string | boolean | Array<{ id: string; surface: string; volume: string; emetteur: string }>) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setShowAgentSelector(true);
  };

  const handleSendEmail = async () => {
    if (!selectedAgent) {
      toast.error('Veuillez sélectionner un agent commercial');
      return;
    }

    if (copyToUser && !userEmail) {
      toast.error('Veuillez saisir votre adresse email pour recevoir une copie');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const selectedAgentData = agents.find(agent => agent.id === selectedAgent);
      
      const emailData = {
        formData,
        agentEmail: selectedAgentData?.email,
        agentName: selectedAgentData?.name,
        copyToUser,
        userEmail: copyToUser ? userEmail : null
      };

      const response = await fetch('/api/send-quote-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Demande de devis envoyée avec succès !', {
          description: `Votre demande a été transmise à ${selectedAgentData?.name} (${selectedAgentData?.email})${copyToUser ? ' et une copie vous a été envoyée' : ''}`
        });
        
        setFormData({
          entreprise: '',
          reference: '',
          date: new Date().toISOString().split('T')[0],
          interlocuteur: '',
          typeProjet: '',
          typeMaison: '',
          zoneClimatique: '',
          altitude: '',
          zones: [{ id: '1', surface: '', volume: '', emetteur: '' }],
          deperditions: '',
          tExterieure: '',
          tDepartEau: '',
          tAmbiante: '',
          typePAC: '',
          fluideFrigo: '',
          aeroType: '',
          aeroConfig: '',
          geoType: '',
          optipack: false,
          smartpack: false,
          optipackDuo: false,
          smartpackSupport: false,
          smartpackHabillage: false,
          supportsMuraux: false,
          supportsSol: false,
          horizontal: false,
          vertical: false,
          charge: false,
          nonCharge: false,
          eauNappe: false,
          kitPiscine: false,
          reversible: false,
          kitFreecooling: false,
          longueur: '',
          largeur: '',
          profondeur: '',
          kitResistanceElectrique: false,
          ballonTampon: false,
          resistanceElectriqueAMonter: false,
          resistanceElectriqueTuyauterie: false,
          puissanceResistance1: '',
          puissanceResistance2: '',
          prive: false,
          public: false,
          estivale: false,
          annuel: false,
          thermostat: false,
          radio: false,
          filaire: false,
          connecte: false,
          loiEau: false,
          ecsOui: false,
          ecsNon: false,
          nombrePersonnes: '',
          nombrePointsTirage: ''
        });
        
        setShowAgentSelector(false);
        setSelectedAgent('');
        setCopyToUser(false);
        setUserEmail('');
        
      } else {
        throw new Error(result.error || 'Erreur lors de l\'envoi');
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast.error('Erreur lors de l\'envoi de la demande', {
        description: 'Veuillez vérifier votre connexion et réessayer'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonctions pour gérer les zones
  const addZone = () => {
    const newId = Math.max(...formData.zones.map(z => parseInt(z.id.toString())), 0) + 1;
    const newZone = {
      id: newId.toString(),
      surface: '',
      volume: '',
      emetteur: ''
    };
    setFormData(prev => ({
      ...prev,
      zones: [...prev.zones, newZone]
    }));
  };

  const removeZone = (zoneId: string) => {
    if (formData.zones.length > 1) {
      setFormData(prev => ({
        ...prev,
        zones: prev.zones.filter(zone => zone.id !== zoneId)
      }));
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <FileText className="mr-3 h-8 w-8 text-[#86BC29]" />
          Demande de devis
        </h1>
        <p className="text-gray-600">
          Formulaire obligatoire pour la réalisation de devis
        </p>
      </div>

      <div className="space-y-4">
        {/* Informations générales */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#86BC29]">Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="entreprise">Entreprise</Label>
                <Input
                  id="entreprise"
                  value={formData.entreprise}
                  onChange={(e) => handleInputChange('entreprise', e.target.value)}
                  placeholder="Nom de l'entreprise"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="reference">Référence</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => handleInputChange('reference', e.target.value)}
                  placeholder="Référence du projet"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-3">
                <Label htmlFor="interlocuteur">Interlocuteur</Label>
                <Input
                  id="interlocuteur"
                  value={formData.interlocuteur}
                  onChange={(e) => handleInputChange('interlocuteur', e.target.value)}
                  placeholder="Nom de l'interlocuteur"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Élément d'étude */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#86BC29]">Élément d'étude</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="neuf"
                    checked={formData.typeProjet === 'neuf'}
                    onCheckedChange={(checked) => handleInputChange('typeProjet', checked ? 'neuf' : '')}
                  />
                  <Label htmlFor="neuf">Neuf</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="renovation"
                    checked={formData.typeProjet === 'renovation'}
                    onCheckedChange={(checked) => handleInputChange('typeProjet', checked ? 'renovation' : '')}
                  />
                  <Label htmlFor="renovation">Rénovation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remplacementChaudiere"
                    checked={formData.typeProjet === 'remplacementChaudiere'}
                    onCheckedChange={(checked) => handleInputChange('typeProjet', checked ? 'remplacementChaudiere' : '')}
                  />
                  <Label htmlFor="remplacementChaudiere">Remplacement chaudière</Label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="typeMaison">Type de maison</Label>
                  <Input
                    id="typeMaison"
                    value={formData.typeMaison}
                    onChange={(e) => handleInputChange('typeMaison', e.target.value)}
                    placeholder="Type de maison"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="zoneClimatique">Zone climatique</Label>
                  <Input
                    id="zoneClimatique"
                    value={formData.zoneClimatique}
                    onChange={(e) => handleInputChange('zoneClimatique', e.target.value)}
                    placeholder="Zone climatique"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="altitude">Altitude</Label>
                  <Input
                    id="altitude"
                    value={formData.altitude}
                    onChange={(e) => handleInputChange('altitude', e.target.value)}
                    placeholder="Altitude (m)"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zones */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#86BC29]">Zones du bâtiment</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {formData.zones.map((zone, index) => (
                <div key={zone.id}>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-gray-700">Zone {index + 1}</h4>
                    {formData.zones.length > 1 && index > 0 && (
                      <Button
                        onClick={() => removeZone(zone.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor={`zone${index}Surface`}>Surface (m²)</Label>
                      <Input
                        id={`zone${index}Surface`}
                        value={zone.surface}
                        onChange={(e) => handleInputChange('zones', formData.zones.map((z, i) => i === index ? { ...z, surface: e.target.value } : z))}
                        placeholder="Surface en m²"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`zone${index}Volume`}>Volume (m³)</Label>
                      <Input
                        id={`zone${index}Volume`}
                        value={zone.volume}
                        onChange={(e) => handleInputChange('zones', formData.zones.map((z, i) => i === index ? { ...z, volume: e.target.value } : z))}
                        placeholder="Volume en m³"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`zone${index}Emetteur`}>Émetteur</Label>
                      <Input
                        id={`zone${index}Emetteur`}
                        value={zone.emetteur}
                        onChange={(e) => handleInputChange('zones', formData.zones.map((z, i) => i === index ? { ...z, emetteur: e.target.value } : z))}
                        placeholder="Type d'émetteur"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  {index < formData.zones.length - 1 && <Separator className="mt-2" />}
                </div>
              ))}
              <div className="flex justify-end pt-1">
                <Button
                  onClick={addZone}
                  variant="outline"
                  size="sm"
                  className="text-green-500 hover:text-green-700"
                >
                  Ajouter une zone
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Déperditions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#86BC29]">Déperditions et températures</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label htmlFor="deperditions">Déperditions (W)</Label>
                <Input
                  id="deperditions"
                  value={formData.deperditions}
                  onChange={(e) => handleInputChange('deperditions', e.target.value)}
                  placeholder="Déperditions en W"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="tExterieure">T° Extérieure</Label>
                <Input
                  id="tExterieure"
                  value={formData.tExterieure}
                  onChange={(e) => handleInputChange('tExterieure', e.target.value)}
                  placeholder="Température extérieure"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="tDepartEau">T° de départ d'eau</Label>
                <Input
                  id="tDepartEau"
                  value={formData.tDepartEau}
                  onChange={(e) => handleInputChange('tDepartEau', e.target.value)}
                  placeholder="Température départ eau"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="tAmbiante">T° Ambiante</Label>
                <Input
                  id="tAmbiante"
                  value={formData.tAmbiante}
                  onChange={(e) => handleInputChange('tAmbiante', e.target.value)}
                  placeholder="Température ambiante"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Type de pompe à chaleur */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#86BC29]">Type de pompe à chaleur</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3 text-gray-700">Type de pompe à chaleur</h4>
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="geothermie"
                      checked={formData.typePAC === 'geothermie'}
                      onCheckedChange={(checked) => handleInputChange('typePAC', checked ? 'geothermie' : '')}
                    />
                    <Label htmlFor="geothermie">Géothermie</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aerothermie"
                      checked={formData.typePAC === 'aerothermie'}
                      onCheckedChange={(checked) => handleInputChange('typePAC', checked ? 'aerothermie' : '')}
                    />
                    <Label htmlFor="aerothermie">Aérothermie</Label>
                  </div>
                </div>
              </div>

              <Separator />

              {formData.typePAC === 'geothermie' && (
                <div>
                  <h4 className="font-semibold mb-3 text-gray-700">Géothermie</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="eauGlycoleEau"
                        checked={formData.geoType === 'eauGlycoleEau'}
                        onCheckedChange={(checked) => handleInputChange('geoType', checked ? 'eauGlycoleEau' : '')}
                      />
                      <Label htmlFor="eauGlycoleEau">Eau Glycolée / Eau</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="solEau"
                        checked={formData.geoType === 'solEau'}
                        onCheckedChange={(checked) => handleInputChange('geoType', checked ? 'solEau' : '')}
                      />
                      <Label htmlFor="solEau">Sol / Eau</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="solSol"
                        checked={formData.geoType === 'solSol'}
                        onCheckedChange={(checked) => handleInputChange('geoType', checked ? 'solSol' : '')}
                      />
                      <Label htmlFor="solSol">Sol / Sol</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="eauGlycoleSol"
                        checked={formData.geoType === 'eauGlycoleSol'}
                        onCheckedChange={(checked) => handleInputChange('geoType', checked ? 'eauGlycoleSol' : '')}
                      />
                      <Label htmlFor="eauGlycoleSol">Eau Glycolée / Sol</Label>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <h4 className="font-semibold mb-3 text-gray-700">Fluide frigorigène</h4>
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="r32"
                      checked={formData.fluideFrigo === 'r32'}
                      onCheckedChange={(checked) => handleInputChange('fluideFrigo', checked ? 'r32' : '')}
                    />
                    <Label htmlFor="r32">R32</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="r410"
                      checked={formData.fluideFrigo === 'r410'}
                      onCheckedChange={(checked) => handleInputChange('fluideFrigo', checked ? 'r410' : '')}
                    />
                    <Label htmlFor="r410">R410</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3 text-gray-700">Gammes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="optipack"
                      checked={formData.optipack}
                      onCheckedChange={(checked) => handleInputChange('optipack', checked as boolean)}
                    />
                    <Label htmlFor="optipack">OPTIPACK</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smartpack"
                      checked={formData.smartpack}
                      onCheckedChange={(checked) => handleInputChange('smartpack', checked as boolean)}
                    />
                    <Label htmlFor="smartpack">SMARTPACK</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="optipackDuo"
                      checked={formData.optipackDuo}
                      onCheckedChange={(checked) => handleInputChange('optipackDuo', checked as boolean)}
                    />
                    <Label htmlFor="optipackDuo">OPTIPACKDUO</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smartpackSupport"
                      checked={formData.smartpackSupport}
                      onCheckedChange={(checked) => handleInputChange('smartpackSupport', checked as boolean)}
                    />
                    <Label htmlFor="smartpackSupport">SMARTPACK SUPPORT</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smartpackHabillage"
                      checked={formData.smartpackHabillage}
                      onCheckedChange={(checked) => handleInputChange('smartpackHabillage', checked as boolean)}
                    />
                    <Label htmlFor="smartpackHabillage">SMARTPACK HABILLAGE</Label>
                  </div>
                </div>
              </div>

              {formData.typePAC === 'aerothermie' && (
                <div>
                  <h4 className="font-semibold mb-3 text-gray-700">Aérothermie</h4>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="airEau"
                        checked={formData.aeroType === 'airEau'}
                        onCheckedChange={(checked) => handleInputChange('aeroType', checked ? 'airEau' : '')}
                      />
                      <Label htmlFor="airEau">Air / Eau</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="monoBloc"
                        checked={formData.aeroConfig === 'monoBloc'}
                        onCheckedChange={(checked) => handleInputChange('aeroConfig', checked ? 'monoBloc' : '')}
                      />
                      <Label htmlFor="monoBloc">Mono Bloc</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="biBloc"
                        checked={formData.aeroConfig === 'biBloc'}
                        onCheckedChange={(checked) => handleInputChange('aeroConfig', checked ? 'biBloc' : '')}
                      />
                      <Label htmlFor="biBloc">Bi Bloc</Label>
                    </div>
                  </div>
                </div>
              )}

              {formData.typePAC === 'geothermie' && (
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-[#86BC29]">Type capteur Géothermie</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Type de capteur :</p>
                          <div className="flex gap-6">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="horizontal"
                                checked={formData.horizontal}
                                onCheckedChange={(checked) => {
                                  handleInputChange('horizontal', checked as boolean);
                                  if (checked) handleInputChange('vertical', false);
                                }}
                              />
                              <Label htmlFor="horizontal">Horizontal</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="vertical"
                                checked={formData.vertical}
                                onCheckedChange={(checked) => {
                                  handleInputChange('vertical', checked as boolean);
                                  if (checked) handleInputChange('horizontal', false);
                                }}
                              />
                              <Label htmlFor="vertical">Vertical</Label>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Charge :</p>
                          <div className="flex gap-6">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="charge"
                                checked={formData.charge}
                                onCheckedChange={(checked) => {
                                  handleInputChange('charge', checked as boolean);
                                  if (checked) handleInputChange('nonCharge', false);
                                }}
                              />
                              <Label htmlFor="charge">Chargé</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="nonCharge"
                                checked={formData.nonCharge}
                                onCheckedChange={(checked) => {
                                  handleInputChange('nonCharge', checked as boolean);
                                  if (checked) handleInputChange('charge', false);
                                }}
                              />
                              <Label htmlFor="nonCharge">Non chargé</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="eauNappe"
                          checked={formData.eauNappe}
                          onCheckedChange={(checked) => handleInputChange('eauNappe', checked as boolean)}
                        />
                        <Label htmlFor="eauNappe">Eau de nappe</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Accessoires et capteurs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {formData.typePAC === 'aerothermie' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-[#86BC29]">Accessoires Aérothermie</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="supportsMuraux"
                      checked={formData.supportsMuraux}
                      onCheckedChange={(checked) => handleInputChange('supportsMuraux', checked as boolean)}
                    />
                    <Label htmlFor="supportsMuraux">Supports muraux</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="supportsSol"
                      checked={formData.supportsSol}
                      onCheckedChange={(checked) => handleInputChange('supportsSol', checked as boolean)}
                    />
                    <Label htmlFor="supportsSol">Supports sol</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-[#86BC29]">Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="kitPiscine"
                    checked={formData.kitPiscine}
                    onCheckedChange={(checked) => handleInputChange('kitPiscine', checked as boolean)}
                  />
                  <Label htmlFor="kitPiscine">Kit piscine</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reversible"
                    checked={formData.reversible}
                    onCheckedChange={(checked) => handleInputChange('reversible', checked as boolean)}
                  />
                  <Label htmlFor="reversible">Réversible</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="kitFreecooling"
                    checked={formData.kitFreecooling}
                    onCheckedChange={(checked) => handleInputChange('kitFreecooling', checked as boolean)}
                  />
                  <Label htmlFor="kitFreecooling">Kit Freecooling</Label>
                </div>
              </div>

              <Separator />

              {formData.kitPiscine && (
                <>
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-700">Dimensions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="longueur">Longueur (m)</Label>
                        <Input
                          id="longueur"
                          value={formData.longueur}
                          onChange={(e) => handleInputChange('longueur', e.target.value)}
                          placeholder="Longueur"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="largeur">Largeur (m)</Label>
                        <Input
                          id="largeur"
                          value={formData.largeur}
                          onChange={(e) => handleInputChange('largeur', e.target.value)}
                          placeholder="Largeur"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="profondeur">Profondeur (m)</Label>
                        <Input
                          id="profondeur"
                          value={formData.profondeur}
                          onChange={(e) => handleInputChange('profondeur', e.target.value)}
                          placeholder="Profondeur"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3 text-gray-700">Information bassin / Fonctionnement</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Type de bassin :</p>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="prive"
                              checked={formData.prive}
                              onCheckedChange={(checked) => {
                                handleInputChange('prive', checked as boolean);
                                if (checked) handleInputChange('public', false);
                              }}
                            />
                            <Label htmlFor="prive">Privé</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="public"
                              checked={formData.public}
                              onCheckedChange={(checked) => {
                                handleInputChange('public', checked as boolean);
                                if (checked) handleInputChange('prive', false);
                              }}
                            />
                            <Label htmlFor="public">Public</Label>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Fonctionnement :</p>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="estivale"
                              checked={formData.estivale}
                              onCheckedChange={(checked) => {
                                handleInputChange('estivale', checked as boolean);
                                if (checked) handleInputChange('annuel', false);
                              }}
                            />
                            <Label htmlFor="estivale">Estivale</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="annuel"
                              checked={formData.annuel}
                              onCheckedChange={(checked) => {
                                handleInputChange('annuel', checked as boolean);
                                if (checked) handleInputChange('estivale', false);
                              }}
                            />
                            <Label htmlFor="annuel">Annuel</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />
                </>
              )}

              <div>
                <h4 className="font-semibold mb-3 text-gray-700">Résistances électriques</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="kitResistanceElectrique"
                      checked={formData.kitResistanceElectrique}
                      onCheckedChange={(checked) => handleInputChange('kitResistanceElectrique', checked as boolean)}
                    />
                    <Label htmlFor="kitResistanceElectrique">Kit résistance électrique (Monté dans le pac)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ballonTampon"
                      checked={formData.ballonTampon}
                      onCheckedChange={(checked) => handleInputChange('ballonTampon', checked as boolean)}
                    />
                    <Label htmlFor="ballonTampon">Ballon tampon</Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="resistanceElectriqueAMonter"
                        checked={formData.resistanceElectriqueAMonter}
                        onCheckedChange={(checked) => handleInputChange('resistanceElectriqueAMonter', checked as boolean)}
                      />
                      <Label htmlFor="resistanceElectriqueAMonter">Résistance électrique (À monter dans le tampon)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="resistanceElectriqueTuyauterie"
                        checked={formData.resistanceElectriqueTuyauterie}
                        onCheckedChange={(checked) => handleInputChange('resistanceElectriqueTuyauterie', checked as boolean)}
                      />
                      <Label htmlFor="resistanceElectriqueTuyauterie">Résistance électrique (À monter sur la tuyauterie)</Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="puissanceResistance1">Puissance résistance 1</Label>
                      <Input
                        id="puissanceResistance1"
                        value={formData.puissanceResistance1}
                        onChange={(e) => handleInputChange('puissanceResistance1', e.target.value)}
                        placeholder="Puissance (kW)"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="puissanceResistance2">Puissance résistance 2</Label>
                      <Input
                        id="puissanceResistance2"
                        value={formData.puissanceResistance2}
                        onChange={(e) => handleInputChange('puissanceResistance2', e.target.value)}
                        placeholder="Puissance (kW)"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3 text-gray-700">Régulation</h4>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="thermostat"
                      checked={formData.thermostat}
                      onCheckedChange={(checked) => handleInputChange('thermostat', checked as boolean)}
                    />
                    <Label htmlFor="thermostat">Thermostat</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="radio"
                      checked={formData.radio}
                      onCheckedChange={(checked) => handleInputChange('radio', checked as boolean)}
                    />
                    <Label htmlFor="radio">Radio</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filaire"
                      checked={formData.filaire}
                      onCheckedChange={(checked) => handleInputChange('filaire', checked as boolean)}
                    />
                    <Label htmlFor="filaire">Filaire</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="connecte"
                      checked={formData.connecte}
                      onCheckedChange={(checked) => handleInputChange('connecte', checked as boolean)}
                    />
                    <Label htmlFor="connecte">Connecté</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="loiEau"
                      checked={formData.loiEau}
                      onCheckedChange={(checked) => handleInputChange('loiEau', checked as boolean)}
                    />
                    <Label htmlFor="loiEau">Loi d'eau</Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eau Chaude Sanitaire */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-[#86BC29]">Eau Chaude Sanitaire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ecsOui"
                    checked={formData.ecsOui}
                    onCheckedChange={(checked) => {
                      handleInputChange('ecsOui', checked as boolean);
                      if (checked) handleInputChange('ecsNon', false);
                    }}
                  />
                  <Label htmlFor="ecsOui">Oui</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ecsNon"
                    checked={formData.ecsNon}
                    onCheckedChange={(checked) => {
                      handleInputChange('ecsNon', checked as boolean);
                      if (checked) handleInputChange('ecsOui', false);
                    }}
                  />
                  <Label htmlFor="ecsNon">Non</Label>
                </div>
              </div>
              
              {/* Champs ECS - affichés seulement si ECS activé */}
              {formData.ecsOui && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombrePersonnes">Nombre de personnes</Label>
                    <Input
                      id="nombrePersonnes"
                      value={formData.nombrePersonnes}
                      onChange={(e) => handleInputChange('nombrePersonnes', e.target.value)}
                      placeholder="Nombre de personnes"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nombrePointsTirage">Nombre de points de tirage</Label>
                    <Input
                      id="nombrePointsTirage"
                      value={formData.nombrePointsTirage}
                      onChange={(e) => handleInputChange('nombrePointsTirage', e.target.value)}
                      placeholder="Nombre de points de tirage"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bouton d'envoi */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#86BC29] hover:bg-[#86BC29]/90 text-white px-8 py-3 text-lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Envoyer la demande de devis
              </>
            )}
          </Button>
        </div>

        {/* Modal de sélection d'agent commercial */}
        {showAgentSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#86BC29]">
                  <User className="inline mr-2 h-5 w-5" />
                  Sélectionner un agent commercial
                </h3>
                <button
                  onClick={() => setShowAgentSelector(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Sélection de l'agent */}
                <div>
                  <Label className="text-sm font-medium">Agent commercial :</Label>
                  <div className="mt-2 space-y-2">
                    {agents.map((agent) => (
                      <div key={agent.id} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={agent.id}
                          name="agent"
                          value={agent.id}
                          checked={selectedAgent === agent.id}
                          onChange={(e) => setSelectedAgent(e.target.value)}
                          className="text-[#86BC29] focus:ring-[#86BC29]"
                        />
                        <Label htmlFor={agent.id} className="cursor-pointer">
                          {agent.name} ({agent.email})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Option copie email */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox
                      id="copyToUser"
                      checked={copyToUser}
                      onCheckedChange={(checked) => setCopyToUser(checked as boolean)}
                    />
                    <Label htmlFor="copyToUser" className="cursor-pointer">
                      <Mail className="inline mr-1 h-4 w-4" />
                      Recevoir une copie du mail
                    </Label>
                  </div>
                  
                  {copyToUser && (
                    <div>
                      <Label htmlFor="userEmail" className="text-sm">Votre adresse email :</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="votre.email@exemple.com"
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowAgentSelector(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSendEmail}
                    disabled={isSubmitting || !selectedAgent}
                    className="flex-1 bg-[#86BC29] hover:bg-[#86BC29]/90"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Envoyer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DemandeDevisPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <DemandeDevisContent />
    </Suspense>
  );
}
