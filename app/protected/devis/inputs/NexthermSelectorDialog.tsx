import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductFamilySelector } from './ProductFamilySelector';
import { Package, Info } from 'lucide-react';
import { Product } from '../types/devis';

interface NexthermSelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProductSelect: (productData: {
    code: string;
    description: string;
    basePrice: number;
  }) => void;
}

export const NexthermSelectorDialog: React.FC<NexthermSelectorDialogProps> = ({
  isOpen,
  onClose,
  onProductSelect
}) => {
  const handleProductSelect = (productData: Pick<Product, "code" | "description" | "priceHT">) => {
    onProductSelect({
      code: productData.code,
      description: productData.description,
      basePrice: productData.priceHT // Conversion de priceHT vers basePrice
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-8 py-6 bg-white border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-2xl font-semibold">
              <Package className="h-7 w-7 text-[#86BC29]" />
              Sélecteur de produits
            </DialogTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Info className="h-4 w-4" />
              Sélectionnez un produit puis sa puissance
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Sélectionnez les produits et équipements pour votre installation
          </p>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <ProductFamilySelector onProductSelect={handleProductSelect} />
        </div>
      </DialogContent>
    </Dialog>
  );
};