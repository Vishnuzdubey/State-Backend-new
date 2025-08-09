import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface MapComponentProps {
  devices?: Array<{
    id: string;
    name: string;
    location: { lat: number; lng: number };
    status: string;
  }>;
  height?: string;
}

export function MapComponent({ devices = [], height = '400px' }: MapComponentProps) {
  return (
    <Card className="bg-white shadow-sm border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Live Device Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
          style={{ height }}
        >
          <div className="text-center space-y-2">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="text-gray-500 font-medium">Map Integration Placeholder</p>
            <p className="text-sm text-gray-400">
              Google Maps / Mapbox will be integrated here
            </p>
            {devices.length > 0 && (
              <p className="text-sm text-gray-600">
                {devices.length} devices to display
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}