import React from 'react';
import { LayoutProps } from '../types/devis';
import { LogoSection, QuoteInfoSection } from '../sections/CommonSections';
import { ProductsTable } from '../ProductsTable';
import { TotalsSection } from '../TotalsSection';
import { CompactInput } from '../inputs/CompactInput';

export const ModernLayout: React.FC<LayoutProps> = ({
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
  <div key={pageNumber} className="w-[210mm] bg-white shadow-lg p-8 relative mb-8 overflow-hidden">
    {pageNumber === 1 && (
      <>
        <div className="text-center mb-12">
          <div className="mb-6">
            <LogoSection
              logoUrl={logoUrl}
              removeLogo={removeLogo}
              handleLogoUpload={handleLogoUpload}
              selectedLayout="moderne"
            />
          </div>
          <p className="text-3xl font-bold mt-6" style={{ color: themes[selectedTheme].primary }}>
            DEVIS
          </p>
        </div>

        <div className="relative mb-12">
          <div
            className="absolute top-0 left-1/2 bottom-0 w-px -translate-x-1/2"
            style={{ backgroundColor: themes[selectedTheme].secondary }}
          />

          <div className="grid grid-cols-2 gap-16">
            <div className="pr-12 space-y-6">
              <h2 className="font-medium text-xl pb-2 border-b-2" style={{ color: themes[selectedTheme].primary, borderColor: themes[selectedTheme].primary }}>
                Notre entreprise
              </h2>
              <div className="space-y-4">
                <CompactInput
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                  placeholder="Nom de l'entreprise"
                  className="w-full bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                />
                <CompactInput
                  value={companyInfo.address}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                  placeholder="Adresse"
                  className="w-full bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                />
                <div className="grid grid-cols-2 gap-4">
                  <CompactInput
                    value={companyInfo.zipCode}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, zipCode: e.target.value })}
                    placeholder="Code postal"
                    className="bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                  />
                  <CompactInput
                    value={companyInfo.city}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, city: e.target.value })}
                    placeholder="Ville"
                    className="bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <CompactInput
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                    placeholder="Téléphone"
                    className="bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                  />
                  <CompactInput
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                    placeholder="Email"
                    className="bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                  />
                </div>
              </div>
            </div>

            <div className="pl-12 space-y-6">
              <h2 className="font-medium text-xl pb-2 border-b-2" style={{ color: themes[selectedTheme].accent, borderColor: themes[selectedTheme].accent }}>
                Client
              </h2>
              <div className="space-y-4">
                <CompactInput
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                  placeholder="Nom du client"
                  className="w-full bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                />
                <CompactInput
                  value={clientInfo.address}
                  onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                  placeholder="Adresse"
                  className="w-full bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                />
                <div className="grid grid-cols-2 gap-4">
                  <CompactInput
                    value={clientInfo.zipCode}
                    onChange={(e) => setClientInfo({ ...clientInfo, zipCode: e.target.value })}
                    placeholder="Code postal"
                    className="bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                  />
                  <CompactInput
                    value={clientInfo.city}
                    onChange={(e) => setClientInfo({ ...clientInfo, city: e.target.value })}
                    placeholder="Ville"
                    className="bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <CompactInput
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                    placeholder="Téléphone"
                    className="bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                  />
                  <CompactInput
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                    placeholder="Email"
                    className="bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                  />
                </div>
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
      </>
    )}


    <div className="mb-20">
      <ProductsTable
        products={products}
        pageNumber={pageNumber}
        updateProduct={updateProduct}
        removeProduct={removeProduct}
        selectedTheme={selectedTheme}
        themes={themes}
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

