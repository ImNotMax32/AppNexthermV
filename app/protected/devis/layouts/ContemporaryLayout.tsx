import React from 'react';
import { LayoutProps, layouts } from '../types/devis';
import { LogoSection, QuoteInfoSection } from '../sections/CommonSections';
import { ProductsTable } from '../ProductsTable';
import { TotalsSection } from '../TotalsSection';
import { CompactInput } from '../inputs/CompactInput';

export const ContemporaryLayout: React.FC<LayoutProps> = ({
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
    <div className="absolute inset-0">
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full transform translate-x-1/3 -translate-y-1/3 opacity-10"
        style={{ backgroundColor: themes[selectedTheme].primary }}
      />
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[300px] transform translate-x-1/4 translate-y-1/4 opacity-5"
        style={{
          backgroundColor: themes[selectedTheme].accent,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 20% 100%)'
        }}
      />
    </div>

    <div className="relative p-12">
      {pageNumber === 1 && (
        <>
          <div className="flex justify-between items-start mb-16">
            <div className={`${layouts.contemporain.logoSize.width} ${layouts.contemporain.logoSize.height}`}>
              <LogoSection
                logoUrl={logoUrl}
                removeLogo={removeLogo}
                handleLogoUpload={handleLogoUpload}
                selectedLayout="contemporain"
              />
            </div>
            <div className="text-right">
              <h1
                className="text-6xl font-black mb-8 tracking-tight"
                style={{ color: themes[selectedTheme].primary }}
              >
                DEVIS
              </h1>
              <p className="text-sm opacity-60">N° {quoteInfo.reference}</p>
              <p className="text-sm opacity-60">Le {quoteInfo.creationDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-16">
            <div className="space-y-6">
              <div
                className="text-lg font-medium pb-2 border-b-2"
                style={{ borderColor: themes[selectedTheme].primary }}
              >
                Notre entreprise
              </div>
              <div className="space-y-3">
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
                <div className="flex gap-4">
                  <CompactInput
                    value={companyInfo.zipCode}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, zipCode: e.target.value })}
                    placeholder="Code postal"
                    className="w-1/3 bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                  />
                  <CompactInput
                    value={companyInfo.city}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, city: e.target.value })}
                    placeholder="Ville"
                    className="w-2/3 bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                  />
                </div>
                <div className="flex gap-4">
                  <CompactInput
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                    placeholder="Téléphone"
                    className="w-1/2 bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                  />
                  <CompactInput
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                    placeholder="Email"
                    className="w-1/2 bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div
                className="text-lg font-medium pb-2 border-b-2"
                style={{ borderColor: themes[selectedTheme].accent }}
              >
                Client
              </div>
              <div className="space-y-3">
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
                <div className="flex gap-4">
                  <CompactInput
                    value={clientInfo.zipCode}
                    onChange={(e) => setClientInfo({ ...clientInfo, zipCode: e.target.value })}
                    placeholder="Code postal"
                    className="w-1/3 bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                  />
                  <CompactInput
                    value={clientInfo.city}
                    onChange={(e) => setClientInfo({ ...clientInfo, city: e.target.value })}
                    placeholder="Ville"
                    className="w-2/3 bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                  />
                </div>
                <div className="flex gap-4">
                  <CompactInput
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                    placeholder="Téléphone"
                    className="w-1/2 bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                  />
                  <CompactInput
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                    placeholder="Email"
                    className="w-1/2 bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Contenu commun */}
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

      {/* Footer */}
      <div className="absolute bottom-8 left-8 right-8 text-xs text-gray-500 flex justify-between border-t pt-4">
        <div>
          <p>Conditions de paiement : 30 jours</p>
          <p>TVA non applicable, art. 293 B du CGI</p>
          {companyInfo.siret && <p>SIRET: {companyInfo.siret}</p>}
        </div>
        <div>Page {pageNumber}/{pages}</div>
      </div>
    </div>
  </div>
);

