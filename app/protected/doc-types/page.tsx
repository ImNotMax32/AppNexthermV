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
  ClipboardEdit,
  FileUp,
  FileCheck,
  FileSpreadsheet,
  Building2,
  Home,
  Factory
} from "lucide-react";

// Catégories de documents types
const categories = [
  "Tous",
  "Devis",
  "Factures",
  "Bons de commande",
  "Rapports techniques",
  "Contrats",
  "Formulaires"
];

// Données des documents types
const documents = [
  {
    id: 1,
    title: "Modèle Devis Résidentiel",
    category: "Devis",
    date: "03/2024",
    version: "V2",
    usage: "Installation résidentielle",
    marché: "Résidentiel",
    description: "Template de devis pour installation de PAC en résidentiel",
    url: "#",
    type: "PDF",
    taille: "156 KB"
  },
  {
    id: 2,
    title: "Modèle Devis Tertiaire",
    category: "Devis",
    date: "03/2024",
    version: "V2",
    usage: "Installation tertiaire",
    marché: "Tertiaire",
    description: "Template de devis pour installation de PAC en tertiaire",
    url: "#",
    type: "PDF",
    taille: "178 KB"
  },
  {
    id: 3,
    title: "Rapport de mise en service",
    category: "Rapports techniques",
    date: "01/2024",
    version: "V1",
    usage: "Tous projets",
    marché: "Tous marchés",
    description: "Document type pour rapport de mise en service PAC",
    url: "#",
    type: "PDF",
    taille: "245 KB"
  },
  {
    id: 4,
    title: "Contrat de maintenance",
    category: "Contrats",
    date: "02/2024",
    version: "V3",
    usage: "Maintenance",
    marché: "Tous marchés",
    description: "Modèle de contrat de maintenance standard",
    url: "#",
    type: "PDF",
    taille: "320 KB"
  }
];

// Helper function pour obtenir l'icône appropriée
const getIconForCategory = (category: string) => {
  switch(category) {
    case "Devis":
      return <FileSpreadsheet />;
    case "Factures":
      return <FileText />;
    case "Bons de commande":
      return <ClipboardEdit />;
    case "Rapports techniques":
      return <FileUp />;
    case "Contrats":
      return <FileCheck />;
    case "Formulaires":
      return <FileText />;
    default:
      return <FileText />;
  }
};

// Helper function pour obtenir l'icône du marché
const getMarketIcon = (marché: string) => {
  switch(marché) {
    case "Résidentiel":
      return <Home className="h-4 w-4" />;
    case "Tertiaire":
      return <Building2 className="h-4 w-4" />;
    case "Industriel":
      return <Factory className="h-4 w-4" />;
    default:
      return null;
  }
};

export default function DocumentsTypes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const openDocument = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6 max-w-7xl"
    >
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Documents Types</h1>
        <p className="text-gray-600">
          Accédez à tous nos modèles de documents : devis, factures, rapports techniques...
        </p>
      </div>

      {/* Barre de recherche et filtres */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un modèle de document..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
        </CardContent>
      </Card>

      {/* Liste des documents */}
      <div className="space-y-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="hover:bg-gray-50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                {/* Informations principales */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="h-6 w-6 text-[#86BC29]">
                      {getIconForCategory(doc.category)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{doc.title}</h3>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getMarketIcon(doc.marché)} {doc.marché}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {doc.description}
                    </div>
                  </div>
                </div>

                {/* Spécifications */}
                <div className="flex items-center gap-8">
                  <div className="text-sm">
                    <div className="text-gray-500">Usage</div>
                    <div>{doc.usage}</div>
                  </div>
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
                      onClick={() => openDocument(doc.url)}
                      className="h-9"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Aperçu
                    </Button>
                    <Button 
                      className="bg-[#86BC29] hover:bg-[#75a625] h-9"
                      onClick={() => openDocument(doc.url)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message si aucun résultat */}
      {documents.length === 0 && (
        <Card className="p-8 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucun modèle de document trouvé</p>
        </Card>
      )}
    </motion.div>
  );
}