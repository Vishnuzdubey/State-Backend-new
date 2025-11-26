import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, RefreshCw, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { superAdminApi, type DeviceLocation, type DeviceDetails } from '@/api/superAdmin';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function DeviceLiveMap() {
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [locations, setLocations] = useState<DeviceLocation[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([20.5937, 78.9629], 5); // India center

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    fetchLocations();

    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      if (autoRefresh) {
        fetchLocations();
      }
    }, 30000);

    return () => {
      clearInterval(intervalId);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [autoRefresh]);

  const fetchLocations = async () => {
    try {
      setError(null);
      const response = await superAdminApi.getDeviceLocations();
      setLocations(response.data);
      setLastUpdate(new Date());
      updateMarkers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch device locations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load device locations');
      setLoading(false);
    }
  };

  const updateMarkers = (deviceLocations: DeviceLocation[]) => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Add new markers
    deviceLocations.forEach(location => {
      if (location.latitude && location.longitude) {
        const marker = L.marker([location.latitude, location.longitude])
          .addTo(mapRef.current!)
          .bindPopup(`
            <div>
              <strong>IMEI:</strong> ${location.imei}<br/>
              <strong>Speed:</strong> ${location.speed || 0} km/h<br/>
              <button onclick="window.viewDeviceDetails('${location.imei}')" 
                style="margin-top: 8px; padding: 4px 8px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">
                View Details
              </button>
            </div>
          `);

        marker.on('click', () => {
          fetchDeviceDetails(location.imei);
        });

        markersRef.current.set(location.imei, marker);
      }
    });
  };

  const fetchDeviceDetails = async (imei: string) => {
    try {
      const response = await superAdminApi.getDeviceDetails(imei);
      setSelectedDevice(response.data);
    } catch (err) {
      console.error('Failed to fetch device details:', err);
    }
  };

  // Global function for popup button
  (window as any).viewDeviceDetails = (imei: string) => {
    fetchDeviceDetails(imei);
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchLocations();
  };

  const activeDevices = locations.filter(l => l.latitude && l.longitude).length;
  const movingDevices = locations.filter(l => l.speed && l.speed > 0).length;

  return (
    <div className="space-y-6 w-full h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/super-admin/devices')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Device Map</h1>
            <p className="text-sm text-gray-600">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={autoRefresh ? 'default' : 'outline'}>
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Navigation className={`h-4 w-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Devices</p>
            <p className="text-2xl font-bold">{locations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Active (with location)</p>
            <p className="text-2xl font-bold text-green-600">{activeDevices}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Moving</p>
            <p className="text-2xl font-bold text-blue-600">{movingDevices}</p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Map and Details */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Map */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Device Locations</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <div id="map" className="w-full h-full min-h-[500px]"></div>
          </CardContent>
        </Card>

        {/* Device Details */}
        <Card className="overflow-y-auto">
          <CardHeader>
            <CardTitle>Device Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDevice ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">IMEI</p>
                  <p className="font-mono font-medium">{selectedDevice.imei}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Serial Number</p>
                  <p className="font-mono">{selectedDevice.serial_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Manufacturer</p>
                  <p className="font-medium">{selectedDevice.manufacturer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Distributor</p>
                  <p className="font-medium">{selectedDevice.distributor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Model Code</p>
                  <p className="font-medium">{selectedDevice.VLTD_model_code}</p>
                </div>
                {selectedDevice.vehicle && (
                  <>
                    <hr />
                    <div>
                      <p className="text-sm text-gray-600">Vehicle Number</p>
                      <p className="font-bold">{selectedDevice.vehicle.vehicle_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Owner Name</p>
                      <p className="font-medium">{selectedDevice.vehicle.owner_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Owner Phone</p>
                      <p className="text-sm">{selectedDevice.vehicle.owner_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Valid Till</p>
                      <p className="text-sm text-green-600">
                        {new Date(selectedDevice.vehicle.valid_till).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}
                <Button
                  className="w-full"
                  onClick={() => navigate(`/super-admin/devices/${selectedDevice.imei}`)}
                >
                  View Full Details
                </Button>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Click on a marker to view device details
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
