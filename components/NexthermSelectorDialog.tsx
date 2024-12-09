import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NexthermHorizontalSelector } from './nexthermHorizontalSelector';
import { Package } from 'lucide-react';

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
  const handleProductSelect = (productData: {
    code: string;
    description: string;
    basePrice: number;
  }) => {
    onProductSelect(productData);
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