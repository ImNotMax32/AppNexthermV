'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Search, 
  FileText, 
  Download, 
  Eye, 
  Filter, 
  Clock, 
  FileSpreadsheet, 
  FileImage, 
  Presentation, 
  FileCheck,
  Table2
} from "lucide-react";

const categories = [
  "Tous",
  "Eau/Eau",
  "Sol/Eau",
  "Sol/Sol",
  "Air/Eau",
  "Eau glycolée/Sol",
  "Tarifs",
  "Plaquettes",
  "Ballon Tampon",
  "Ballon ECS"
];

// Styles pour les catégories
const categoryColors = {
  "Eau/Eau": "bg-blue-50",
  "Sol/Eau": "bg-green-50",
  "Sol/Sol": "bg-amber-50",
  "Eau glycolée/Sol": "bg-orange-50",
  "Ballon Tampon": "bg-red-50",
  "Ballon ECS": "bg-purple-50"
};

// Données des documents commerciaux
const documents = [
  // Eau/Eau
  {
    id: 1,
    title: "OPTIPACK 2 - R32",
    category: "Eau/Eau",
    date: "04/2024",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur OPTIPACK 2 R32 Eau/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/04/OPTIPACK2_R32_FP-EGE-OPTI2-AA-02-2023-V2-VF.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 2,
    title: "OPTIPACK - R410",
    category: "Eau/Eau",
    date: "03/2023",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur OPTIPACK R410 Eau/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/03/OPTIPACK_R410_FP-EGE-OPTI2-AA-02-2023-V2-VF.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 3,
    title: "OPTIPACKDUO - R410",
    category: "Eau/Eau",
    date: "03/2023",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur OPTIPACKDUO R410 Eau/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/03/OPTIPACKDUO_R410_FP-EGE-OPTIDUO2-AA-02-2023-VF.1.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 4,
    title: "OPTIPACKDUO 2 - R32",
    category: "Eau/Eau",
    date: "03/2023",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur OPTIPACKDUO 2 R32 Eau/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/03/OPTIPACKDUO2_R32_FP-EGE-OPTIDUO2-AA-02-2023-VF-2.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 5,
    title: "SMARTPACK 2 - R410",
    category: "Eau/Eau",
    date: "07/2023",
    version: "AB",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur SMARTPACK 2 R410 Eau/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/07/SMARTPACK2_R410_FP-EGE-SP2-AB-07-202389.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 6,
    title: "SMARTPACK 3 - R32",
    category: "Eau/Eau",
    date: "03/2023",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur SMARTPACK 3 R32 Eau/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/03/SMARTPACK3_R32_FP-EGE-SP3-AA-02-2023-VF.3.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 7,
    title: "SMARTPACK GP - R410",
    category: "Eau/Eau",
    date: "04/2024",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur SMARTPACK GP R410 Eau/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/04/SMARTPACK_GP_R410A_FP-EGE-SP2-GP-AA-02-2023-VF.1.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 8,
    title: "SMARTPACK HT - R410",
    category: "Eau/Eau",
    date: "03/2023",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur SMARTPACK HT R410 Eau/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/03/SMARTPACK-HT-VF.1.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },

  // Sol/Eau
  {
    id: 9,
    title: "OPTIPACK 2 - R32",
    category: "Sol/Eau",
    date: "03/2023",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur OPTIPACK 2 R32 Sol/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/03/OPTIPACK2_R32_FP-SE-OPTI2-AA-02-2023-V3.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 10,
    title: "OPTIPACK - R410",
    category: "Sol/Eau",
    date: "03/2023",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur OPTIPACK R410 Sol/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/03/OPTIPACK_R3410_FP-SE-OPTI-AA-02-2023-V4.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 11,
    title: "OPTIPACKDUO 2 - R32",
    category: "Sol/Eau",
    date: "03/2023",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur OPTIPACKDUO 2 R32 Sol/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/03/OPTIPACKDUO2_R32_FP-SE-OPTIDUO2-AA-02-2023-V4.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 12,
    title: "OPTIPACKDUO - R410",
    category: "Sol/Eau",
    date: "03/2023",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur OPTIPACKDUO R410 Sol/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/03/OPTIPACKDUO_R410_FP-SE-OPTIDUO-AA-02-2023-V4.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 13,
    title: "SMARTPACK 2 - R410",
    category: "Sol/Eau",
    date: "09/2023",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur SMARTPACK 2 R410 Sol/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/09/SMARTPACK2_R410_FP-SE-SP2-AA-02-2023-VF.3.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 14,
    title: "SMARTPACK 3 - R32",
    category: "Sol/Eau",
    date: "09/2023",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur SMARTPACK 3 R32 Sol/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/09/SMARTPACK3_R32_FP-SE-SP3-AA-02-2023-V2.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },

  // Sol/Sol
  {
    id: 15,
    title: "OPTIPACK - R410",
    category: "Sol/Sol",
    date: "02/2024",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur OPTIPACK R410 Sol/Sol",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/02/OPTIPACK_R410_FP-SS-OPTI-AA-02-2024.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 16,
    title: "OPTIPACK 2 - R32",
    category: "Sol/Sol",
    date: "02/2024",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur OPTIPACK 2 R32 Sol/Sol",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/02/OPTIPACK2_R32_FP-SS-OPTI2-AA-02-2024-VF.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 17,
    title: "SMARTPACK 2 - R410",
    category: "Sol/Sol",
    date: "09/2023",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur SMARTPACK 2 R410 Sol/Sol",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/09/SMARTPACK2_R410_FP-SS-SP3-AA-02-2023-VF.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 18,
    title: "SMARTPACK 3 - R32",
    category: "Sol/Sol",
    date: "09/2023",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur SMARTPACK 3 R32 Sol/Sol",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/09/SMARTPACK3_R32_FP-SS-SP3-AA-02-2023-VF.5.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },

  // Eau glycolée/Sol
  {
    id: 19,
    title: "SMARTPACK 2 - R410",
    category: "Eau glycolée/Sol",
    date: "03/2023",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur SMARTPACK 2 R410 Eau glycolée/Sol",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/03/SMARTPACK2_R410_FP-EGS-SP3-AA-02-2023-V1.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 20,
    title: "SMARTPACK 3 - R32",
    category: "Eau glycolée/Sol",
    date: "03/2023",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur SMARTPACK 3 R32 Eau glycolée/Sol",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/03/SMARTPACK3_R32_FP-EGE-SP3-AA-02-2023-VF.5.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },

  // Air/Eau
  {
    id: 21,
    title: "R/OPACK 3 - R32",
    category: "Air/Eau",
    date: "11/2020",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur R/OPACK 3 R32 Air/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/03/Fiche-ROPACK3-Ind-AE-AA-11-2020.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },

  // Ballon ECS
  {
    id: 22,
    title: "Ballon ECS 200L",
    category: "Ballon ECS",
    date: "06/2024",
    version: "AA",
    gamme: "Ballons",
    marché: "Résidentiel",
    description: "Documentation commerciale Ballon ECS 200L",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/06/200-L-ECS.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 23,
    title: "Ballon ECS 300L",
    category: "Ballon ECS",
    date: "06/2024",
    version: "AA",
    gamme: "Ballons",
    marché: "Résidentiel",
    description: "Documentation commerciale Ballon ECS 300L",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/06/300-L-ECS.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 24,
    title: "Ballon ECS 500L",
    category: "Ballon ECS",
    date: "06/2024",
    version: "AA",
    gamme: "Ballons",
    marché: "Résidentiel",
    description: "Documentation commerciale Ballon ECS 500L",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/06/500-L-ECS.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },

  // Ballon Tampon
  {
    id: 25,
    title: "Ballon Tampon 200L",
    category: "Ballon Tampon",
    date: "06/2024",
    version: "AA",
    gamme: "Ballons",
    marché: "Résidentiel",
    description: "Documentation commerciale Ballon Tampon 200L",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/06/Fiche-tampon-200L-chaud-seul-.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 26,
    title: "Ballon Tampon 300L",
    category: "Ballon Tampon",
    date: "06/2024",
    version: "AA",
    gamme: "Ballons",
    marché: "Résidentiel",
    description: "Documentation commerciale Ballon Tampon 300L",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/06/Fiche-tampon-300L-chaud-seul-.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 27,
    title: "Ballon Tampon 500L",
    category: "Ballon Tampon",
    date: "06/2024",
    version: "AA",
    gamme: "Ballons",
    marché: "Résidentiel",
    description: "Documentation commerciale Ballon Tampon 500L",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/06/Fiche-tampon-500L-chaud-seul-.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 28,
    title: "Ballon Tampon 800L",
    category: "Ballon Tampon",
    date: "06/2024",
    version: "AA",
    gamme: "Ballons",
    marché: "Résidentiel",
    description: "Documentation commerciale Ballon Tampon 800L",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/06/Fiche-tampon-800L-chaud-seul-.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 29,
    title: "Ballon Tampon 1000L",
    category: "Ballon Tampon",
    date: "06/2024",
    version: "AA",
    gamme: "Ballons",
    marché: "Résidentiel",
    description: "Documentation commerciale Ballon Tampon 1000L",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/06/Fiche-tampon-1000L-chaud-seul-.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 30,
    title: "Ballon Tampon 1500L",
    category: "Ballon Tampon",
    date: "06/2024",
    version: "AA",
    gamme: "Ballons",
    marché: "Résidentiel",
    description: "Documentation commerciale Ballon Tampon 1500L",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/06/Fiche-tampon-1500L-chaud-seul-.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 31,
    title: "Ballon Tampon 2000L",
    category: "Ballon Tampon",
    date: "06/2024",
    version: "AA",
    gamme: "Ballons",
    marché: "Résidentiel",
    description: "Documentation commerciale Ballon Tampon 2000L",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/06/Fiche-tampon-2000L-chaud-seul-.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },

  // Autres catégories à compléter...
];

const getIconForCategory = (category: string) => {
  switch(category) {
    case "Tarifs":
      return <FileSpreadsheet />;
    case "Plaquettes":
      return <Presentation />;
    case "Ballon tampon":
    case "Ballon ECS":
      return <FileImage />;
    default:
      return <FileText />;  // Pour toutes les PAC
  }
};

export default function DocumentsCommerciaux() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  // Filtrer les documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }));

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Documentation Commerciale</h1>
        <p className="text-gray-500">Retrouvez ici toute la documentation commerciale de nos produits</p>
      </div>

      {/* Filtres */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un document..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filtres par catégorie */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer ${
                    selectedCategory === category 
                      ? "bg-[#86BC29] hover:bg-[#75a625]" 
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des documents */}
      <div className="space-y-4">
        {filteredDocuments.map((doc) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`${categoryColors[doc.category] || ''} transition-colors`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  {/* Informations principales */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      {getIconForCategory(doc.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{doc.title}</h3>
                        <Badge variant="outline">{doc.category}</Badge>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {doc.description}
                      </div>
                    </div>
                  </div>

                  {/* Spécifications et actions */}
                  <div className="flex items-center gap-8">
                    <div className="text-sm">
                      <div className="text-gray-500">Version</div>
                      <div>{doc.version} ({doc.date})</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-gray-500">Taille</div>
                      <div>{doc.taille}</div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => window.open(doc.url, '_blank')}
                        className="h-9"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </Button>
                      <a 
                        href={doc.url}
                        download={doc.url.split('/').pop()}
                        className="inline-flex h-9 px-4 py-2 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-[#86BC29] hover:bg-[#75a625] text-white transition-colors"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredDocuments.length === 0 && (
        <Card className="p-8 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucun document trouvé</p>
        </Card>
      )}
    </div>
  );
}