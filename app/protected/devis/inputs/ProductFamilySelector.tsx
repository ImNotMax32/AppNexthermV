import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Package, Wrench, Droplet, Waves } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import productsData from '@/public/data/products.json';
import equipmentsData from '@/public/data/equipement.json';
import ballonsData from '@/public/data/ballon.json';
import { NexthermProduct, ProductPower } from '../types/nextherm';
import { Product } from '../types/devis';
import capteursData from '@/public/data/capteur.json'; 

// Types
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

interface BallonProduct {
  Nom: string;
  Particularites: string[];
  Description: string;
  Volume: {
    min: number;
    max: number;
    disponibles: Array<{
      modele: string;
      volume: number;
      surface_echangeur?: number;
      isolation?: string;
      pression_service: number;
    }>;
  };
}

interface ProductListProps {
  products: (NexthermProduct | Equipment | BallonProduct)[];
  onProductSelect: (productData: Pick<Product, 'code' | 'description' | 'priceHT'>) => void;
  type: 'pac' | 'equipment' | 'ballon';
}

// Type guards
const isNexthermProduct = (product: any): product is NexthermProduct => {
  return 'Puissance' in product;
};

const isEquipment = (product: any): product is Equipment => {
  return 'Compatibilite' in product;
};

const isBallon = (product: any): product is BallonProduct => {
  return 'Volume' in product;
};

const ProductList: React.FC<ProductListProps> = ({ products, onProductSelect, type }) => {
  const [selectedProduct, setSelectedProduct] = useState<NexthermProduct | Equipment | BallonProduct | null>(null);
  const [selectedPower, setSelectedPower] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');

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

  const formatBallonDescription = (product: BallonProduct, volumeInfo: any): string => {
    return `${product.Nom}
Caractéristiques techniques:
• Volume: ${volumeInfo.volume} L
• Pression de service: ${volumeInfo.pression_service} bar
${volumeInfo.surface_echangeur ? `• Surface d'échange: ${volumeInfo.surface_echangeur} m²\n` : ''}
${volumeInfo.isolation ? `• Isolation: ${volumeInfo.isolation}\n` : ''}
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
    } else if (isBallon(firstProduct)) {
      return [
        { value: 'all', label: 'Tous les ballons' },
        { value: 'Inox', label: 'Inox' },
        { value: 'Acier', label: 'Acier' },
        { value: 'ECS', label: 'ECS' },
        { value: 'Tampon', label: 'Tampon' }
      ];
    } else {
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

  const renderProduct = (product: NexthermProduct | Equipment | BallonProduct) => {
    if (isNexthermProduct(product)) {
      return (
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
                <span key={idx} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-gray-600">{product.Description}</p>
            <div className="mt-3 text-sm text-gray-500">
              Puissance : {product.Puissance.min} - {product.Puissance.max} kW
            </div>
          </div>
        </div>
      );
    } else if (isBallon(product)) {
      return (
        <div className="flex p-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium">{product.Nom}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.Particularites.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-gray-600">{product.Description}</p>
            <div className="mt-3 text-sm text-gray-500">
              Volume : {product.Volume.min} - {product.Volume.max} L
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="py-3 px-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{product.Nom}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Compatibilité : {product.Compatibilite?.gammes?.join(', ') || 'Non spécifié'}
              </p>
            </div>
            <div className="flex gap-2">
              {product.Particularites.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={
              type === 'ballon' ? "Type de ballon" :
              type === 'pac' ? "Type de produit" :
              "Type d'équipement"
            } />
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

      <div className="space-y-2 pb-24"> 
      {filteredProducts.map((product, idx) => (
        <div
          key={idx}
          onClick={() => setSelectedProduct(product)}
          className={`bg-white border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
            selectedProduct?.Nom === product.Nom ? 'ring-2 ring-[#86BC29] shadow-lg' : ''
          }`}
        >
          {renderProduct(product)}
        </div>
      ))}
    </div>

      {selectedProduct && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="max-w-7xl mx-auto p-6 flex items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div>
                <h3 className="font-medium">{selectedProduct.Nom}</h3>
                <p className="text-sm text-gray-500">
                  {isNexthermProduct(selectedProduct) ? "Sélectionnez une puissance" :
                   isBallon(selectedProduct) ? "Sélectionnez un volume" :
                   "Sélectionnez une version"}
                </p>
              </div>
            </div>

            <Select value={selectedPower} onValueChange={setSelectedPower}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder={
                  isNexthermProduct(selectedProduct) ? "Choisir une puissance" :
                  isBallon(selectedProduct) ? "Choisir un volume" :
                  "Choisir une version"
                } />
              </SelectTrigger>
              <SelectContent position="popper" side="top" className="max-h-[300px]">
                {isNexthermProduct(selectedProduct) ? (
                  selectedProduct.Puissance.disponibles?.map((power, idx) => (
                    <SelectItem key={idx} value={power.modele}>
                      {power.modele} - {power.puissance_calo} kW (COP: {power.cop})
                    </SelectItem>
                  ))
                ) : isBallon(selectedProduct) ? (
                  selectedProduct.Volume.disponibles.map((volume, idx) => (
                    <SelectItem key={idx} value={volume.modele}>
                      {volume.modele} - {volume.volume}L
                    </SelectItem>
                  ))
                ) : (
                  selectedProduct.Compatibilite.versions.map((version, idx) => (
                    <SelectItem key={idx} value={version.modele}>
                      {version.modele} - {version.puissance}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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
                } else if (isBallon(selectedProduct)) {
                  const volumeInfo = selectedProduct.Volume.disponibles.find(
                    v => v.modele === selectedPower
                  );
                  if (volumeInfo) {
                    onProductSelect({
                      code: volumeInfo.modele,
                      description: formatBallonDescription(selectedProduct, volumeInfo),
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
        <TabsTrigger value="capteur" className="flex items-center gap-2">
          <Waves className="h-5 w-5" />
          Capteurs
        </TabsTrigger>
        <TabsTrigger value="equipment" className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Kit divers
        </TabsTrigger>
        <TabsTrigger value="ballon" className="flex items-center gap-2">
          <Droplet className="h-5 w-5" />
          Ballons et accessoires
        </TabsTrigger>
      </TabsList>

      {/* PAC */}
      <TabsContent value="pac" className="p-6">
        <ProductList type="pac" products={productsData.products} onProductSelect={onProductSelect} />
      </TabsContent>

      {/* Capteurs */}
      <TabsContent value="capteur">
        <div className="px-6 pt-6">
          <Tabs defaultValue="glycol" className="w-full">
            <TabsList>
              <TabsTrigger value="glycol">Eau glycolée / Eau</TabsTrigger>
              <TabsTrigger value="ground">Sol/Eau</TabsTrigger>
            </TabsList>
            
            <TabsContent value="glycol" className="pt-6">
              <ProductList 
                type="capteur" 
                products={capteursData.glycol} 
                onProductSelect={onProductSelect} 
              />
            </TabsContent>
            <TabsContent value="ground" className="pt-6">
              <ProductList 
                type="capteur" 
                products={capteursData.ground} 
                onProductSelect={onProductSelect} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </TabsContent>

      {/* Kit divers */}
      <TabsContent value="equipment" className="p-6">
        <ProductList type="equipment" products={equipmentsData.products} onProductSelect={onProductSelect} />
      </TabsContent>

      {/* Ballons */}
      <TabsContent value="ballon" className="p-6">
        <ProductList type="ballon" products={ballonsData.products} onProductSelect={onProductSelect} />
      </TabsContent>
    </Tabs>
  );
};

export default ProductFamilySelector;