export const Contemporary2Layout: React.FC<LayoutProps> = ({
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
    {/* Formes abstraites différentes */}
    <div className="absolute inset-0">
      <div
        className="absolute top-0 left-0 w-[500px] h-[300px] transform -translate-x-1/4 -translate-y-1/4 opacity-5"
        style={{
          backgroundColor: themes[selectedTheme].primary,
          clipPath: 'polygon(0 0, 100% 0, 0 100%)'
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full transform translate-x-1/4 translate-y-1/4 opacity-5"
        style={{ backgroundColor: themes[selectedTheme].accent }}
      />
      <div
        className="absolute bottom-12 right-12 w-48 h-48 rounded-full opacity-5"
        style={{ backgroundColor: themes[selectedTheme].primary }}
      />
    </div>

    <div className="relative p-12">
      {pageNumber === 1 && (
        <>
          {/* En-tête avec disposition différente */}
          <div className="flex justify-between items-center mb-16">
            <h1
              className="text-7xl font-black tracking-tighter"
              style={{ color: themes[selectedTheme].primary }}
            >
              DEVIS
            </h1>
            <div className="flex flex-col items-end space-y-2">
              <div className={`${layouts.contemporain2.logoSize.width} ${layouts.contemporain2.logoSize.height}`}>
                <LogoSection
                  logoUrl={logoUrl}
                  removeLogo={removeLogo}
                  handleLogoUpload={handleLogoUpload}
                  selectedLayout="contemporain2"
                />
              </div>
              <div className="text-sm opacity-60">
                <p>N° {quoteInfo.reference}</p>
                <p>Le {quoteInfo.creationDate}</p>
              </div>
            </div>
          </div>

          {/* Section informations avec style différent */}
          <div className="grid grid-cols-2 gap-4 mb-16">
            <div className="relative">
              <div
                className="absolute top-0 left-0 w-12 h-1 rounded"
                style={{ backgroundColor: themes[selectedTheme].primary }}
              />
              <div className="pt-8 space-y-6">
                <h2 className="text-2xl font-light">Notre entreprise</h2>
                <div className="space-y-3">
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
                  <div className="flex gap-4">
                    <CompactInput
                      value={companyInfo.zipCode}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, zipCode: e.target.value })}
                      placeholder="Code postal"
                      className="w-1/3 bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                    />
                    <CompactInput
                      value={companyInfo.city}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, city: e.target.value })}
                      placeholder="Ville"
                      className="w-2/3 bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                    />
                  </div>
                  <div className="flex gap-4">
                    <CompactInput
                      value={companyInfo.phone}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                      placeholder="Téléphone"
                      className="w-1/3 bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                    />
                    <CompactInput
                      value={companyInfo.email}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                      placeholder="Email"
                      className="w-2/3 bg-transparent border-0 border-b focus:border-b-2 rounded-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div
                className="absolute top-0 right-0 w-12 h-1 rounded"
                style={{ backgroundColor: themes[selectedTheme].accent }}
              />
              <div className="pt-8 space-y-6">
                <h2 className="text-2xl font-light text-right">Client</h2>
                <div className="space-y-3">
                  <CompactInput
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                    placeholder="Nom du client"
                    className="w-full bg-transparent border-0 border-b focus:border-b-2 rounded-none text-right"
                  />
                  <CompactInput
                    value={clientInfo.address}
                    onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                    placeholder="Adresse"
                    className="w-full bg-transparent border-0 border-b focus:border-b-2 rounded-none text-right"
                  />
                  <div className="flex gap-4">
                    <CompactInput
                      value={clientInfo.zipCode}
                      onChange={(e) => setClientInfo({ ...clientInfo, zipCode: e.target.value })}
                      placeholder="Code postal"
                      className="w-1/3 bg-transparent border-0 border-b focus:border-b-2 rounded-none text-right"
                    />
                    <CompactInput
                      value={clientInfo.city}
                      onChange={(e) => setClientInfo({ ...clientInfo, city: e.target.value })}
                      placeholder="Ville"
                      className="w-2/3 bg-transparent border-0 border-b focus:border-b-2 rounded-none text-right"
                    />
                  </div>
                  <div className="flex gap-4">
                    <CompactInput
                      value={clientInfo.phone}
                      onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                      placeholder="Téléphone"
                      className="w-1/3 bg-transparent border-0 border-b focus:border-b-2 rounded-none text-right"
                    />
                    <CompactInput
                      value={clientInfo.email}
                      onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                      placeholder="Email"
                      className="w-2/3 bg-transparent border-0 border-b focus:border-b-2 rounded-none text-right"
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

      <div className="mb-24">
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
  </div>
);