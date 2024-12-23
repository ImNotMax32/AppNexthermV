export const ITEMS_PER_PAGE = 10;
export const PAGE_HEIGHT = 297;
export const PAGE_MARGIN = 20;

export const themes: ThemeMap = {
  nature: {
    primary: '#86BC29',
    secondary: '#f0f9e8',
    accent: '#638e1e',
    text: '#2d3a12',
    name: 'Nature'
  },
  ocean: {
    primary: '#3b82f6',
    secondary: '#eff6ff',
    accent: '#2563eb',
    text: '#1e3a8a',
    name: 'Océan'
  },
  sunset: {
    primary: '#f97316',
    secondary: '#fff7ed',
    accent: '#ea580c',
    text: '#7c2d12',
    name: 'Coucher de soleil'
  },
  lavande: {
    primary: '#8b5cf6',
    secondary: '#f5f3ff',
    accent: '#7c3aed',
    text: '#4c1d95',
    name: 'Lavande'
  },
};
export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  name: string;
}

export interface ThemeMap {
  [key: string]: Theme;
}

export interface Layout {
  name: string;
  logoPosition: string;
  headerStyle: string;
  infoStyle: string;
  logoSize: {
    width: string;
    height: string;
  };
}


export interface Product {
  id: number;
  code: string;
  description: string;
  quantity: number;
  priceHT: number;
  tva: number;
  totalHT: number;
  totalTTC?: number;
}

export interface CompanyInfo {
  name: string;
  address: string;
  zipCode: string;
  city: string;
  phone: string;
  email: string;
  siret: string;
}

export interface ClientInfo {
  name: string;
  address: string;
  zipCode: string;
  city: string;
  phone: string;
  email: string;
}

export interface QuoteInfo {
  reference: string;
  creationDate: string;
  validityDate: string;
  tvaNumber: string;
}

export interface LayoutProps {
  pageNumber: number;
  pages: number;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  updateProduct: (id: number, field: keyof Product, value: string | number) => void;
  removeProduct: (id: number) => void;
  selectedTheme: string;
  themes: ThemeMap;
  ITEMS_PER_PAGE: number;
  calculateTotals: () => { totalHT: number; totalTVA: number; totalTTC: number };
  companyInfo: CompanyInfo;
  clientInfo: ClientInfo;
  quoteInfo: QuoteInfo;
  setQuoteInfo: React.Dispatch<React.SetStateAction<QuoteInfo>>;
  setClientInfo: React.Dispatch<React.SetStateAction<ClientInfo>>;
  setCompanyInfo: React.Dispatch<React.SetStateAction<CompanyInfo>>;
  logoUrl: string;
  removeLogo: () => void;
  handleLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface TotalsSectionProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  calculateTotals: () => { totalHT: number; totalTVA: number; totalTTC: number };
  themes: ThemeMap;
  selectedTheme: string;
}

export interface ProductsTableProps {
  pageNumber: number;
  products: Product[];
  updateProduct: (id: number, field: keyof Product, value: string | number) => void;
  removeProduct: (id: number) => void;
  selectedTheme: string;
  themes: ThemeMap;
}

export interface LayoutMap {
  [key: string]: Layout;
}

export const layouts: LayoutMap = {
  classique: {
    name: 'Classique',
    logoPosition: 'left',
    headerStyle: 'flex flex-col mb-12',
    infoStyle: 'grid grid-cols-4 gap-6',
    logoSize: {
      width: 'w-40',
      height: 'h-20'
    }
  },
  moderne: {
    name: 'Moderne',
    logoPosition: 'center',
    headerStyle: 'flex flex-col items-center mb-12',
    infoStyle: 'flex flex-col items-center gap-6',
    logoSize: {
      width: 'w-64',
      height: 'h-32'
    }
  },
  moderne2: {
    name: 'Moderne 2',
    logoPosition: 'center',
    headerStyle: 'flex flex-col items-center mb-12',
    infoStyle: 'flex flex-col items-center gap-6',
    logoSize: {
      width: 'w-64',
      height: 'h-32'
    }
  },
  
  
  minimal: {
    name: 'Minimal',
    logoPosition: 'left',
    headerStyle: 'h-24 flex items-center bg-primary',  // Style adapté au logo dans l'en-tête
    infoStyle: 'grid grid-cols-3 gap-12 mb-12',
    logoSize: {
      width: 'w-32',
      height: 'h-16' 
    }
  },
  
  contemporain: {
    name: 'Contemporain',
    logoPosition: 'dynamic',
    headerStyle: 'relative mb-12 overflow-hidden',
    infoStyle: 'grid grid-cols-2 gap-8',
    logoSize: {
      width: 'w-48',
      height: 'h-48'
    }
},
  contemporain2: {
    name: 'Contemporain 2',
    logoPosition: 'dynamic',
    headerStyle: 'relative mb-12 overflow-hidden',
    infoStyle: 'grid grid-cols-2 gap-8',
    logoSize: {
      width: 'w-48',
      height: 'h-48'
    }
  }
};
