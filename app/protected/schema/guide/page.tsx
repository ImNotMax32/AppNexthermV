'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Search, FileText, Download, Eye } from "lucide-react";

const productFamilies = [
    "Tous",
    "Eau glycolée/Eau",
    "Sol/Sol",
    "Sol/Eau",
    "Eau/Sol",
    "Air/Eau" 
  ];


const guides = [
  // Sol/Sol
  {
    id: 1,
    title: "OPTI S/S R410A",
    family: "Sol/Sol",
    date: "03/2024",
    version: "AA",
    description: "Guide d'installation pour pompe à chaleur OPTI Sol/Sol R410A",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/03/Guide-dinstallation-OPTI-SOL-SOL-R410A.pdf",
  },
  {
    id: 2,
    title: "OPTIPACK2 S/S R32",
    family: "Sol/Sol",
    date: "03/2024",
    version: "AA",
    description: "Guide d'installation pour pompe à chaleur OPTIPACK2 Sol/Sol R32",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/03/Guide-dinstallation-OPTIPACK2-SOL-SOL-R32-ind-AA-1.pdf",
  },
  {
    id: 3,
    title: "SMARTPACK2 S/S R410A",
    family: "Sol/Sol",
    date: "04/2023",
    version: "AF",
    description: "Guide d'installation pour pompe à chaleur SMARTPACK2 Sol/Sol R410A",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/04/Guide-dinstallation-SMARTPACK2-SOL-SOL-R410-ind-AF.pdf",
  },
  {
    id: 4,
    title: "SMARTPACK3 S/S R32",
    family: "Sol/Sol",
    date: "04/2023",
    version: "AD",
    description: "Guide d'installation pour pompe à chaleur SMARTPACK3 Sol/Sol R32",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/04/Guide-dinstallation-SMARTPACK3-SOL-SOL-R32-ind-AD.pdf",
  },

  // Eau glycolée/Eau
  {
    id: 5,
    title: "OPTIPACK2 EG/E R32",
    family: "Eau glycolée/Eau",
    date: "02/2025",
    version: "AE",
    description: "Guide d'installation pour pompe à chaleur OPTIPACK2 Eau glycolée/Eau R32",
    url: "https://www.nextherm.fr/wp-content/uploads/2025/02/191125-Guide-dinstallation-OPTIPACK2-OGO-R32-ind-AE.pdf",
  },
  {
    id: 6,
    title: "OPTIPACKDUO2 EG/E R32",
    family: "Eau glycolée/Eau",
    date: "02/2025",
    version: "AE",
    description: "Guide d'installation pour pompe à chaleur OPTIPACKDUO2 Eau glycolée/Eau R32",
    url: "https://www.nextherm.fr/wp-content/uploads/2025/02/Guide-dinstallation-OPTIPACKDUO2-Eau-Glycolee-Eau-R32-ind-AE.pdf",
  },
  {
    id: 7,
    title: "OPTIPACKDUO EG/E R410A",
    family: "Eau glycolée/Eau",
    date: "02/2025",
    version: "AL",
    description: "Guide d'installation pour pompe à chaleur OPTIPACKDUO Eau glycolée/Eau R410A",
    url: "https://www.nextherm.fr/wp-content/uploads/2025/02/Guide-dinstallation-OPTIPACKDUO-Eau-Glycolee-Eau-ind-AL.pdf",
  },
  {
    id: 8,
    title: "SMARTPACK2 GP EG/E R410A",
    family: "Eau glycolée/Eau",
    date: "02/2025",
    version: "AD",
    description: "Guide d'installation pour pompe à chaleur SMARTPACK2 GP Eau glycolée/Eau R410A",
    url: "https://www.nextherm.fr/wp-content/uploads/2025/02/Guide-dinstallation-SMARTPACK2-GP-Eau-Glycolee-Eau-ind-AD.pdf",
  },
  {
    id: 9,
    title: "SMARTPACK2 HT EG/E R32",
    family: "Eau glycolée/Eau",
    date: "02/2025",
    version: "AD",
    description: "Guide d'installation pour pompe à chaleur SMARTPACK2 HT Eau glycolée/Eau R32",
    url: "https://www.nextherm.fr/wp-content/uploads/2025/02/Guide_installation_SMARTPACK2_Eau-Glycolee-Eau-haute-temperature_ind_AD.pdf",
  },
  {
    id: 10,
    title: "SMARTPACK3 EG/E R32",
    family: "Eau glycolée/Eau",
    date: "02/2025",
    version: "AF",
    description: "Guide d'installation pour pompe à chaleur SMARTPACK3 Eau glycolée/Eau R32",
    url: "https://www.nextherm.fr/wp-content/uploads/2025/02/Guide-dinstallation-SMARTPACK3-Eau-Glycolee-Eau-R32-ind-AF.pdf",
  },
  {
    id: 11,
    title: "OPTIPACK E/E",
    family: "Eau glycolée/Eau",
    date: "02/2025",
    version: "AT",
    description: "Guide d'installation pour pompe à chaleur OPTIPACK Eau/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2025/02/Guide-dinstallation-OPTIPACK-EAU-EAU-ind-AT.pdf",
  },
  {
    id: 12,
    title: "SMARTPACK2 E/E R410",
    family: "Eau glycolée/Eau",
    date: "02/2025",
    version: "AR",
    description: "Guide d'installation pour pompe à chaleur SMARTPACK2 Eau/Eau R410",
    url: "https://www.nextherm.fr/wp-content/uploads/2025/02/Guide_installation_SMARTPACK2_EAU_EAU_ind_AR-modif.pdf",
  },

  // Sol/Eau
  {
    id: 13,
    title: "OPTIPACK2 S/E R32",
    family: "Sol/Eau",
    date: "07/2022",
    version: "AC",
    description: "Guide d'installation pour pompe à chaleur OPTIPACK2 Sol/Eau R32",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/04/Guide-dinstallation-OPTIPACK2-SOL-EAU-R32-juillet-2022-ind-AC.pdf",
  },
  {
    id: 14,
    title: "OPTIPACKDUO2 S/E R32",
    family: "Sol/Eau",
    date: "07/2022",
    version: "AB",
    description: "Guide d'installation pour pompe à chaleur OPTIPACKDUO2 Sol/Eau R32",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/04/Guide-dinstallation-OPTIPACKDUO2-SOL-EAU-R32-juillet-2022-ind-AB-.pdf",
  },
  {
    id: 15,
    title: "OPTIPACKDUO S/E R410A",
    family: "Sol/Eau",
    date: "04/2023",
    version: "AE",
    description: "Guide d'installation pour pompe à chaleur OPTIPACKDUO Sol/Eau R410A",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/04/Guide-dinstallation-OPTIPACKDUO-SOL-EAU-R410-ind-AE.pdf",
  },
  {
    id: 16,
    title: "SMARTPACK2 S/E R410A",
    family: "Sol/Eau",
    date: "04/2023",
    version: "AH",
    description: "Guide d'installation pour pompe à chaleur SMARTPACK2 Sol/Eau R410A",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/04/Guide-dinstallation-SMARTPACK2-SOL-EAU-R410-ind-AH.pdf",
  },
  {
    id: 17,
    title: "SMARTPACK3 S/E R32",
    family: "Sol/Eau",
    date: "07/2022",
    version: "AB",
    description: "Guide d'installation pour pompe à chaleur SMARTPACK3 Sol/Eau R32",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/04/Guide-dinstallation-SMARTPACK3-SOL-EAU-R32-Juillet-2022-ind-AB-.pdf",
  },
  {
    id: 21, 
    title: "OPTIPACK S/E R410",
    family: "Sol/Eau",
    date: "04/2023",
    version: "AQ",
    description: "Guide d'installation pour pompe à chaleur OPTIPACK Sol/Eau R410",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/04/Guide-dinstallation-OPTIPACK-SOL-EAU-R410-ind-AQ.pdf",
  },

  
  // Eau/Sol
  {
    id: 19,
    title: "SMARTPACK2 EG/S R410",
    family: "Eau/Sol",
    date: "01/2024",
    version: "AB",
    description: "Guide d'installation pour pompe à chaleur SMARTPACK2 Eau glycolée/Sol R410",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/01/Guide_installation_EAU_SOL-R410_ind_AB.pdf",
  },
  {
    id: 22,
    title: "SMARTPACK3 EG/S R32",
    family: "Eau/Sol",
    date: "01/2024",
    version: "AB",
    description: "Guide d'installation pour pompe à chaleur SMARTPACK3 Eau glycolée/Sol R32",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/01/Guide_installation_EAU_SOL-R32_ind_AB.pdf",
  },

  {
    id: 23,
    title: "ROPACK3 A/E R32",
    family: "Air/Eau",
    date: "02/2024",
    version: "AA",
    description: "Guide d'installation pour pompe à chaleur ROPACK3 Air/Eau R32",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/02/ROPACK3-NEXTHERM-Notice-technique-.pdf",
  },
];


