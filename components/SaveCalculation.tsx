import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check, X } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from '@/utils/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SaveCalculationProps {
  onSave?: (calculationData: any) => Promise<void>;
}

const SaveCalculation: React.FC<SaveCalculationProps> = ({ onSave }) => {
  const supabase = createClient();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const collectStorageData = () => {
    console.log("Données du localStorage :");
    console.log("kit_piscine:", localStorage.getItem('kit_piscine'));
    console.log("kit_freecooling:", localStorage.getItem('kit_freecooling'));
    console.log("kit_ECS:", localStorage.getItem('kit_ECS'));
    console.log("capteur_type:", localStorage.getItem('capteur_type')); // Ajout log
    console.log("eau_nappe:", localStorage.getItem('eau_nappe')); // Ajout log
  
    let selectedProduct = null;
    try {
      const productString = localStorage.getItem('selected_product');
      if (productString) {
        selectedProduct = JSON.parse(productString);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error);
    }
  
    const buildingData = {
      constructionYear: localStorage.getItem('Annee_de_construction'),
      buildingType: localStorage.getItem('Type_de_construction'),
      surfaceRDC: localStorage.getItem('Surface_RDC'),
      surface1erEtage: localStorage.getItem('Surface_1er_etage'),
      surface2eEtage: localStorage.getItem('Surface_2e_etage'),
      structure: localStorage.getItem('Structure_de_la_construction'),
      groundStructure: localStorage.getItem('Structure_du_sol'),
      windowSurface: localStorage.getItem('Surface_de_vitrage'),
      adjacency: localStorage.getItem('Mitoyennete'),
      department: localStorage.getItem('Departement'),
      heatLoss: localStorage.getItem('ResultatDeperdition'),
      totalSurface: parseFloat(localStorage.getItem('Surface_RDC') || '0') +
                    parseFloat(localStorage.getItem('Surface_1er_etage') || '0') +
                    parseFloat(localStorage.getItem('Surface_2e_etage') || '0'),
      ventilation: localStorage.getItem('Ventilation'),
      heatingTemp: localStorage.getItem('Temperature_de_chauffage'),
      poolKit: localStorage.getItem('kit_piscine'),
      freecoolingKit: localStorage.getItem('kit_freecooling'),
      hotWater: localStorage.getItem('kit_ECS')
    };
  
    const heatingData = {
      heatingTemp: localStorage.getItem('Temperature_de_chauffage'),
      ventilation: localStorage.getItem('Ventilation'),
      heatLoss: localStorage.getItem('ResultatDeperdition') || 
                localStorage.getItem('ResultatDeperdition1'),
      windowHeatLoss: localStorage.getItem('windowHeatLoss'),
      roofHeatLoss: localStorage.getItem('roofHeatLoss'),
      floorHeatLoss: localStorage.getItem('FloorHeatLoss'),
      airNeufLoss: localStorage.getItem('airNeufLoss'),
      thermalBridgeLoss: localStorage.getItem('thermalBridgeLoss'),
    };
  
    const heatPumpData = {
      type: localStorage.getItem('type_pac'),
      system: localStorage.getItem('systeme_pac'),
      emitterType: localStorage.getItem('emetteur_type'),
      radiatorTemp: localStorage.getItem('temp_radiateur'),
      floorTemp: localStorage.getItem('temp_plancher'),
      captorType: localStorage.getItem('capteur_type'), // Ajout du type de capteur
      waterTable: localStorage.getItem('eau_nappe'), // Ajout de l'eau de nappe
      support: localStorage.getItem('support_aerothermie') // Ajout du support aérothermie
    };
  
    console.log("Données envoyées :", {
      building: buildingData,
      heatPump: heatPumpData
    });
  
    return {
      projectName,
      parameters: {
        building: buildingData,
        heating: heatingData,
        heatPump: heatPumpData,
        selectedProduct,
        clientInfo: {
          name: '',
          address: '',
          phone: '',
          city: '',
          postalCode: ''
        },
        installerInfo: {
          company: '',
          contact: '',
          email: '',
          phone: '',
        }
      }
    };
  };
  
  const handleSave = async () => {
    if (!projectName.trim()) {
      setError("Veuillez entrer un nom de projet");
      return;
    }
  
    setIsSaving(true);
    setError(null);
  
    try {
      const { data: { session } } = await supabase.auth.getSession();
  
      if (!session) {
        throw new Error("Session expirée, veuillez vous reconnecter");
      }
  
      const calculationData = collectStorageData();
      
      const { data, error: insertError } = await supabase
        .from('dimensionnements')
        .insert({
          user_id: session.user.id,
          project_name: calculationData.projectName,
          parameters: calculationData.parameters
        })
        .select()
        .single();
  
      if (insertError) {
        throw insertError;
      }
  
      setShowDialog(false);
      
      toast({
        description: "Le projet a été sauvegardé avec succès",
      });
  
      // Appeler onSave avec les données uniquement si la sauvegarde a réussi
      if (onSave && data) {
        await onSave(data);
      }
  
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la sauvegarde";
      toast({
        variant: "destructive",
        description: errorMessage,
      });
      
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDialog(true)}
        className="px-6 py-3 bg-[#86BC29] text-white rounded-lg font-medium flex items-center shadow-lg hover:bg-[#75a625] transition-colors"
      >
        <Save className="w-5 h-5 mr-2" />
        Enregistrer
      </motion.button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#86BC29]">
              Enregistrer le projet
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="projectName" className="text-sm font-medium">
                Nom du projet
              </label>
              <input
                id="projectName"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#86BC29] focus:border-transparent"
                placeholder="Entrez un nom pour ce projet"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <div className="flex justify-end space-x-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Annuler
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={isSaving}
                className={`px-4 py-2 bg-[#86BC29] text-white rounded-md hover:bg-[#75a625] 
                  ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Save className="h-4 w-4" />
                    </motion.div>
                    Enregistrement...
                  </span>
                ) : (
                  'Enregistrer'
                )}
              </motion.button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SaveCalculation;