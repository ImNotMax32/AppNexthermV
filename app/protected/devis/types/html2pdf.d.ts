declare module 'html2pdf.js' {
    interface Options {
      margin?: number[] | number;
      filename?: string;
      image?: { 
        type?: string; 
        quality?: number 
      };
      html2canvas?: { 
        scale?: number; 
        useCORS?: boolean; 
        letterRendering?: boolean 
      };
      jsPDF?: { 
        unit?: string; 
        format?: string; 
        orientation?: string;
        compress?: boolean 
      };
    }
  
    interface HTML2PDF {
      set(options: Options): HTML2PDF;
      from(element: HTMLElement | null): HTML2PDF;
      save(): Promise<void>;
      output(type: string, options?: any): Promise<any>;
    }
  
    function html2pdf(): HTML2PDF;
    export default html2pdf;
  }