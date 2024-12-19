'use client';

import { Suspense, useEffect, useState } from 'react';
import DevisBuilder from '@/app/protected/devis/DevisBuilder';
import { Loader2 } from 'lucide-react';

function LoadingComponent() {
  const [loadAttempts, setLoadAttempts] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loadAttempts < 3) { // Limite le nombre de tentatives de rechargement
        setLoadAttempts(prev => prev + 1);
        window.location.reload();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [loadAttempts]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="animate-spin h-8 w-8 text-[#86BC29]" />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <DevisBuilder />
    </Suspense>
  );
}