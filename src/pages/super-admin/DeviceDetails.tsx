import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Smartphone,
  MapPin,
  Calendar,
  Wifi,
  Shield,
  User,
  Car,
  Package,
  Info,
  Eye,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { superAdminApi, type DeviceDetails as DeviceDetailsType } from '@/api/superAdmin';
import { previewCertificate, printCertificate } from '@/utils/certificateUtils';

export function DeviceDetails() {
  const { imei } = useParams<{ imei: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<DeviceDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (imei) {
      fetchDeviceDetails();
    }
  }, [imei]);

  const fetchDeviceDetails = async () => {
    if (!imei) return;

    try {
      setLoading(true);
      setError(null);
      const response = await superAdminApi.getDeviceDetails(imei);
      setDevice(response.data);
    } catch (err) {
      console.error('Failed to fetch device details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load device details');
    } finally {
      setLoading(false);
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

  const handlePreviewCertificate = async () => {
    try {
      await previewCertificate(device);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to preview certificate');
    }
  };

  const handlePrintCertificate = async () => {
    try {
      await printCertificate(device);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to print certificate');
    }
  };

  if (error || !device) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/super-admin/devices')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Devices
        </Button>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">{error || 'Device not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/super-admin/devices')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Device Details</h1>
            <p className="text-gray-600">IMEI: {device.imei}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePreviewCertificate}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Certificate
          </Button>
          <Button
            onClick={handlePrintCertificate}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Certificate
          </Button>
          <Badge variant="outline" className="text-green-600 border-green-600">
            Active
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Device Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">IMEI</p>
                <p className="font-mono font-medium">{device.imei}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Serial Number</p>
                <p className="font-mono font-medium">{device.serial_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Manufacturer</p>
                <p className="font-medium">{device.manufacturer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Distributor</p>
                <p className="font-medium">{device.distributor}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">VLTD Model Code</p>
                <p className="font-medium">{device.VLTD_model_code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ICCID</p>
                <p className="font-mono text-sm">{device.ICCID}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created At</p>
                <p className="text-sm">{new Date(device.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Certificate Number</p>
                <p className="font-mono text-sm">{device.certificate_number}</p>
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
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">eSIM 1</p>
                <Badge variant="outline">{device.eSIM_1_provider}</Badge>
              </div>
              <p className="font-mono text-sm">{device.eSIM_1}</p>
            </div>
            <div className="border rounded-lg p-4 bg-green-50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">eSIM 2</p>
                <Badge variant="outline">{device.eSIM_2_provider}</Badge>
              </div>
              <p className="font-mono text-sm">{device.eSIM_2}</p>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        {device.vehicle && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Vehicle Number</p>
                  <p className="font-bold text-lg">{device.vehicle.vehicle_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vehicle Type</p>
                  <p className="font-medium">{device.vehicle.vehicle_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fuel Type</p>
                  <p className="font-medium capitalize">{device.vehicle.fuel_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Make</p>
                  <p className="font-medium">{device.vehicle.vehicle_make}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Model</p>
                  <p className="font-medium">{device.vehicle.vehicle_model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Chassis Number</p>
                  <p className="font-mono text-sm">{device.vehicle.chassis_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Engine Number</p>
                  <p className="font-mono text-sm">{device.vehicle.engine_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">RC Registered Name</p>
                  <p className="font-medium">{device.vehicle.rc_registered_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Entity Type</p>
                  <p className="font-medium capitalize">{device.vehicle.entity_type}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Information */}
        {device.vehicle && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="font-medium">{device.vehicle.choose_plan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Plan Duration</p>
                <p className="font-medium">{device.vehicle.plan_years} Years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valid Till</p>
                <p className="font-medium text-green-600">
                  {new Date(device.vehicle.valid_till).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Activation Date</p>
                <p className="text-sm">{new Date(device.vehicle.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Owner Information */}
        {device.vehicle && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{device.vehicle.owner_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm">{device.vehicle.owner_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-sm">{device.vehicle.owner_phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="text-sm">{device.vehicle.owner_address}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Details */}
        {device.vehicle?.user && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                User Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Username</p>
                  <p className="font-medium">{device.vehicle.user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium">
                    {device.vehicle.user.first_name} {device.vehicle.user.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-sm">{device.vehicle.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-sm">{device.vehicle.user.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="text-sm">{device.vehicle.user.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">District</p>
                  <p className="text-sm">{device.vehicle.user.district}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">State</p>
                  <p className="text-sm">{device.vehicle.user.state}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pincode</p>
                  <p className="text-sm">{device.vehicle.user.pincode}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
