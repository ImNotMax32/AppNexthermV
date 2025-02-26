import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import productsData from '@/public/data/products.json';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NexthermHorizontalSelectorProps {
  onProductSelect: (productData: {
    code: string;
    description: string;
    basePrice: number;  // On garde basePrice ici car c'est la donnée brute
  }) => void;
}

interface PowerModel {
  modele: string;
  puissance_calo: number;
  puissance_frigo: number;
  puissance_absorbee: number;
  cop: number;
  etas: number;
}

interface PowerCharacteristics {
  cop_moyen: number;
  etas_moyen: number;
  ratio_frigo?: number;  
  ratio_absorbee?: number;  
}

interface PowerRange {
  min: number;
  max: number;
  disponibles?: PowerModel[];
  increment?: number;
  baseModele?: string;
  caracteristiques?: PowerCharacteristics;
}

interface ProductDimension {
  largeur: string | number; 
  longueur: string | number; 
  hauteur: string | number;  
}

interface NexthermProduct {
  Nom: string;
  Particularites: string[];
  Puissance: PowerRange;
  Description: string;
  Image2: string;
  BrochureURL: string;
  Freecooling: boolean;
  Kit_Piscine: boolean;
  Cop: {
    max: number;
  };
  Etas: {
    max: number;
  };
  Emetteur: {
    min: number;
    max: number;
  };
  Dimension?: ProductDimension;
  Dimension2?: ProductDimension;
  Image?: string;
  selectedModel?: PowerModel;
  Eau_de_nappe?: {
    Puissance_min: number;
    Puissance_max: number;
  };
}

export const NexthermHorizontalSelector: React.FC<NexthermHorizontalSelectorProps> = ({ onProductSelect }) => {
  const products: NexthermProduct[] = productsData.products;
  const [selectedProduct, setSelectedProduct] = useState<NexthermProduct | null>(null);
  const [selectedPower, setSelectedPower] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fonction de défilement
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Filtrer les produits
  const filteredProducts = products.filter(product => 
    filterType === 'all' || product.Particularites.includes(filterType)
  );

  const handleProductClick = (product: NexthermProduct) => {
    setSelectedProduct(product);
    setSelectedPower('');
  };

  const formatDescription = (product: NexthermProduct, power: PowerModel): string => {
    return `${product.Nom}
Caractéristiques techniques:
• Puissance calorifique: ${power.puissance_calo} kW
• Puissance frigorifique: ${power.puissance_frigo} kW
• COP: ${power.cop}
• ETAS: ${power.etas}%
Type: ${product.Particularites.join(', ')}
${product.Description}`;
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4">
      {/* En-tête avec filtres */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium">Produits Nextherm</h3>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type de produit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les produits</SelectItem>
            <SelectItem value="Geothermie">Géothermie</SelectItem>
            <SelectItem value="Aerothermie">Aérothermie</SelectItem>
            <SelectItem value="R32">R32</SelectItem>
            <SelectItem value="R410A">R410A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Carrousel de produits */}
      <div className="relative">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md rounded-full p-2"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto py-4 px-8 hide-scrollbar"
          style={{ scrollBehavior: 'smooth' }}
        >
          {filteredProducts.map((product, idx) => (
            <div
              key={idx}
              onClick={() => handleProductClick(product)}
              className={`flex-none w-64 border rounded-lg overflow-hidden cursor-pointer transition-shadow hover:shadow-md ${
                selectedProduct?.Nom === product.Nom ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <img 
                  src={product.Image2} 
                  alt={product.Nom}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <div className="text-white text-sm font-medium">{product.Nom}</div>
                  <div className="text-white/80 text-xs">
                    {product.Puissance.min} - {product.Puissance.max} kW
                  </div>
                </div>
              </div>
              <div className="p-2">
                <div className="flex flex-wrap gap-1">
                  {product.Particularites.map((tag: string, idx: number) => (
                    <span 
                      key={idx}
                      className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md rounded-full p-2"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Sélecteur de puissance */}
      {selectedProduct && (
        <div className="mt-4 flex items-end gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <div className="text-sm font-medium mb-2">Sélectionner la puissance</div>
            <Select value={selectedPower} onValueChange={setSelectedPower}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une puissance" />
              </SelectTrigger>
              <SelectContent>
                {selectedProduct.Puissance.disponibles?.map((power: PowerModel, idx: number) => (
                  <SelectItem key={idx} value={power.modele}>
                    {power.modele} - {power.puissance_calo} kW (COP: {power.cop})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            disabled={!selectedPower}
            onClick={() => {
              const power = selectedProduct.Puissance.disponibles?.find(
                (p: PowerModel) => p.modele === selectedPower
              );
              if (power) {
                onProductSelect({
                  code: power.modele,
                  description: formatDescription(selectedProduct, power),
                  basePrice: 0
                });
                setSelectedProduct(null);
                setSelectedPower('');
              }
            }}
          >
            Ajouter au devis
          </Button>
        </div>
      )}

      {/* Style pour cacher la scrollbar tout en gardant la fonctionnalité */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};