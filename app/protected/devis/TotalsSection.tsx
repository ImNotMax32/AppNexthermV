import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import { NexthermSelectorDialog } from './inputs/NexthermSelectorDialog';
import { TotalsSectionProps } from './types/devis';

export const TotalsSection: React.FC<TotalsSectionProps> = ({
  products,
  setProducts,
  calculateTotals,
  themes,
  selectedTheme
}) => {
  const totals = calculateTotals();
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);

  // Fonction utilitaire pour générer un ID unique
  const generateUniqueId = (currentProducts: typeof products) => {
    return Math.max(0, ...currentProducts.map(product => product.id)) + 1;
  };

  const handleProductSelect = (productData: {
    code: string;
    description: string;
    basePrice: number;
  }) => {
    setProducts(prevProducts => [...prevProducts, {
      id: generateUniqueId(prevProducts),
      code: productData.code,
      description: productData.description,
      quantity: 1,
      priceHT: productData.basePrice,
      tva: 20,
      totalHT: productData.basePrice
    }]);
  };

  const handleAddEmptyLine = () => {
    setProducts(prevProducts => [...prevProducts, {
      id: generateUniqueId(prevProducts),
      code: '',
      description: '',
      quantity: 1,
      priceHT: 0,
      tva: 20,
      totalHT: 0
    }]);
  };

  return (
    <div className="space-y-4">
      <NexthermSelectorDialog
        isOpen={isProductSelectorOpen}
        onClose={() => setIsProductSelectorOpen(false)}
        onProductSelect={handleProductSelect}
      />

      <div className="flex justify-between items-start z-10">
        <div className="flex gap-2">
          <Button
            onClick={handleAddEmptyLine}
            variant="outline"
            style={{
              color: themes[selectedTheme].primary,
              borderColor: themes[selectedTheme].primary
            }}
            className="text-sm hover:text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une ligne
          </Button>

          <Button
            onClick={() => setIsProductSelectorOpen(true)}
            variant="outline"
            style={{
              color: themes[selectedTheme].primary,
              borderColor: themes[selectedTheme].primary
            }}
            className="text-sm hover:text-white group relative"
          >
            <Package className="h-4 w-4 mr-2" />
            Produit Nextherm
          </Button>
        </div>

        <div className="space-y-2 min-w-[200px]">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-right text-gray-600">Total HT:</div>
            <div className="text-right font-medium">{totals.totalHT.toFixed(2)} €</div>

            <div className="text-right text-gray-600">Total TVA:</div>
            <div className="text-right font-medium">{totals.totalTVA.toFixed(2)} €</div>

            <div className="text-right text-gray-600 font-medium">Total TTC:</div>
            <div
              className="text-right font-bold"
              style={{ color: themes[selectedTheme].primary }}
            >
              {totals.totalTTC.toFixed(2)} €
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};