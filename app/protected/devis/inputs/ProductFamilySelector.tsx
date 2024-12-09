import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Package, Wrench } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import productsData from '@/public/data/products.json';
import equipmentsData from '@/public/data/equipement.json';
import { NexthermProduct, ProductPower } from '../types/nextherm';
import { Product } from '../types/devis';

// Type pour les équipements
interface Equipment {
  Nom: string;
  Particularites: string[];
  Description: string;
  Compatibilite: {
    gammes: string[];
    versions: {
      modele: string;
      puissance: string;
    }[];
  };
}

interface ProductListProps {
    products: (NexthermProduct | Equipment)[];
    onProductSelect: (productData: Pick<Product, 'code' | 'description' | 'priceHT'>) => void;
    type: 'pac' | 'equipment';
  }

  const ProductList: React.FC<ProductListProps> = ({ products, onProductSelect }) => {
    const [selectedProduct, setSelectedProduct] = useState<NexthermProduct | Equipment | null>(null);
    const [selectedPower, setSelectedPower] = useState<string>('');
    const [filterType, setFilterType] = useState<string>('all');
  
    const isNexthermProduct = (product: NexthermProduct | Equipment): product is NexthermProduct => {
      return 'Puissance' in product;
    };
  const getImagePath = (imagePath: string | undefined): string => {
    if (!imagePath) return '/placeholder.jpg';
    const cleanPath = imagePath.replace(/^(\/|public\/|protected\/)+/, '');
    return `/${cleanPath}`;
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

  const getFilterOptions = () => {
    const firstProduct = products[0];
    if (isNexthermProduct(firstProduct)) {
      return [
        { value: 'all', label: 'Tous les produits' },
        { value: 'Geothermie', label: 'Géothermie' },
        { value: 'Aerothermie', label: 'Aérothermie' },
        { value: 'R32', label: 'R32' },
        { value: 'R410A', label: 'R410A' }
      ];
    } else {
      // Pour les équipements, utiliser les types uniques des Particularites
      const uniqueTypes = Array.from(
        new Set(
          products.flatMap(product => product.Particularites)
        )
      );
      return [
        { value: 'all', label: 'Tous les équipements' },
        ...uniqueTypes.map(type => ({
          value: type,
          label: type
        }))
      ];
    }
  };

  const filteredProducts = products.filter(product => 
    filterType === 'all' || product.Particularites.includes(filterType)
  );
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={isNexthermProduct(products[0]) ? "Type de produit" : "Type d'équipement"} />
          </SelectTrigger>
          <SelectContent>
            {getFilterOptions().map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filteredProducts.map((product, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedProduct(product)}
            className={`bg-white border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
              selectedProduct?.Nom === product.Nom 
                ? 'ring-2 ring-[#86BC29] shadow-lg' 
                : ''
            }`}
          >
            {isNexthermProduct(product) ? (
              // Affichage pour les PACs
              <div className="flex p-4">
                <div className="w-48 h-48 relative">
                  <img 
                    src={getImagePath(product.Image2)}
                    alt={product.Nom}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.jpg';
                    }}
                  />
                </div>
                <div className="flex-1 pl-4">
                  <h3 className="text-lg font-medium">{product.Nom}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.Particularites.map((tag, idx) => (
                      <span 
                        key={idx}
                        className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-gray-600">
                    {product.Description}
                  </p>
                  <div className="mt-3 text-sm text-gray-500">
                    Puissance : {product.Puissance.min} - {product.Puissance.max} kW
                  </div>
                </div>
              </div>
            ) : (
              // Affichage simplifié pour les équipements
              <div className="py-3 px-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{product.Nom}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Compatibilité : {product.Compatibilite.gammes.join(', ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {product.Particularites.map((tag, idx) => (
                      <span 
                        key={idx}
                        className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="max-w-7xl mx-auto p-6 flex items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div>
                <h3 className="font-medium">{selectedProduct.Nom}</h3>
                {isNexthermProduct(selectedProduct) ? (
                  <p className="text-sm text-gray-500">Sélectionnez une puissance</p>
                ) : (
                  <p className="text-sm text-gray-500">Sélectionnez une version</p>
                )}
              </div>
            </div>
            {isNexthermProduct(selectedProduct) ? (
              // Sélecteur de puissance pour les PACs
              <Select value={selectedPower} onValueChange={setSelectedPower}>
                <SelectTrigger className="w-[300px]">
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
            ) : (
              // Sélecteur de version pour les équipements
              <Select value={selectedPower} onValueChange={setSelectedPower}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Choisir une version" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProduct.Compatibilite.versions.map((version, idx) => (
                    <SelectItem key={idx} value={version.modele}>
                      {version.modele} - {version.puissance}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Button
              disabled={!selectedPower}
              onClick={() => {
                if (isNexthermProduct(selectedProduct)) {
                  const power = selectedProduct.Puissance.disponibles?.find(
                    p => p.modele === selectedPower
                  );
                  if (power) {
                    onProductSelect({
                      code: power.modele,
                      description: formatDescription(selectedProduct, power),
                      priceHT: 0
                    });
                  }
                } else {
                  const version = selectedProduct.Compatibilite.versions.find(
                    v => v.modele === selectedPower
                  );
                  if (version) {
                    onProductSelect({
                      code: version.modele,
                      description: `${selectedProduct.Nom}
Compatibilité : ${selectedProduct.Compatibilite.gammes.join(', ')}
Version : ${version.modele} - ${version.puissance}
${selectedProduct.Description}`,
                      priceHT: 0
                    });
                  }
                }
                setSelectedProduct(null);
                setSelectedPower('');
              }}
              className="min-w-[150px]"
            >
              Ajouter au devis
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

interface ProductFamilySelectorProps {
  onProductSelect: (productData: Pick<Product, 'code' | 'description' | 'priceHT'>) => void;
}

export const ProductFamilySelector: React.FC<ProductFamilySelectorProps> = ({ onProductSelect }) => {
    return (
      <Tabs defaultValue="pac" className="w-full">
        <TabsList className="w-full border-b">
          <TabsTrigger value="pac" className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pompes à chaleur
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Équipements
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pac" className="p-6">
          <ProductList type="pac" products={productsData.products} onProductSelect={onProductSelect} />
        </TabsContent>
        <TabsContent value="equipment" className="p-6">
          <ProductList type="equipment" products={equipmentsData.products} onProductSelect={onProductSelect} />
        </TabsContent>
      </Tabs>
    );
  };

// Assurez-vous d'avoir cette ligne à la fin du fichier
export default ProductFamilySelector;