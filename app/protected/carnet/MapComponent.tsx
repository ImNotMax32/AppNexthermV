// MapComponent.tsx
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

interface Contact {
  id: number;
  name: string;
  company: string;
  type: 'client' | 'prospect' | 'fournisseur';
  address: string;
  phone: string;
  email: string;
  position: [number, number];
}

interface MapComponentProps {
  contacts: Contact[];
}

const MapContentWithNoSSR = dynamic(() => import('./MapContent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      Chargement de la carte...
    </div>
  ),
});

const MapComponent = ({ contacts }: MapComponentProps) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <div>Chargement...</div>;
  }

  return (
    <div id="map-container" style={{ height: "100%", width: "100%" }}>
      <MapContentWithNoSSR contacts={contacts} />
    </div>
  );
};

export default MapComponent;