export const Modern2Layout: React.FC<LayoutProps> = ({
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
  <div key={pageNumber} className="w-[210mm] bg-white shadow-lg relative mb-8">
    {/* Background design elements */}
    <div className="absolute inset-0">
      <div
        className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full opacity-5 transform -translate-x-1/2 -translate-y-1/2"
        style={{ backgroundColor: themes[selectedTheme].primary }}
      />
      <div
        className="absolute bottom-0 right-0 w-[300px] h-[300px] opacity-5"
        style={{
          backgroundColor: themes[selectedTheme].accent,
          clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)'
        }}
      />
    </div>

    <div className="relative p-8">
      {pageNumber === 1 && (
        <>
          <div className="grid grid-cols-12 gap-8 mb-16">
            {/* Colonne vide à gauche pour l'équilibre */}
            <div className="col-span-3"></div>

            {/* Logo au centre */}
            <div className="col-span-6 flex justify-center items-center">
              <div className="w-2/3">
                <LogoSection
                  logoUrl={logoUrl}
                  removeLogo={removeLogo}
                  handleLogoUpload={handleLogoUpload}
                  selectedLayout="moderne2"
                />
              </div>
            </div>

            {/* Titre DEVIS à droite */}
            <div className="col-span-3 flex flex-col justify-center text-right">
              <h1
                className="text-5xl font-black mb-2 tracking-tight"
                style={{ color: themes[selectedTheme].primary }}
              >
                DEVIS
              </h1>
              <div className="text-sm text-gray-500">
                <p>N° {quoteInfo.reference}</p>
                <p>Le {quoteInfo.creationDate}</p>
              </div>
            </div>
          </div>

          {/* Company and Client sections with modern cards */}
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2
                className="text-lg font-semibold mb-6 flex items-center gap-2"
                style={{ color: themes[selectedTheme].primary }}
              >
                <span className="w-1 h-4 rounded-full" style={{ backgroundColor: themes[selectedTheme].primary }}></span>
                Notre entreprise
              </h2>
              <div className="space-y-4">
                <CompactInput
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                  placeholder="Nom de l'entreprise"
                  className="w-full bg-white"
                />
                <CompactInput
                  value={companyInfo.address}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                  placeholder="Adresse"
                  className="w-full bg-white"
                />
                <div className="grid grid-cols-2 gap-4">
                  <CompactInput
                    value={companyInfo.zipCode}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, zipCode: e.target.value })}
                    placeholder="Code postal"
                    className="bg-white"
                  />
                  <CompactInput
                    value={companyInfo.city}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, city: e.target.value })}
                    placeholder="Ville"
                    className="bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <CompactInput
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                    placeholder="Téléphone"
                    className="bg-white"
                  />
                  <CompactInput
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                    placeholder="Email"
                    className="bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h2
                className="text-lg font-semibold mb-6 flex items-center gap-2"
                style={{ color: themes[selectedTheme].accent }}
              >
                <span className="w-1 h-4 rounded-full" style={{ backgroundColor: themes[selectedTheme].accent }}></span>
                Client
              </h2>
              <div className="space-y-4">
                <CompactInput
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                  placeholder="Nom du client"
                  className="w-full bg-white"
                />
                <CompactInput
                  value={clientInfo.address}
                  onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                  placeholder="Adresse"
                  className="w-full bg-white"
                />
                <div className="grid grid-cols-2 gap-4">
                  <CompactInput
                    value={clientInfo.zipCode}
                    onChange={(e) => setClientInfo({ ...clientInfo, zipCode: e.target.value })}
                    placeholder="Code postal"
                    className="bg-white"
                  />
                  <CompactInput
                    value={clientInfo.city}
                    onChange={(e) => setClientInfo({ ...clientInfo, city: e.target.value })}
                    placeholder="Ville"
                    className="bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <CompactInput
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                    placeholder="Téléphone"
                    className="bg-white"
                  />
                  <CompactInput
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                    placeholder="Email"
                    className="bg-white"
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
        </>
      )}

      {/* Products table and totals remain the same */}
      <div className="mb-20">
        <ProductsTable
          products={products}
          pageNumber={pageNumber}
          updateProduct={updateProduct}
          removeProduct={removeProduct}
          selectedTheme={selectedTheme}
          themes={themes}
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

      {/* Footer with modern style */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-50">
        <div className="px-8 py-4 text-xs text-gray-600 flex justify-between">
          <div>
            <p>Conditions de paiement : 30 jours</p>
            <p>TVA non applicable, art. 293 B du CGI</p>
            {companyInfo.siret && <p>SIRET: {companyInfo.siret}</p>}
          </div>
          <div className="self-end">
            Page {pageNumber}/{pages}
          </div>
        </div>
      </div>
    </div>
  </div>
);