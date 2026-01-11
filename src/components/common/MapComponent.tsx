import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  devices?: Array<{
    id: string;
    name: string;
    location: { lat: number; lng: number };
    status: string;
  }>;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

export function MapComponent({ 
  devices = [], 
  height = '400px',
  center = [20.5937, 78.9629], // India center by default
  zoom = 5 
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    if (devices.length > 0) {
      devices.forEach(device => {
        if (device.location && device.location.lat && device.location.lng) {
          const marker = L.marker([device.location.lat, device.location.lng])
            .addTo(mapRef.current!)
            .bindPopup(`
              <div class="p-2">
                <strong>${device.name}</strong><br/>
                <span class="text-sm text-gray-600">Status: ${device.status}</span>
              </div>
            `);
          
          markersRef.current.push(marker);
        }
      });

      // Fit bounds to show all markers
      if (markersRef.current.length > 0) {
        const group = L.featureGroup(markersRef.current);
        mapRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [devices]);

  return (
    <Card className="bg-white shadow-sm border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Live Device Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div
          ref={mapContainerRef}
          className="w-full rounded-lg overflow-hidden border border-gray-200"
          style={{ height }}
        />
        {devices.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 pointer-events-none rounded-lg">
            <div className="text-center space-y-2">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="text-gray-500 font-medium">No device locations available</p>
              <p className="text-sm text-gray-400">
                Device locations will appear here when available
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}