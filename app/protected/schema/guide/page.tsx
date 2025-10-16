'use client';

import { useState, useEffect } from 'react';
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

interface Guide {
  id: number;
  title: string;
  family: string;
  date: string;
  version: string;
  description: string;
  url: string;
}

interface Product {
  Nom: string;
  Particularites: string[];
  GuideInstallationWebURL?: string;
  BrochureURL?: string;
}

interface ProductsData {
  products: Product[];
}

// Fonction pour mapper les particularités aux familles de produits
const mapParticularitesToFamily = (particularites: string[]): string => {
  if (particularites.includes("Sol/Sol")) return "Sol/Sol";
  if (particularites.includes("Sol/Eau")) return "Sol/Eau";
  if (particularites.includes("Eau/Sol")) return "Eau/Sol";
  if (particularites.includes("Air/Eau")) return "Air/Eau";
  if (particularites.includes("Geothermie") || particularites.includes("Eau/Eau")) return "Eau glycolée/Eau";
  return "Eau glycolée/Eau"; // Défaut
};

// Fonction pour extraire les informations de version et date depuis l'URL
const extractVersionAndDate = (url: string): { version: string; date: string } => {
  // Extraire le nom du fichier depuis l'URL
  const fileName = url.split('/').pop() || '';
  
  // Patterns pour extraire version
  const versionMatch = fileName.match(/ind[_-]([A-Z]{1,2})/i);
  
  let version = versionMatch ? versionMatch[1].toUpperCase() : 'N/A';
  let date = '03/2025'; // Date fixe pour tous les guides
  
  return { version, date };
};

// Fonction pour générer une description basée sur le nom du produit
const generateDescription = (productName: string): string => {
  return `Guide d'installation pour pompe à chaleur ${productName}`;
};

export default function InstallationGuides() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFamily, setSelectedFamily] = useState('Tous');
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);

    // Charger les données des produits et générer les guides
    useEffect(() => {
      const loadGuides = async () => {
        try {
          const response = await fetch('/data/products.json');
          const data: ProductsData = await response.json();
          
          const generatedGuides: Guide[] = data.products
            .filter(product => product.GuideInstallationWebURL) // Seulement les produits avec une URL de guide
            .map((product, index) => {
              const family = mapParticularitesToFamily(product.Particularites);
              const { version, date } = extractVersionAndDate(product.GuideInstallationWebURL!);
              
              return {
                id: index + 1,
                title: product.Nom,
                family,
                date,
                version,
                description: generateDescription(product.Nom),
                url: product.GuideInstallationWebURL!
              };
            });
          
          setGuides(generatedGuides);
        } catch (error) {
          console.error('Erreur lors du chargement des guides:', error);
        } finally {
          setLoading(false);
        }
      };

      loadGuides();
    }, []);
  
    // Fonction de tri alphabétique pour les guides
    const sortGuides = (a: Guide, b: Guide) => {
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

    if (loading) {
      return (
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#86BC29] mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des guides...</p>
            </div>
          </div>
        </div>
      );
    }
  
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