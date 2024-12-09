// MapContent.tsx
'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, Phone, Mail } from 'lucide-react';
import L from 'leaflet';

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

interface MapContentProps {
  contacts?: Contact[];
}

// Composant pour gérer les mises à jour de la carte
function MapController() {
  const map = useMap();
  
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  
  return null;
}

const MapContent = ({ contacts = [] }: MapContentProps) => {
  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <MapContainer
      ref={mapRef}
      key="map"
      center={[46.227638, 2.213749]}
      zoom={6}
      style={{ height: "100%", width: "100%" }}
      whenReady={(map) => {
        setTimeout(() => {
          map.target.invalidateSize();
        }, 0);
      }}
    >
      <MapController />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {contacts.map((contact) => (
        <Marker key={contact.id} position={contact.position}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">{contact.name}</h3>
              <p className="text-sm text-gray-600">{contact.company}</p>
              <div className="mt-2 space-y-1 text-sm">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {contact.address}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> {contact.phone}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {contact.email}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapContent;