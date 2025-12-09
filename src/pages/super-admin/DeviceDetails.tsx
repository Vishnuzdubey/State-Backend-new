import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Smartphone,

  Calendar,


  User,
  Car,
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Device Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">IMEI</p>
                <p className="font-mono font-medium">{device.imei}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Serial Number</p>
                <p className="font-mono font-medium">{device.serial_number}</p>
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
                <p className="text-sm text-gray-600">eSIM 1</p>
                <p className="font-mono text-sm">{device.eSIM_1}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">eSIM 2</p>
                <p className="font-mono text-sm">{device.eSIM_2}</p>
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

        {/* Entity Information - Manufacturer, Distributor, RFC */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Entity Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Manufacturer */}
            <div className="border rounded-lg p-4 bg-orange-50">
              <p className="text-sm font-medium text-gray-700 mb-2">Manufacturer</p>
              {(device as any).manufacturer_entity_id ? (
                <button
                  onClick={() => navigate(`/super-admin/manufacturers/${(device as any).manufacturer_entity_id}`)}
                  className="text-orange-600 hover:text-orange-800 hover:underline font-medium block mb-2"
                >
                  {(device as any).manufacturer_entity?.name || (device as any).manufacturer_entity_id || 'Unknown'}
                </button>
              ) : (
                <span className="text-gray-400">Not assigned</span>
              )}
              {(device as any).manufacturer_entity && (
                <div className="mt-2 text-xs space-y-1 text-gray-600">
                  <p><strong>Email:</strong> {(device as any).manufacturer_entity.email}</p>
                  <p><strong>GST:</strong> {(device as any).manufacturer_entity.gst}</p>
                  <p><strong>PAN:</strong> {(device as any).manufacturer_entity.pan}</p>
                </div>
              )}
            </div>

            {/* Distributor */}
            <div className="border rounded-lg p-4 bg-green-50">
              <p className="text-sm font-medium text-gray-700 mb-2">Distributor</p>
              {(device as any).distributor_entity_id ? (
                <button
                  onClick={() => navigate(`/super-admin/distributors/${(device as any).distributor_entity_id}`)}
                  className="text-green-600 hover:text-green-800 hover:underline font-medium block mb-2"
                >
                  {(device as any).distributor_entity?.name || (device as any).distributor_entity_id || 'Unknown'}
                </button>
              ) : (
                <span className="text-gray-400">Not assigned</span>
              )}
              {(device as any).distributor_entity && (
                <div className="mt-2 text-xs space-y-1 text-gray-600">
                  <p><strong>Email:</strong> {(device as any).distributor_entity.email}</p>
                  <p><strong>Created:</strong> {new Date((device as any).distributor_entity.createdAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* RFC */}
            <div className="border rounded-lg p-4 bg-purple-50">
              <p className="text-sm font-medium text-gray-700 mb-2">RFC (Authorized Service Partner)</p>
              {(device as any).rfc_entity_id ? (
                <button
                  onClick={() => navigate(`/super-admin/rfcs/${(device as any).rfc_entity_id}`)}
                  className="text-purple-600 hover:text-purple-800 hover:underline font-medium block mb-2"
                >
                  {(device as any).rfc_entity?.name || (device as any).rfc_entity_id || 'Unknown'}
                </button>
              ) : (
                <span className="text-gray-400">Not assigned</span>
              )}
              {(device as any).rfc_entity && (
                <div className="mt-2 text-xs space-y-1 text-gray-600">
                  <p><strong>Email:</strong> {(device as any).rfc_entity.email}</p>
                  <p><strong>Created:</strong> {new Date((device as any).rfc_entity.createdAt).toLocaleDateString()}</p>
                </div>
              )}
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
