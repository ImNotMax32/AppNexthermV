import React from 'react';
import { X } from 'lucide-react';
import { ProductsTableProps } from './types/devis';
import { PersistentInput } from './inputs/PersistentInput';
import { PersistentTextarea } from './inputs/PersistentTextarea';

const columnWidths = {
  code: '170px',
  description: '430px',
  quantity: '60px',
  price: '110px',
  tva: '70px',
  totalTTC: '110px',
  actions: '0px', // Cellule invisible pour le bouton
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export const ProductsTable = React.memo(({ 
  pageNumber, 
  products, 
  updateProduct, 
  removeProduct, 
  selectedTheme, 
  themes,
  ITEMS_PER_PAGE 
}: ProductsTableProps) => {
  const calculateLineTTC = (product: Product) => {
    const totalHT = product.quantity * product.priceHT;
    return totalHT * (1 + product.tva / 100);
  };

  console.log("ProductsTable reçoit:", { 
    pageNumber, 
    products, 
    selectedTheme, 
    themes,
    ITEMS_PER_PAGE 
  });

  

  return (
    <div className="mt-8">
      <table className="w-full text-sm border-collapse">
        <thead style={{ backgroundColor: themes[selectedTheme].secondary }}>
          <tr>
            <th className="py-2 px-2 text-left align-top" style={{ width: columnWidths.code }}>Code</th>
            <th className="py-2 px-2 text-left align-top" style={{ width: columnWidths.description }}>Description</th>
            <th className="py-2 px-2 text-right align-top" style={{ width: columnWidths.quantity }}>Qté</th>
            <th className="py-2 px-2 text-right align-top" style={{ width: columnWidths.price }}>Montant HT</th>
            <th className="py-2 px-2 text-right align-top" style={{ width: columnWidths.tva }}>TVA %</th>
            <th className="py-2 px-2 text-right align-top" style={{ width: columnWidths.totalTTC }}>Total TTC</th>
            <th className="p-0" style={{ width: columnWidths.actions }}></th>
          </tr>
        </thead>
        <tbody>
          {products
            .slice((pageNumber - 1) * ITEMS_PER_PAGE, pageNumber * ITEMS_PER_PAGE)
            .map((product) => {
              console.log("Rendu du produit:", product);
              return (
                <tr key={product.id} className="group relative border-b border-gray-100">
                  <td className="py-2 px-1" style={{ width: columnWidths.code }}>
                    <PersistentTextarea
                      value={product.code}
                      onChange={(e) => updateProduct(product.id, 'code', e.target.value)}
                      className="w-full"
                      placeholder="CODE"
                    />
                  </td>
                  <td className="py-2 px-1" style={{ width: columnWidths.description }}>
                    <PersistentTextarea
                      value={product.description}
                      onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                      className="w-full"
                      placeholder="Description"
                    />
                  </td>
                  <td className="py-2 px-1 number-cell" style={{ width: columnWidths.quantity }}>
                    <PersistentInput
                      type="number"
                      value={product.quantity}
                      onChange={(e) => updateProduct(product.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full text-right"
                      min="1"
                    />
                  </td>
                  <td className="py-2 px-1 number-cell" style={{ width: columnWidths.price }}>
                    <PersistentInput
                      type="number"
                      value={product.priceHT || 0} 
                      onChange={(e) => updateProduct(product.id, 'priceHT', parseFloat(e.target.value) || 0)}
                      className="w-full text-right"
                      step="0.01"
                    />
                  </td>
                  <td className="py-2 px-1 number-cell" style={{ width: columnWidths.tva }}>
                    <PersistentInput
                      type="number"
                      value={product.tva}
                      onChange={(e) => updateProduct(product.id, 'tva', parseFloat(e.target.value) || 0)}
                      className="w-full text-right"
                      min="0"
                      max="100"
                    />
                  </td>
                  <td className="py-2 px-1 number-cell" style={{ width: columnWidths.totalTTC }}>
                    <div className="flex items-center min-h-[1.75rem]">
                      <span className="w-full text-right font-medium">
                        {formatNumber(calculateLineTTC(product))} €
                      </span>
                    </div>
                  </td>
                  <td className="p-0 relative" style={{ width: columnWidths.actions }}>
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="absolute -right-8 top-2 p-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparaison simple de la longueur
  if (prevProps.products.length !== nextProps.products.length) {
    return false;
  }

  // Comparaison détaillée des produits
  for (let i = 0; i < prevProps.products.length; i++) {
    const prev = prevProps.products[i];
    const next = nextProps.products[i];
    
    if (prev.id !== next.id ||
        prev.code !== next.code ||
        prev.description !== next.description ||
        prev.quantity !== next.quantity ||
        prev.priceHT !== next.priceHT ||
        prev.tva !== next.tva) {
      return false;
    }
  }
  
  return true;
});

ProductsTable.displayName = 'ProductsTable';