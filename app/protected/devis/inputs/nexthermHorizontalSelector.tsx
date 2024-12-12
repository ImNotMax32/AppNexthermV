// nexthermHorizontalSelector.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { NexthermProduct, ProductPower } from '../types/nextherm';
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
    basePrice: number;
  }) => void;
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

  const getImagePath = (imagePath: string) => {
    // Retire tous les préfixes indésirables
    const cleanPath = imagePath.replace(/^(\/|public\/|protected\/)+/, '');
    return `/${cleanPath}`;
  };
  // Filtrer les produits
  const filteredProducts = products.filter(product => 
    filterType === 'all' || product.Particularites.includes(filterType)
  );

  const handleProductClick = (product: NexthermProduct) => {
    setSelectedProduct(product);
    setSelectedPower('');
  };

  const formatDescription = (product: NexthermProduct, power: ProductPower): string => {
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
    <div className="p-6 space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]">
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
          <div className="text-sm text-gray-500">
            {filteredProducts.length} produits trouvés
          </div>
        </div>
      </div>

      {/* Grille de produits */}
      <div className="relative px-8">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 shadow-lg rounded-full p-3 transition-all"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto py-4 hide-scrollbar"
          style={{ scrollBehavior: 'smooth' }}
        >
          {filteredProducts.map((product, idx) => (
            <div
              key={idx}
              onClick={() => handleProductClick(product)}
              className={`flex-none w-80 bg-white border rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                selectedProduct?.Nom === product.Nom 
                  ? 'ring-2 ring-[#86BC29] shadow-lg transform scale-[1.02]' 
                  : 'hover:scale-[1.01]'
              }`}
            >
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
              <img 
                src={getImagePath(product.Image2)} 
                alt={product.Nom}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error(`Failed to load image: ${product.Image2}`);
                  e.currentTarget.src = '/placeholder.jpg';
                }}
              />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="text-white text-lg font-medium">{product.Nom}</div>
                  <div className="text-white/90 text-sm mt-1">
                    Puissance : {product.Puissance.min} - {product.Puissance.max} kW
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {product.Particularites.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.Description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 shadow-lg rounded-full p-3 transition-all"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Sélecteur de puissance */}
      {selectedProduct && (
        <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 flex-1">
          <img 
            src={getImagePath(selectedProduct.Image2)}
            alt={selectedProduct.Nom}
            className="w-16 h-16 object-cover rounded-lg"
            onError={(e) => {
              console.error(`Failed to load image: ${selectedProduct.Image2}`);
              e.currentTarget.src = '/placeholder.jpg';
            }}
          />
          <div>
            <h3 className="font-medium">{selectedProduct.Nom}</h3>
            <p className="text-sm text-gray-500">Sélectionnez une puissance</p>
          </div>
        </div>
        
        <div className="w-[300px]"> {/* Wrapper div avec la classe de largeur */}
          <Select value={selectedPower} onValueChange={setSelectedPower}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir une puissance" />
            </SelectTrigger>
            <SelectContent>
              {selectedProduct.Puissance.disponibles?.map((power, idx) => (
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
              p => p.modele === selectedPower
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
          className="min-w-[150px]"
        >
          Ajouter au devis
        </Button>
      </div>
      )}

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