export default function InstallationGuides() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFamily, setSelectedFamily] = useState('Tous');
  
    // Fonction de tri alphabétique pour les guides
    const sortGuides = (a: any, b: any) => {
      return a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' });
    };
  
    // Filtrer et trier les guides
    const filteredGuides = guides
      .filter(guide => {
        const matchesSearch = 
          guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guide.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFamily = selectedFamily === 'Tous' || guide.family === selectedFamily;
        return matchesSearch && matchesFamily;
      })
      .sort(sortGuides);
  
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-6 max-w-7xl"
      >
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Guides d'Installation</h1>
          <p className="text-gray-600">
            Consultez nos guides d'installation classés par famille de produits
          </p>
        </div>
  
        {/* Barre de recherche et filtres */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un guide..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Filtres par famille dans l'ordre personnalisé */}
              <div className="flex flex-wrap gap-2">
                {productFamilies.map((family) => (
                  <Badge
                    key={family}
                    variant={selectedFamily === family ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedFamily === family 
                        ? "bg-[#86BC29] hover:bg-[#75a625]" 
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedFamily(family)}
                  >
                    {family}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Liste des guides triés */}
      <div className="space-y-4">
        {filteredGuides.map((guide) => (
          <Card key={guide.id} className="hover:bg-gray-50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                {/* Informations principales */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-[#86BC29]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{guide.title}</h3>
                      <Badge variant="outline">{guide.family}</Badge>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {guide.description}
                    </div>
                  </div>
                </div>

                {/* Version et date */}
                <div className="text-sm">
                  <div className="text-gray-500">Version</div>
                  <div>{guide.version} ({guide.date})</div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => window.open(guide.url, '_blank')}
                    className="h-9"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir
                  </Button>
                  <a 
                    href={guide.url}
                    download={guide.url.split('/').pop()}
                    className="inline-flex h-9 px-4 py-2 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-[#86BC29] hover:bg-[#75a625] text-white transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredGuides.length === 0 && (
        <Card className="p-8 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucun guide trouvé</p>
        </Card>
      )}
    </motion.div>
  );
}