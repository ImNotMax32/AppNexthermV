import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NexthermHorizontalSelector } from './nexthermHorizontalSelector';
import { Package } from 'lucide-react';

// Définition du type Product pour la cohérence
interface Product {
  code: string;
  description: string;
  priceHT: number;
}

interface NexthermSelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProductSelect: (productData: Pick<Product, "code" | "description" | "priceHT">) => void;
}

export const NexthermSelectorDialog: React.FC<NexthermSelectorDialogProps> = ({
  isOpen,
  onClose,
  onProductSelect
}) => {
  const handleProductSelect = (productData: {
    code: string;
    description: string;
    basePrice: number;
  }) => {
    // Transformer les données pour correspondre au type attendu
    onProductSelect({
      code: productData.code,
      description: productData.description,
      priceHT: productData.basePrice // Conversion de basePrice en priceHT
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-6 w-6" />
            Sélectionner un produit Nextherm
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <NexthermHorizontalSelector onProductSelect={handleProductSelect} />
        </div>
      </DialogContent>
    </Dialog>
  );
};