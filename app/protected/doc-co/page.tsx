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
  "Ballon tampon",
  "Ballon ECS"
];


// Données des documents commerciaux
const documents = [
  // Eau/Eau
  {
    id: 1,
    title: "OPTIPACK2 R32",
    category: "Eau/Eau",
    date: "02/2024",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur OPTIPACK2 R32 Eau/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/02/OPTIPACK2-R32-SS.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 2,
    title: "OPTIPACK R410",
    category: "Eau/Eau",
    date: "02/2024",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur OPTIPACK R410 Eau/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2024/02/OPTIPACK-R410-SS.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 3,
    title: "SMARTPACK2 R410",
    category: "Eau/Eau",
    date: "09/2023",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur SMARTPACK2 R410 Eau/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/09/SMARTPACK2-R410-SS.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 4,
    title: "SMARTPACK3 R32",
    category: "Eau/Eau",
    date: "09/2023",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur SMARTPACK3 R32 Eau/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/09/SMARTPACK3-R32-SS.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },

  // Air/Eau
  {
    id: 5,
    title: "ROPACK3 R32",
    category: "Air/Eau",
    date: "07/2023",
    version: "AE",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur ROPACK3 R32 Air/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/07/ROPACK3-R32-AE.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 6,
    title: "ROPACK R410A",
    category: "Air/Eau",
    date: "07/2023",
    version: "AE",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur ROPACK R410A Air/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/07/ROPACK-R410A-AE.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 7,
    title: "ROPACKV AIR/EAU SPLIT",
    category: "Air/Eau",
    date: "07/2023",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur ROPACKV Air/Eau Split",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/07/ROPACKV-AIR-EAU-SPLIT.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 8,
    title: "ROPACKV R410A",
    category: "Air/Eau",
    date: "07/2023",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur ROPACKV R410A Air/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/07/ROPACKV-R410A-AIR-EAU.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 9,
    title: "ROPACK2 R410A",
    category: "Air/Eau",
    date: "07/2023",
    version: "AA",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur ROPACK2 R410A",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/07/ROPACK2-R410A.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 10,
    title: "ROPACK2 R410A A/E",
    category: "Air/Eau",
    date: "07/2023",
    version: "AB",
    gamme: "Pompes à chaleur",
    marché: "Résidentiel",
    description: "Documentation commerciale pompe à chaleur ROPACK2 R410A Air/Eau",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/07/ROPACK2-R410A-AE.pdf",
    type: "PDF",
    taille: "2.4 MB"
  },
  {
    id: 50,
    title: "Tarifs 2024",
    category: "Tarifs",
    date: "01/2024",
    version: "V1",
    gamme: "Tous produits",
    marché: "Tous marchés",
    description: "Grille tarifaire complète de nos produits",
    url: "#",
    type: "PDF",
    taille: "1.2 MB"
  },
  {
    id: 51,
    title: "Plaquette de présentation Nextherm",
    category: "Plaquettes",
    date: "2024",
    version: "V1",
    gamme: "Présentation générale",
    marché: "Tous marchés",
    description: "Présentation générale de l'entreprise et des solutions Nextherm",
    url: "#",
    type: "PDF",
    taille: "3.5 MB"
  },
  {
    id: 52,
    title: "Ballons tampons",
    category: "Ballon tampon",
    date: "2024",
    version: "V1",
    gamme: "Ballons",
    marché: "Tous marchés",
    description: "Documentation technique des ballons tampons",
    url: "#",
    type: "PDF",
    taille: "2.1 MB"
  },
  {
    id: 53,
    title: "Ballons ECS",
    category: "Ballon ECS",
    date: "2024",
    version: "V1",
    gamme: "Ballons",
    marché: "Tous marchés",
    description: "Documentation technique des ballons d'eau chaude sanitaire",
    url: "#",
    type: "PDF",
    taille: "2.3 MB"
  }
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6 max-w-7xl"
    >
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Documentation Commerciale</h1>
        <p className="text-gray-600">
          Accédez à l'ensemble de nos documents commerciaux : pompes à chaleur, tarifs, ballons et plus encore...
        </p>
      </div>

      {/* Barre de recherche et filtres */}
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
          <Card key={doc.id} className="hover:bg-gray-50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                {/* Informations principales */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-[#86BC29]" />
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
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredDocuments.length === 0 && (
        <Card className="p-8 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucun document trouvé</p>
        </Card>
      )}
    </motion.div>
  );
}