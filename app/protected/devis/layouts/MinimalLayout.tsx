import React from 'react';
import { LayoutProps } from '../types/devis';
import { LogoSection, QuoteInfoSection } from '../sections/CommonSections';
import { ProductsTable } from '../ProductsTable';
import { TotalsSection } from '../TotalsSection';
import { CompactInput } from '../inputs/CompactInput';

export const MinimalLayout: React.FC<LayoutProps> = ({
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
  <div className="w-[210mm] bg-white shadow-lg relative mb-8 overflow-hidden">
    {pageNumber === 1 && (
      <div className="p-8">
        {/* En-tête minimaliste */}
        <div className="flex items-center justify-between mb-12 border-b pb-6">
          <div className="w-48">
            <LogoSection
              logoUrl={logoUrl}
              removeLogo={removeLogo}
              handleLogoUpload={handleLogoUpload}
              selectedLayout="minimal"
            />
          </div>
          <div className="flex flex-col items-end">
            <h1
              className="text-3xl font-light tracking-wide"
              style={{ color: themes[selectedTheme].primary }}
            >
              DEVIS
            </h1>
            <div className="text-sm mt-2 text-gray-600">
              <p>N° {quoteInfo.reference}</p>
              <p>Le {quoteInfo.creationDate}</p>
            </div>
          </div>
        </div>

        {/* Informations entreprise et client */}
        <div className="grid grid-cols-2 gap-16 mb-12">
          {/* Notre entreprise */}
          <div>
            <h2
              className="text-sm uppercase tracking-wider mb-6"
              style={{ color: themes[selectedTheme].primary }}
            >
              Notre entreprise
            </h2>
            <div className="space-y-4">
              <CompactInput
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                placeholder="Nom de l'entreprise"
                className="w-full bg-transparent border-0 border-b focus:ring-0"
              />
              <CompactInput
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                placeholder="Adresse"
                className="w-full bg-transparent border-0 border-b focus:ring-0"
              />
              <div className="grid grid-cols-2 gap-4">
                <CompactInput
                  value={companyInfo.zipCode}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, zipCode: e.target.value })}
                  placeholder="Code postal"
                  className="bg-transparent border-0 border-b focus:ring-0"
                />
                <CompactInput
                  value={companyInfo.city}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, city: e.target.value })}
                  placeholder="Ville"
                  className="bg-transparent border-0 border-b focus:ring-0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CompactInput
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                  placeholder="Téléphone"
                  className="bg-transparent border-0 border-b focus:ring-0"
                />
                <CompactInput
                  value={companyInfo.email}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                  placeholder="Email"
                  className="bg-transparent border-0 border-b focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Client */}
          <div>
            <h2
              className="text-sm uppercase tracking-wider mb-6"
              style={{ color: themes[selectedTheme].accent }}
            >
              Client
            </h2>
            <div className="space-y-4">
              <CompactInput
                value={clientInfo.name}
                onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                placeholder="Nom du client"
                className="w-full bg-transparent border-0 border-b focus:ring-0"
              />
              <CompactInput
                value={clientInfo.address}
                onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                placeholder="Adresse"
                className="w-full bg-transparent border-0 border-b focus:ring-0"
              />
              <div className="grid grid-cols-2 gap-4">
                <CompactInput
                  value={clientInfo.zipCode}
                  onChange={(e) => setClientInfo({ ...clientInfo, zipCode: e.target.value })}
                  placeholder="Code postal"
                  className="bg-transparent border-0 border-b focus:ring-0"
                />
                <CompactInput
                  value={clientInfo.city}
                  onChange={(e) => setClientInfo({ ...clientInfo, city: e.target.value })}
                  placeholder="Ville"
                  className="bg-transparent border-0 border-b focus:ring-0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CompactInput
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                  placeholder="Téléphone"
                  className="bg-transparent border-0 border-b focus:ring-0"
                />
                <CompactInput
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                  placeholder="Email"
                  className="bg-transparent border-0 border-b focus:ring-0"
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

    {/* Section des produits */}
    <div className="px-8">
      <ProductsTable
        products={products}
        pageNumber={pageNumber}
        updateProduct={updateProduct}
        removeProduct={removeProduct}
        selectedTheme={selectedTheme}
        themes={themes}
      />

      {pageNumber === pages && (
        <div className="my-24">
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

    {/* Footer minimaliste */}
    <div
      className="absolute bottom-0 left-0 right-0 px-8 py-4 text-xs text-gray-600 border-t"
    >
      <div className="flex justify-between">
        <div>
          <p>Conditions de paiement : 30 jours</p>
          <p>TVA non applicable, art. 293 B du CGI</p>
          {companyInfo.siret && <p>SIRET: {companyInfo.siret}</p>}
        </div>
        <div className="self-end">Page {pageNumber}/{pages}</div>
      </div>
    </div>
  </div>
);