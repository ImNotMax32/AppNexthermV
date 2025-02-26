// types/showcase.ts
import { BuildingData } from '@/app/protected/dimensionnement/resume/types/building'
import { Product } from './product';


export interface ClientInfo {
  name: string;
  address: string;
  phone: string;
  city: string;
  postalCode: string;
  email: string;
}

export interface InstallerInfo {
  company: string;
  contact: string;
  email: string;
  phone: string;
  logo?: Blob | null;
}

export interface Spec {
  type: string;
  icon: React.ReactElement;
  label: string;
  value: string | number;
  description: string;
}

export interface TechnicalSpecs {
  reference: Spec;
  powerSpecs: Spec[];
  performanceSpecs: Spec[];
}

export interface FormData {
  pdfName: string;
  client: {
    name: string;
    address: string;
    phone: string;
    city: string;
    postalCode: string;
    email: string;
  };
  installer: {
    company: string;
    contact: string;
    email: string;
    phone: string;
    logo: File | null;
  };
}

export type FormSection = 'general' | 'client' | 'installer';

