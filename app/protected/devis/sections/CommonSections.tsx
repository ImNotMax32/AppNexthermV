import React from 'react';
import { Upload, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CompactInput } from '../inputs/CompactInput';
import { layouts } from '../types/devis';
import { CompanyInfo, ClientInfo, QuoteInfo } from '../types/devis';

interface LogoSectionProps {
  logoUrl: string;
  removeLogo: () => void;
  handleLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedLayout: string;
}

export const LogoSection: React.FC<LogoSectionProps> = ({
  logoUrl,
  removeLogo,
  handleLogoUpload,
  selectedLayout
}) => (
  <div className={`${layouts[selectedLayout].logoSize.width} ${layouts[selectedLayout].logoSize.height}
    ${selectedLayout === 'moderne' ? 'mx-auto' : ''}
    border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden`}>
    {logoUrl ? (
      <div className="relative w-full h-full group flex items-center justify-center">
        <img
          src={logoUrl}
          alt="Logo"
          className="w-full h-full object-contain"
          style={{ maxWidth: '100%', maxHeight: '100%', display: 'block !important', objectPosition: 'center !important', objectFit: 'contain' }}
        />
        <button
          onClick={removeLogo}
          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-3 w-3 text-gray-500" />
        </button>
      </div>
    ) : (
      <label className="cursor-pointer text-center p-2 hover:bg-gray-50 transition-colors rounded-lg w-full h-full flex flex-col items-center justify-center">
        <Upload className="h-4 w-4 text-gray-400 mb-1" />
        <span className="text-xs text-gray-500">Ajouter un logo</span>
        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
      </label>
    )}
  </div>
);

interface QuoteInfoSectionProps {
  quoteInfo: QuoteInfo;
  setQuoteInfo: (info: QuoteInfo) => void;
  selectedTheme: string;
  themes: any;
}

export const QuoteInfoSection: React.FC<QuoteInfoSectionProps> = ({
  quoteInfo,
  setQuoteInfo,
  selectedTheme,
  themes
}) => (
  <div
    className="grid grid-cols-4 gap-4 my-8 p-4 rounded-lg"
    style={{ backgroundColor: themes[selectedTheme].secondary }}
  >
    <div>
      <Label className="text-xs text-gray-600">Ref. Devis</Label>
      <Input
        value={quoteInfo.reference}
        onChange={(e) => setQuoteInfo({ ...quoteInfo, reference: e.target.value })}
        placeholder="DEV-2024-001"
        className="text-sm mt-1"
      />
    </div>
    {/* ... Autres champs du QuoteInfo ... */}
  </div>
);
