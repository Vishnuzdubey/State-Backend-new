import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Wifi, Package, Calendar, MapPin, User, Phone, Mail, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { rfcApi } from '@/api/rfc';
import { printCertificate } from '@/utils/certificateUtils';

interface DeviceDetail {
  id: string;
  imei: string;
  serial_number: string;
  VLTD_model_code: string;
  ICCID: string;
  eSIM_1: string;
  eSIM_1_provider: string;
  eSIM_2: string;
  eSIM_2_provider: string;
  certificate_number: string;
  createdAt: string;
  manufacturer: string | null;
  distributor: string | null;
  manufacturer_entity_id: string | null;
  distributor_entity_id: string | null;
  rfc_entity_id: string | null;
  vehicle: {
    id: string;
    owner_name: string;
    owner_email: string;
    owner_phone: string;
    owner_address: string;
    fuel_type: string;
    rc_registered_name: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_type: string;
    entity_type: string;
    choose_plan: string;
    vehicle_number: string;
    chassis_number: string;
    engine_number: string | null;
    plan_years: number;
    valid_till: string;
    createdAt: string;
    updatedAt: string;
    user_id: string;
    device_id: string;
  } | null;
}

export function RFCDeviceDetails() {
  const { imei } = useParams<{ imei: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<DeviceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printingCertificate, setPrintingCertificate] = useState(false);

  useEffect(() => {
    if (!imei) return;
    fetchDeviceDetails();
  }, [imei]);

  const fetchDeviceDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Decode IMEI from URL (it was encoded)
      const decodedImei = decodeURIComponent(imei!);
      const response = await rfcApi.getDeviceDetails(decodedImei);
      setDevice(response.device);
    } catch (err) {
      console.error('Failed to fetch device details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load device details');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintCertificate = async () => {
    if (!device) return;
    
    setPrintingCertificate(true);
    try {
      await printCertificate(device);
    } catch (err) {
      console.error('Failed to print certificate:', err);
      setError(err instanceof Error ? err.message : 'Failed to print certificate');
    } finally {
      setPrintingCertificate(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading device details...</p>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => navigate('/rfc/devices')}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Devices
        </Button>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error || 'Device not found'}
        </div>
      </div>
    );
  }

  const isAssigned = device.vehicle !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/rfc/devices')}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Device {device?.imei}
          </h1>
        </div>
        {device && device.vehicle && (
          <Button
            onClick={handlePrintCertificate}
            disabled={printingCertificate}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Printer className="h-4 w-4" />
            {printingCertificate ? 'Printing...' : 'Print Certificate'}
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Device Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Assignment Status</p>
              <p className="text-lg font-semibold text-gray-900">
                {isAssigned ? 'Assigned to Vehicle' : 'Not Assigned'}
              </p>
            </div>
            {isAssigned ? (
              <Badge className="bg-green-100 text-green-800 border-green-300 text-base px-4 py-2">
                Assigned
              </Badge>
            ) : (
              <Badge variant="outline" className="text-gray-600 text-base px-4 py-2">
                Not Assigned
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Device Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Device Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">IMEI</p>
              <p className="text-lg font-mono font-semibold text-gray-900">{device.imei}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Serial Number</p>
              <p className="text-lg font-mono font-semibold text-gray-900">{device.serial_number}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Model Code</p>
              <p className="text-lg font-semibold text-gray-900">{device.VLTD_model_code}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Certificate Number</p>
              <p className="text-lg font-mono font-semibold text-gray-900">{device.certificate_number}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">ICCID</p>
              <p className="text-sm font-mono text-gray-900 break-all">{device.ICCID}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Created
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(device.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* eSIM Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            eSIM Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">eSIM 1</p>
              <p className="text-sm font-mono text-gray-900 break-all">{device.eSIM_1}</p>
              <p className="text-xs text-gray-500 mt-1">Provider: {device.eSIM_1_provider}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">eSIM 2</p>
              <p className="text-sm font-mono text-gray-900 break-all">{device.eSIM_2}</p>
              <p className="text-xs text-gray-500 mt-1">Provider: {device.eSIM_2_provider}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Information (if assigned) */}
      {isAssigned && device.vehicle && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Vehicle Number</p>
                  <p className="text-lg font-semibold text-gray-900">{device.vehicle.vehicle_number}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Vehicle Type</p>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                    {device.vehicle.vehicle_type}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Make & Model</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {device.vehicle.vehicle_make} {device.vehicle.vehicle_model}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Fuel Type</p>
                  <Badge variant="outline">{device.vehicle.fuel_type}</Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Chassis Number</p>
                  <p className="text-sm font-mono text-gray-900">{device.vehicle.chassis_number}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Entity Type</p>
                  <Badge variant="secondary">{device.vehicle.entity_type}</Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Plan</p>
                  <p className="text-lg font-semibold text-gray-900">{device.vehicle.choose_plan}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Plan Years</p>
                  <p className="text-lg font-semibold text-gray-900">{device.vehicle.plan_years} year(s)</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Valid Till</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(device.vehicle.valid_till).toLocaleDateString()}
                  </p>
                </div>

                {device.vehicle.engine_number && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Engine Number</p>
                    <p className="text-sm font-mono text-gray-900">{device.vehicle.engine_number}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-1">RC Registered Name</p>
                  <p className="text-lg font-semibold text-gray-900">{device.vehicle.rc_registered_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <User className="h-4 w-4" /> Owner Name
                  </p>
                  <p className="text-lg font-semibold text-gray-900">{device.vehicle.owner_name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <Mail className="h-4 w-4" /> Email
                  </p>
                  <p className="text-lg font-semibold text-gray-900">{device.vehicle.owner_email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <Phone className="h-4 w-4" /> Phone
                  </p>
                  <p className="text-lg font-semibold text-gray-900">{device.vehicle.owner_phone}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> Address
                  </p>
                  <p className="text-lg font-semibold text-gray-900">{device.vehicle.owner_address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* No Vehicle Assigned Message */}
      {!isAssigned && (
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Package className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg font-medium mb-2">No Vehicle Assigned</p>
              <p className="text-gray-500 text-center">
                This device is not yet assigned to any vehicle. Activate it from the Devices page to assign a vehicle.
              </p>
              <Button
                onClick={() => navigate('/rfc/devices')}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Go to Devices Page
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
