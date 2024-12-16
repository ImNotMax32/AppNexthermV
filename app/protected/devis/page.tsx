'use client';

import { Suspense } from 'react';
import DevisBuilder from '@/app/protected/devis/DevisBuilder';
import { Loader2 } from 'lucide-react';

export default function Page() {
  return (
    <Suspense 
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="animate-spin h-8 w-8 text-[#86BC29]" />
        </div>
      }
    >
      <DevisBuilder />
    </Suspense>
  );
}