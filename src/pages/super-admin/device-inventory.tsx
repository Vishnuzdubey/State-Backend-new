import { useState, useEffect, useRef } from 'react';
import {
  Download,
  FileText,
  Search,
  MapPin,
  Calendar,
  Smartphone,
  Wifi,
  Shield,
  ArrowLeft,
  Map,
  X,
  Navigation2,
  Car,
  Eye,
  Printer,
  Power,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { superAdminApi, type DeviceData, type DeviceLocation, type DeviceDetails } from '@/api/superAdmin';
import { useNavigate } from 'react-router-dom';
import { previewCertificate, printCertificate } from '@/utils/certificateUtils';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DeviceWithLocation extends DeviceData {
  location?: DeviceLocation;
}

export function DeviceInventory() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState('2025-02-10');
  const [uptoDate, setUptoDate] = useState('2025-08-09');
  const [searchImei, setSearchImei] = useState('');
  const [devices, setDevices] = useState<DeviceWithLocation[]>([]);
  const [locations, setLocations] = useState<DeviceLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMapView, setShowMapView] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceDetails | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new globalThis.Map());

  // Activation Dialog States
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
  const [activationStep, setActivationStep] = useState<'search' | 'userCheck' | 'form'>('search');
  const [activationImei, setActivationImei] = useState('');
  const [searchedDevice, setSearchedDevice] = useState<any>(null);
  const [permitHolder, setPermitHolder] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [vehicleForm, setVehicleForm] = useState({
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    owner_address: '',
    fuel_type: 'Petrol',
    rc_registered_name: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_type: 'CAR',
    entity_type: 'Individual',
    choose_plan: 'Basic',
    vehicle_number: '',
    chassis_number: '',
  });

  useEffect(() => {
    fetchDevices();
    fetchLocations();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminApi.getDevices({ page: 1, pageSize: 10000 });
      setDevices(response.devices);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
      setError(err instanceof Error ? err.message : 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await superAdminApi.getDeviceLocations();
      setLocations(response.data);
      if (showMapView) {
        updateMarkers(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  };

  useEffect(() => {
    if (showMapView && !mapRef.current) {
      // Initialize map
      setTimeout(() => {
        mapRef.current = L.map('embedded-map').setView([20.5937, 78.9629], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapRef.current);

        updateMarkers(locations);
      }, 100);
    }

    return () => {
      if (!showMapView && mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current.clear();
      }
    };
  }, [showMapView]);

  const updateMarkers = (deviceLocations: DeviceLocation[]) => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Add new markers for devices with location
    deviceLocations.forEach(location => {
      if (location.latitude && location.longitude) {
        const marker = L.marker([location.latitude, location.longitude])
          .addTo(mapRef.current!)
          .bindPopup(`
            <div>
              <strong>IMEI:</strong> ${location.imei}<br/>
              <strong>Speed:</strong> ${location.speed || 0} km/h
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

  const handleLocationClick = (device: DeviceWithLocation) => {
    if (device.location?.latitude && device.location?.longitude) {
      setShowMapView(true);
      setTimeout(() => {
        if (mapRef.current && device.location?.latitude && device.location?.longitude) {
          mapRef.current.setView([device.location.latitude, device.location.longitude], 15);
          fetchDeviceDetails(device.imei);
        }
      }, 200);
    } else {
      alert('No location data available for this device');
    }
  };

  const handleSearchDevice = async () => {
    if (!activationImei.trim()) {
      setActivationError('Please enter an IMEI number');
      return;
    }

    setIsSearching(true);
    setActivationError(null);

    try {
      const response = await superAdminApi.searchDevice(activationImei);

      if (response.devices && response.devices.length > 0) {
        const device = response.devices[0];
        setSearchedDevice(device);

        // Check if device is already assigned
        if (device.vehicle && device.vehicle.owner_phone) {
          setActivationError(
            `Device is already assigned to ${device.vehicle.owner_name} (${device.vehicle.owner_phone}). Cannot reassign.`
          );
          setIsSearching(false);
          return;
        }

        // Device is not assigned, move to user check step
        setActivationStep('userCheck');
      } else {
        setActivationError('Device not found in inventory');
      }
    } catch (err) {
      console.error('Failed to search device:', err);
      setActivationError(err instanceof Error ? err.message : 'Failed to search device');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFindUser = async () => {
    if (!vehicleForm.owner_phone.trim()) {
      setActivationError('Please enter owner phone number');
      return;
    }

    setIsSearching(true);
    setActivationError(null);

    try {
      const response = await superAdminApi.findUser(vehicleForm.owner_phone);

      if (response.user) {
        setPermitHolder(response.user);
        // Pre-fill form with user data
        setVehicleForm(prev => ({
          ...prev,
          owner_name: `${response.user.first_name} ${response.user.last_name}`,
          owner_email: response.user.email,
          owner_phone: response.user.phone,
          owner_address: response.user.address,
        }));
        setActivationStep('form');
      }
    } catch (err) {
      // User not found, continue with manual entry
      console.log('User not found, continuing with manual entry');
      setPermitHolder(null);
      setActivationStep('form');
    } finally {
      setIsSearching(false);
    }
  };

  const handleActivateDevice = async () => {
    if (!searchedDevice || !activationImei) {
      setActivationError('Invalid device data');
      return;
    }

    // Validate required fields
    if (!vehicleForm.owner_name || !vehicleForm.owner_email || !vehicleForm.owner_phone ||
      !vehicleForm.vehicle_number || !vehicleForm.chassis_number) {
      setActivationError('Please fill all required fields');
      return;
    }

    setIsActivating(true);
    setActivationError(null);

    try {
      const vehicleData = {
        ...vehicleForm,
        imei: activationImei,
      };

      // If permit holder exists, use their ID, otherwise the API will create a new user
      const userId = permitHolder?.id || 'new';

      await superAdminApi.assignVehicle(userId, vehicleData);

      alert('Device activated successfully!');

      // Reset and close dialog
      handleCloseActivationDialog();

      // Refresh device list
      fetchDevices();
    } catch (err) {
      console.error('Failed to activate device:', err);
      setActivationError(err instanceof Error ? err.message : 'Failed to activate device');
    } finally {
      setIsActivating(false);
    }
  };

  const handleCloseActivationDialog = () => {
    setIsActivateDialogOpen(false);
    setActivationStep('search');
    setActivationImei('');
    setSearchedDevice(null);
    setPermitHolder(null);
    setActivationError(null);
    setVehicleForm({
      owner_name: '',
      owner_email: '',
      owner_phone: '',
      owner_address: '',
      fuel_type: 'Petrol',
      rc_registered_name: '',
      vehicle_make: '',
      vehicle_model: '',
      vehicle_type: 'CAR',
      entity_type: 'Individual',
      choose_plan: 'Basic',
      vehicle_number: '',
      chassis_number: '',
    });
  };

  // Merge devices with their locations
  const devicesWithLocations = devices.map(device => {
    const location = locations.find(loc => loc.imei === device.imei);
    return { ...device, location };
  });

  const deviceColumns = [
    {
      key: 'vehicle',
      header: 'Vehicle Registration Number',
      render: (value: any) => (
        <div className="font-mono text-sm font-medium">
          {value?.vehicle_number || <span className="text-gray-400">Not assigned</span>}
        </div>
      )
    },
    {
      key: 'VLTD_model_code',
      header: 'VLTD Model Code',
      render: (value: string) => (
        <Badge variant="outline" className="font-medium">{value}</Badge>
      )
    },
    {
      key: 'imei',
      header: 'IMEI Number',
      render: (value: string) => (
        <button
          onClick={() => navigate(`/super-admin/devices/${value}`)}
          className="font-mono text-sm text-blue-600 hover:underline"
        >
          {value}
        </button>
      )
    },
    {
      key: 'eSIM_1_provider',
      header: 'ESIM Provider',
      render: (value: string, row: any) => (
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-blue-500" />
          <span>{value} / {row.eSIM_2_provider}</span>
        </div>
      )
    },
    {
      key: 'vehicle',
      header: 'Valid Upto',
      render: (value: any) => {
        if (!value?.valid_till) return <span className="text-gray-400">N/A</span>;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-500" />
            <span className="text-sm">{new Date(value.valid_till).toLocaleDateString()}</span>
          </div>
        );
      }
    },
    {
      key: 'location',
      header: 'Last Location',
      render: (value: DeviceLocation | undefined, row: DeviceWithLocation) => {
        if (!value?.latitude || !value?.longitude) {
          return <span className="text-gray-400 text-sm">No location data</span>;
        }
        return (
          <button
            onClick={() => handleLocationClick(row)}
            className="max-w-xs hover:bg-blue-50 p-1 rounded transition-colors"
          >
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-blue-600 hover:underline">
                {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
              </span>
            </div>
          </button>
        );
      }
    },
    {
      key: 'createdAt',
      header: 'Device Upload Date',
      render: (value: string) => (
        <div className="text-sm">{new Date(value).toLocaleDateString()}</div>
      )
    },
    {
      key: 'createdAt',
      header: 'Device Activation Date',
      render: (value: string) => (
        <div className="text-sm">{new Date(value).toLocaleDateString()}</div>
      )
    },
    // {
    //   key: 'certificate_number',
    //   header: 'Certificate',
    //   render: (value: string, row: DeviceWithLocation) => (
    //     <div className="flex gap-1">
    //       <Button
    //         variant="outline"
    //         size="sm"
    //         className="text-xs"
    //         onClick={async () => {
    //           try {
    //             await previewCertificate(row);
    //           } catch (error) {
    //             alert('Failed to preview certificate');
    //           }
    //         }}
    //       >
    //         <Eye className="h-3 w-3 mr-1" />
    //         {value ? 'Preview' : 'N/A'}
    //       </Button>
    //       {value && (
    //         <Button
    //           variant="outline"
    //           size="sm"
    //           className="text-xs"
    //           onClick={async () => {
    //             try {
    //               await printCertificate(row);
    //             } catch (error) {
    //               alert('Failed to print certificate');
    //             }
    //           }}
    //         >
    //           <Printer className="h-3 w-3" />
    //         </Button>
    //       )}
    //     </div>
    //   )
    // }
  ];

  const deviceActions = [
    {
      label: 'View Details',
      onClick: (row: DeviceWithLocation) => navigate(`/super-admin/devices/${row.imei}`)
    },
    {
      label: 'View on Map',
      onClick: (row: DeviceWithLocation) => handleLocationClick(row)
    },
    {
      label: 'Print Certificate',
      onClick: async (row: DeviceWithLocation) => {
        try {
          await printCertificate(row);
        } catch (error) {
          alert('Failed to print certificate');
        }
      }
    }
  ];

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    console.log(`Exporting as ${format.toUpperCase()}`);
    // Implement export functionality
  };

  const filteredDevices = devicesWithLocations.filter(device =>
    searchImei === '' || device.imei.includes(searchImei)
  );

  const totalCount = devices.length;
  const activeDevices = devicesWithLocations.filter(d => d.location?.latitude && d.location?.longitude).length;
  const expiringDevices = devicesWithLocations.filter(d => {
    const validTill = (d.vehicle as any)?.valid_till;
    if (!validTill) return false;
    const daysUntilExpiry = (new Date(validTill).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  }).length;
  const certifiedDevices = devices.filter(d => d.certificate_number).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading device inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            onClick={() => navigate('/super-admin/devices')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Device Inventory List</h1>
            <p className="text-gray-600">Super Admin - All Devices</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            className="bg-green-600 hover:bg-green-700"
            size="sm"
            onClick={() => setIsActivateDialogOpen(true)}
          >
            <Power className="h-4 w-4 mr-2" />
            Activate Device
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/super-admin/devices/map')}
          >
            <Map className="h-4 w-4 mr-2" />
            Live Map
          </Button>
          <Button
            variant={showMapView ? "default" : "outline"}
            size="sm"
            onClick={() => setShowMapView(!showMapView)}
          >
            <Navigation2 className="h-4 w-4 mr-2" />
            {showMapView ? 'Hide Map' : 'Show Map'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Smartphone className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Devices</p>
                <p className="text-2xl font-bold">{totalCount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wifi className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">With Location</p>
                <p className="text-2xl font-bold">{activeDevices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Expiring Soon (30d)</p>
                <p className="text-2xl font-bold">{expiringDevices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Certified</p>
                <p className="text-2xl font-bold">{certifiedDevices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date:</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Upto Date:</label>
              <Input
                type="date"
                value={uptoDate}
                onChange={(e) => setUptoDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search By IMEI:</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter IMEI number"
                  value={searchImei}
                  onChange={(e) => setSearchImei(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary and Export */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold">
            Total Count: <span className="text-blue-600">{totalCount.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
          >
            <FileText className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('excel')}
          >
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
          >
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Map View */}
      {showMapView && (
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
              {/* Map Section */}
              <div className="lg:col-span-2 relative">
                <div id="embedded-map" className="w-full h-[600px]"></div>
              </div>

              {/* Device Details Sidebar */}
              <div className="border-l bg-gray-50">
                <div className="p-4 border-b bg-white flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Device Details</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedDevice(null);
                      setShowMapView(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4 overflow-y-auto h-[552px]">
                  {selectedDevice ? (
                    <div className="space-y-4">
                      {/* Device Information */}
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          Device Info
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="text-gray-600">IMEI</p>
                            <p className="font-mono font-medium">{selectedDevice.imei}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Serial Number</p>
                            <p className="font-mono">{selectedDevice.serial_number}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Model Code</p>
                            <Badge variant="outline">{selectedDevice.VLTD_model_code}</Badge>
                          </div>
                          <div>
                            <p className="text-gray-600">Manufacturer</p>
                            <p className="font-medium">{selectedDevice.manufacturer}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Distributor</p>
                            <p className="font-medium">{selectedDevice.distributor}</p>
                          </div>
                        </div>
                      </div>

                      {/* eSIM Information */}
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Wifi className="h-4 w-4" />
                          eSIM Info
                        </h4>
                        <div className="space-y-2">
                          <div className="bg-blue-50 p-2 rounded">
                            <p className="text-xs text-gray-600">eSIM 1 - {selectedDevice.eSIM_1_provider}</p>
                            <p className="font-mono text-sm">{selectedDevice.eSIM_1}</p>
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <p className="text-xs text-gray-600">eSIM 2 - {selectedDevice.eSIM_2_provider}</p>
                            <p className="font-mono text-sm">{selectedDevice.eSIM_2}</p>
                          </div>
                        </div>
                      </div>

                      {/* Vehicle Information */}
                      {selectedDevice.vehicle && (
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            Vehicle Info
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="text-gray-600">Vehicle Number</p>
                              <p className="font-bold text-lg">{selectedDevice.vehicle.vehicle_number}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Owner Name</p>
                              <p className="font-medium">{selectedDevice.vehicle.owner_name}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Owner Phone</p>
                              <p className="text-sm">{selectedDevice.vehicle.owner_phone}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Owner Email</p>
                              <p className="text-sm">{selectedDevice.vehicle.owner_email}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Valid Till</p>
                              <p className="text-sm text-green-600 font-medium">
                                {new Date(selectedDevice.vehicle.valid_till).toLocaleDateString()}
                              </p>
                            </div>
                            {(selectedDevice.vehicle as any)?.plan && (
                              <div>
                                <p className="text-gray-600">Plan</p>
                                <Badge>{(selectedDevice.vehicle as any).plan}</Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* User Details */}
                      {selectedDevice.vehicle?.user && (
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold mb-3">User Details</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="text-gray-600">Name</p>
                              <p className="font-medium">
                                {selectedDevice.vehicle.user.first_name} {selectedDevice.vehicle.user.last_name}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Email</p>
                              <p className="text-sm">{selectedDevice.vehicle.user.email}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Phone</p>
                              <p className="text-sm">{selectedDevice.vehicle.user.phone}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Button
                          className="w-full"
                          onClick={() => navigate(`/super-admin/devices/${selectedDevice.imei}`)}
                        >
                          View Full Details
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await previewCertificate(selectedDevice);
                              } catch (error) {
                                alert('Failed to preview certificate');
                              }
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await printCertificate(selectedDevice);
                              } catch (error) {
                                alert('Failed to print certificate');
                              }
                            }}
                          >
                            <Printer className="h-4 w-4 mr-1" />
                            Print
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            const loc = locations.find(l => l.imei === selectedDevice.imei);
                            if (loc?.latitude && loc?.longitude && mapRef.current) {
                              mapRef.current.setView([loc.latitude, loc.longitude], 17);
                            }
                          }}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Center on Map
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Click on a marker on the map</p>
                      <p className="text-sm">to view device details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Device Table */}
      {!showMapView && (
        <Card>
          <CardContent className="p-0">
            <DataTable
              data={filteredDevices}
              columns={deviceColumns}
              actions={deviceActions}
              searchable={true}
              pagination={true}
              pageSize={10}
            />
          </CardContent>
        </Card>
      )}

      {/* Activate Device Dialog */}
      <Dialog open={isActivateDialogOpen} onOpenChange={(open) => {
        if (!open) handleCloseActivationDialog();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Power className="h-5 w-5 text-green-600" />
              Activate Device
            </DialogTitle>
            <DialogDescription>
              Search for device by IMEI and assign to a vehicle
            </DialogDescription>
          </DialogHeader>

          {activationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-800">{activationError}</p>
            </div>
          )}

          {/* Step 1: Search Device */}
          {activationStep === 'search' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activation-imei">Device IMEI *</Label>
                <div className="flex gap-2">
                  <Input
                    id="activation-imei"
                    value={activationImei}
                    onChange={(e) => setActivationImei(e.target.value)}
                    placeholder="Enter IMEI number"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSearchDevice}
                    disabled={isSearching || !activationImei.trim()}
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Enter the IMEI number to check if device exists in inventory
                </p>
              </div>
            </div>
          )}

          {/* Step 2: User Check */}
          {activationStep === 'userCheck' && searchedDevice && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Device Found</p>
                  <p className="text-xs text-green-700">
                    IMEI: {searchedDevice.imei} | Model: {searchedDevice.VLTD_model_code}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner-phone">Owner Phone Number *</Label>
                <div className="flex gap-2">
                  <Input
                    id="owner-phone"
                    value={vehicleForm.owner_phone}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, owner_phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleFindUser}
                    disabled={isSearching || !vehicleForm.owner_phone.trim()}
                  >
                    {isSearching ? 'Checking...' : 'Check User'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  We'll check if a permit holder exists with this phone number
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setActivationStep('search');
                    setSearchedDevice(null);
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Vehicle Assignment Form */}
          {activationStep === 'form' && (
            <div className="space-y-4">
              {permitHolder && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-800">Permit Holder Found</p>
                  <p className="text-xs text-blue-700">
                    {permitHolder.first_name} {permitHolder.last_name} - {permitHolder.email}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner_name">Owner Name *</Label>
                  <Input
                    id="owner_name"
                    value={vehicleForm.owner_name}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, owner_name: e.target.value })}
                    placeholder="Enter owner name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner_email">Owner Email *</Label>
                  <Input
                    id="owner_email"
                    type="email"
                    value={vehicleForm.owner_email}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, owner_email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner_phone_display">Owner Phone *</Label>
                  <Input
                    id="owner_phone_display"
                    value={vehicleForm.owner_phone}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, owner_phone: e.target.value })}
                    placeholder="Enter phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner_address">Owner Address *</Label>
                  <Input
                    id="owner_address"
                    value={vehicleForm.owner_address}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, owner_address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle_number">Vehicle Number *</Label>
                  <Input
                    id="vehicle_number"
                    value={vehicleForm.vehicle_number}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_number: e.target.value.toUpperCase() })}
                    placeholder="e.g., WB24BG4434"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chassis_number">Chassis Number *</Label>
                  <Input
                    id="chassis_number"
                    value={vehicleForm.chassis_number}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, chassis_number: e.target.value })}
                    placeholder="Enter chassis number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rc_registered_name">RC Registered Name</Label>
                  <Input
                    id="rc_registered_name"
                    value={vehicleForm.rc_registered_name}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, rc_registered_name: e.target.value })}
                    placeholder="Enter RC name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle_make">Vehicle Make</Label>
                  <Input
                    id="vehicle_make"
                    value={vehicleForm.vehicle_make}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_make: e.target.value })}
                    placeholder="e.g., Tesla"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle_model">Vehicle Model</Label>
                  <Input
                    id="vehicle_model"
                    value={vehicleForm.vehicle_model}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_model: e.target.value })}
                    placeholder="e.g., Model 3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuel_type">Fuel Type</Label>
                  <Select
                    value={vehicleForm.fuel_type}
                    onValueChange={(value) => setVehicleForm({ ...vehicleForm, fuel_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Petrol">Petrol</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                      <SelectItem value="CNG">CNG</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle_type">Vehicle Type</Label>
                  <Select
                    value={vehicleForm.vehicle_type}
                    onValueChange={(value) => setVehicleForm({ ...vehicleForm, vehicle_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CAR">Car</SelectItem>
                      <SelectItem value="BUS">Bus</SelectItem>
                      <SelectItem value="TRUCK">Truck</SelectItem>
                      <SelectItem value="TWO_WHEELER">Two Wheeler</SelectItem>
                      <SelectItem value="THREE_WHEELER">Three Wheeler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entity_type">Entity Type</Label>
                  <Select
                    value={vehicleForm.entity_type}
                    onValueChange={(value) => setVehicleForm({ ...vehicleForm, entity_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Individual">Individual</SelectItem>
                      <SelectItem value="Company">Company</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="choose_plan">Plan</Label>
                  <Select
                    value={vehicleForm.choose_plan}
                    onValueChange={(value) => setVehicleForm({ ...vehicleForm, choose_plan: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {activationStep === 'form' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setActivationStep('userCheck')}
                  disabled={isActivating}
                >
                  Back
                </Button>
                <Button
                  onClick={handleActivateDevice}
                  disabled={isActivating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isActivating ? 'Activating...' : 'Activate Device'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
