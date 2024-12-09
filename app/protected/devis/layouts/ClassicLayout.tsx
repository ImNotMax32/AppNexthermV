import React from 'react';
import { LayoutProps } from '../types/devis';
import { LogoSection, QuoteInfoSection } from '../sections/CommonSections';
import { ProductsTable } from '../ProductsTable';
import { TotalsSection } from '../TotalsSection';
import { CompactInput } from '../inputs/CompactInput';

export const ClassicLayout: React.FC<LayoutProps> = ({
  pageNumber,
  pages,
  products,
  setProducts,
  updateProduct,
  removeProduct,
  selectedTheme,
  themes,
  ITEMS_PER_PAGE,
  calculateTotals,
  companyInfo,
  clientInfo,
  setClientInfo,
  setCompanyInfo,
  quoteInfo,
  setQuoteInfo,
  logoUrl,
  removeLogo,
  handleLogoUpload
}) => (
  <div key={pageNumber} className="w-[210mm] min-h-[297mm] bg-white shadow-lg p-8 relative mb-8">
    {pageNumber === 1 && (
      <div className="space-y-8">
        {/* En-tête */}
        <div className="flex justify-between items-start">
          <LogoSection
            logoUrl={logoUrl}
            removeLogo={removeLogo}
            handleLogoUpload={handleLogoUpload}
            selectedLayout="classique"
          />
          <p className="text-2xl font-bold" style={{ color: themes[selectedTheme].primary }}>
            DEVIS
          </p>
        </div>

        {/* Informations entreprise et client */}
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="font-medium" style={{ color: themes[selectedTheme].primary }}>
              Nos coordonnées
            </h2>
            <div className="space-y-4">
              <CompactInput
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                placeholder="Nom de l'entreprise"
                className="w-full"
              />
              <CompactInput
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                placeholder="Adresse"
                className="w-full"
              />
              <div className="flex gap-2">
                <CompactInput
                  value={companyInfo.zipCode}
                  onChange={(e) => setCompanyInfo({...companyInfo, zipCode: e.target.value})}
                  placeholder="Code postal"
                  className="w-1/3"
                />
                <CompactInput
                  value={companyInfo.city}
                  onChange={(e) => setCompanyInfo({...companyInfo, city: e.target.value})}
                  placeholder="Ville"
                  className="w-2/3"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-medium" style={{ color: themes[selectedTheme].primary }}>
              Client
            </h2>
            <div className="space-y-4">
              <CompactInput
                value={clientInfo.name}
                onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                placeholder="Nom du client"
                className="w-full"
              />
              <CompactInput
                value={clientInfo.address}
                onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})}
                placeholder="Adresse du client"
                className="w-full"
              />
              <div className="flex gap-8">
                <CompactInput
                  value={clientInfo.zipCode}
                  onChange={(e) => setClientInfo({...clientInfo, zipCode: e.target.value})}
                  placeholder="CP"
                  className="w-full"
                />
                <CompactInput
                  value={clientInfo.city}
                  onChange={(e) => setClientInfo({...clientInfo, city: e.target.value})}
                  placeholder="Ville"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <QuoteInfoSection
          quoteInfo={quoteInfo}
          setQuoteInfo={(newQuoteInfo) => setQuoteInfo(newQuoteInfo)}
          selectedTheme={selectedTheme}
          themes={themes}
        />
      </div>
    )}

    <div className="mb-20">
      <ProductsTable 
        pageNumber={pageNumber}
        products={products}
        updateProduct={updateProduct}
        removeProduct={removeProduct}
        selectedTheme={selectedTheme}
        themes={themes}
        ITEMS_PER_PAGE={ITEMS_PER_PAGE}
      />
      
      {pageNumber === pages && (
        <div className="relative mt-12">
          <TotalsSection 
            products={products}
            setProducts={setProducts}
            calculateTotals={calculateTotals}
            themes={themes}
            selectedTheme={selectedTheme}
          />
        </div>
      )}
    </div>

    <div className="absolute bottom-8 left-8 right-8 text-xs text-gray-500 flex justify-between border-t pt-4">
      <div>
        <p>Conditions de paiement : 30 jours</p>
        <p>TVA non applicable, art. 293 B du CGI</p>
        {companyInfo.siret && <p>SIRET: {companyInfo.siret}</p>}
      </div>
      <div>Page {pageNumber}/{pages}</div>
    </div>
  </div>
);