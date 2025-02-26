'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Search, FileText, Download, Eye } from "lucide-react";

const documents = [
  {
    id: 1,
    title: "PAC KIT free cooling et sonde verticale",
    category: "Schéma hydraulique",
    date: "07/2023",
    version: "AD",
    description: "Schéma hydraulique pour installation PAC avec kit free cooling et sonde verticale",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/07/PAC-KIT-free-cooling-et-sonde-verticale-ind-AD.pdf",
    type: "PDF"
  },
  {
    id: 2,
    title: "PAC KIT free cooling et échangeur de barrage",
    category: "Schéma hydraulique",
    date: "07/2023",
    version: "AB",
    description: "Schéma hydraulique pour installation PAC avec kit free cooling et échangeur de barrage",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/07/PAC-KIT-free-cooling-et-echangeur-de-barrage-ind-AB.pdf",
    type: "PDF"
  },
  {
    id: 3,
    title: "ROPACK 2 et 3 KITS - 2 zones",
    category: "Schéma hydraulique",
    date: "07/2023",
    version: "AA",
    description: "Installation 2 zones Plancher/Radiateurs avec ECS, Résistance d'appoint et Piscine",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/07/ROPACK-2-et-3-KITS-2-zones-Plancher-Radiateurs-ECS-Resistance-dappoint-Piscine-ind-AA.pdf",
    type: "PDF"
  },
  {
    id: 4,
    title: "SMARTPACK3 KIT - 1 zone radiateurs",
    category: "Schéma hydraulique",
    date: "07/2023",
    version: "AA",
    description: "Installation 1 zone radiateurs avec ECS, Échangeur de barrage, Résistance d'appoint et Piscine",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/07/SMARTPACK3-KIT-1-zone-radiateurs-ECS-Echangeur-de-barrage-Resistance-dappoint-Piscine-ind-AA.pdf",
    type: "PDF"
  },
  {
    id: 5,
    title: "SMARTPACK3 KIT - 2 zones plancher",
    category: "Schéma hydraulique",
    date: "07/2023",
    version: "AB",
    description: "Installation 2 zones plancher avec ECS, Échangeur de barrage, Résistance d'appoint et Piscine",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/07/SMARTPACK3-KIT-2-zones-plancher-ECS-Echangeur-de-barrage-Resistance-dappoint-Piscine-ind-AB.pdf",
    type: "PDF"
  },
  {
    id: 6,
    title: "SMARTPACK3 KIT - 2 zones Plancher/Radiateurs",
    category: "Schéma hydraulique",
    date: "07/2023",
    version: "AA",
    description: "Installation 2 zones Plancher/Radiateurs avec ECS, Échangeur de barrage, Résistance d'appoint et Piscine",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/07/SMARTPACK3-KIT-2-zones-Plancher-Radiateurs-ECS-Echangeur-de-barrage-Resistance-dappoint-Piscine-ind-AA.pdf",
    type: "PDF"
  },
  {
    id: 7,
    title: "SMARTPACK3 KIT - 2 zones radiateurs",
    category: "Schéma hydraulique",
    date: "07/2023",
    version: "AA",
    description: "Installation 2 zones radiateurs avec ECS, Échangeur de barrage, Résistance d'appoint et Piscine",
    url: "https://www.nextherm.fr/wp-content/uploads/2023/07/SMARTPACK3-KIT-2-zones-radiateurs-ECS-Echangeur-de-barrage-Resistance-dappoint-Piscine-ind-AA.pdf",
    type: "PDF"
  }
];

export default function Schematheque() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocuments = documents.filter(doc => {
    const searchString = searchTerm.toLowerCase();
    return (
      doc.title.toLowerCase().includes(searchString) ||
      doc.description.toLowerCase().includes(searchString)
    );
  });

  const openDocument = (url: string) => {
    window.open(url, '_blank');
  };

  const getFileName = (url: string) => {
    return url.split('/').pop() || 'schema.pdf';
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
        <h1 className="text-3xl font-bold mb-2">Bibliothèque de Schémas Hydrauliques</h1>
        <p className="text-gray-600">
          Consultez notre collection complète de schémas hydrauliques pour tous nos produits
        </p>
      </div>

      {/* Barre de recherche */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un schéma par nom ou description..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des schémas */}
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
                    <h3 className="font-semibold">{doc.title}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {doc.description}
                    </div>
                  </div>
                </div>

                {/* Version et date */}
                <div className="text-sm">
                  <div className="text-gray-500">Version</div>
                  <div>{doc.version} ({doc.date})</div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => openDocument(doc.url)}
                    className="h-9"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir
                  </Button>
                  <a 
                    href={doc.url}
                    download={getFileName(doc.url)}
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
      {filteredDocuments.length === 0 && (
        <Card className="p-8 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucun schéma trouvé</p>
        </Card>
      )}
    </motion.div>
  );
}