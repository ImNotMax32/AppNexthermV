// types/form.ts

export interface ClientInfo {
    name: string;
    email: string;
    phone: string;
}

export interface InstallerInfo {
    company: string;
    contact: string;
    email: string;
    phone: string;
    logo?: File;
}

export interface FormData {
    referenceNumber: string;
    pdfName: string;
    clientInfo: ClientInfo;
    installerInfo: InstallerInfo;
}

export interface PdfOptions {
    filename: string;
    orientation?: 'portrait' | 'landscape';
    format?: string;
    margin?: number;
    }
