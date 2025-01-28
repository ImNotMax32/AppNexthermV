import React from 'react';
import { X } from 'lucide-react';
import { ProductsTableProps, Product } from './types/devis';
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
  });

  console.log("ProductsTable - selectedTheme:", selectedTheme);
  console.log("ProductsTable - themes:", themes);
  console.log("ProductsTable - background color:", themes[selectedTheme]?.secondary);

  return (
    <div className="mt-8">
      <table className="w-full border-collapse" style={{ backgroundColor: themes[selectedTheme]?.secondary }}>
        <thead>
          <tr>
            <th style={{ width: columnWidths.code }} className="py-2 px-4 text-left border-b">Code</th>
            <th style={{ width: columnWidths.description }} className="py-2 px-4 text-left border-b">Description</th>
            <th style={{ width: columnWidths.quantity }} className="py-2 px-4 text-left border-b">Qté</th>
            <th style={{ width: columnWidths.price }} className="py-2 px-4 text-left border-b">Prix HT</th>
            <th style={{ width: columnWidths.tva }} className="py-2 px-4 text-left border-b">TVA</th>
            <th style={{ width: columnWidths.totalTTC }} className="py-2 px-4 text-left border-b">Total TTC</th>
            <th style={{ width: columnWidths.actions }} className="py-2 px-4 border-b"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="py-2 px-4 border-b">
                <PersistentTextarea
                  value={product.code}
                  onChange={(value: string) => updateProduct(product.id, 'code', value)}
                  className="w-full bg-transparent"
                />
              </td>
              <td className="py-2 px-4 border-b">
                <PersistentTextarea
                  value={product.description}
                  onChange={(value: string) => updateProduct(product.id, 'description', value)}
                  className="w-full bg-transparent resize-none"
                  rows={2}
                />
              </td>
              <td className="py-2 px-4 border-b">
                <PersistentInput
                  value={product.quantity.toString()}
                  onChange={(value: string) => updateProduct(product.id, 'quantity', parseFloat(value) || 0)}
                  className="w-full bg-transparent"
                  type="number"
                />
              </td>
              <td className="py-2 px-4 border-b">
                <PersistentInput
                  value={product.priceHT.toString()}
                  onChange={(value: string) => updateProduct(product.id, 'priceHT', parseFloat(value) || 0)}
                  className="w-full bg-transparent"
                  type="number"
                />
              </td>
              <td className="py-2 px-4 border-b">
                <PersistentInput
                  value={product.tva.toString()}
                  onChange={(value: string) => updateProduct(product.id, 'tva', parseFloat(value) || 0)}
                  className="w-full bg-transparent"
                  type="number"
                />
              </td>
              <td className="py-2 px-4 border-b">
                {formatNumber(calculateLineTTC(product))}
              </td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => removeProduct(product.id)}
                  className="delete-button text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}, (prevProps, nextProps) => {
  // Vérifier si les props importantes ont changé
  return (
    prevProps.selectedTheme === nextProps.selectedTheme &&
    prevProps.pageNumber === nextProps.pageNumber &&
    prevProps.products === nextProps.products
  );
});

ProductsTable.displayName = 'ProductsTable';