import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, MapPin, User as UserIcon, Calendar, Zap, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { rfcApi } from '@/api/rfc';

interface UserDevice {
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
  } | null;
}

interface UserDetail {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  username: string;
  address: string;
  pincode: number;
  district: string;
  state: string;
  permit_holder_type: string;
  createdAt: string;
  updatedAt: string;
}

export function RFCUserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceDetailsOpen, setDeviceDetailsOpen] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [, setDeviceLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Decode phone number from URL (it was encoded with encodeURIComponent)
      const phone = decodeURIComponent(id!);

      // Fetch user details using phone number
      const userResponse = await rfcApi.findUser(phone);
      setUser(userResponse.user);

      // Fetch user devices using the user ID from the response
      const devicesResponse = await rfcApi.getUserDevices(userResponse.user.id);
      setDevices(devicesResponse.data || []);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDeviceDetails = async (imei: string) => {
    setDeviceLoading(true);
    try {
      const response = await rfcApi.getDeviceDetails(imei);
      setSelectedDevice(response.device);
      setDeviceDetailsOpen(imei);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load device details');
    } finally {
      setDeviceLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => navigate('/rfc/users')}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Users
        </Button>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error || 'User not found'}
        </div>
      </div>
    );
  }

  const totalDevices = devices.length;
  const assignedDevices = devices.filter(d => d.vehicle).length;
  const unassignedDevices = devices.filter(d => !d.vehicle).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/rfc/users')}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {user.first_name} {user.last_name}
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            User Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Full Name</p>
              <p className="text-lg font-semibold text-gray-900">
                {user.first_name} {user.last_name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                <Mail className="h-4 w-4" /> Email
              </p>
              <p className="text-lg font-semibold text-gray-900">{user.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                <Phone className="h-4 w-4" /> Phone
              </p>
              <p className="text-lg font-semibold text-gray-900">{user.phone}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                <MapPin className="h-4 w-4" /> Address
              </p>
              <p className="text-lg font-semibold text-gray-900">{user.address}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Username</p>
              <p className="text-lg font-semibold text-gray-900">{user.username || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Permit Type
              </p>
              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                {user.permit_holder_type || '-'}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Pincode</p>
              <p className="text-lg font-semibold text-gray-900">{user.pincode || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">District</p>
              <p className="text-lg font-semibold text-gray-900">{user.district || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">State</p>
              <p className="text-lg font-semibold text-gray-900">{user.state || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Member Since
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Devices</p>
                <p className="text-2xl font-bold">{totalDevices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Assigned</p>
                <p className="text-2xl font-bold">{assignedDevices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Not Assigned</p>
                <p className="text-2xl font-bold">{unassignedDevices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Devices */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Devices</CardTitle>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">No devices assigned to this user</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">IMEI</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Serial</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Model</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Certificate</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Vehicle</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {devices.map((device) => (
                    <tr key={device.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewDeviceDetails(device.imei)}
                          className="font-mono text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          {device.imei}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-700">{device.serial_number}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{device.VLTD_model_code}</Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-700">
                        {device.certificate_number}
                      </td>
                      <td className="px-4 py-3">
                        {device.vehicle ? (
                          <div className="text-sm">
                            <p className="font-medium">{device.vehicle.vehicle_number}</p>
                            <p className="text-gray-500 text-xs">
                              {device.vehicle.vehicle_make} {device.vehicle.vehicle_model}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {device.vehicle ? (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            Assigned
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            Not Assigned
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDeviceDetails(device.imei)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Device Details Modal */}
      {deviceDetailsOpen && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Device Details</CardTitle>
              <button
                onClick={() => {
                  setDeviceDetailsOpen(null);
                  setSelectedDevice(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">IMEI</p>
                  <p className="font-mono font-semibold">{selectedDevice.imei}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Serial Number</p>
                  <p className="font-mono font-semibold">{selectedDevice.serial_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Model Code</p>
                  <p className="font-semibold">{selectedDevice.VLTD_model_code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Certificate</p>
                  <p className="font-mono font-semibold">{selectedDevice.certificate_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ICCID</p>
                  <p className="font-mono font-semibold text-xs">{selectedDevice.ICCID}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">eSIM 1</p>
                  <p className="font-mono font-semibold text-xs">{selectedDevice.eSIM_1}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">eSIM 1 Provider</p>
                  <p className="font-semibold">{selectedDevice.eSIM_1_provider}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">eSIM 2</p>
                  <p className="font-mono font-semibold text-xs">{selectedDevice.eSIM_2}</p>
                </div>
              </div>

              {selectedDevice.vehicle && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Vehicle Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Vehicle Number</p>
                      <p className="font-semibold">{selectedDevice.vehicle.vehicle_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vehicle Type</p>
                      <p className="font-semibold">{selectedDevice.vehicle.vehicle_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Make & Model</p>
                      <p className="font-semibold">
                        {selectedDevice.vehicle.vehicle_make} {selectedDevice.vehicle.vehicle_model}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Chassis Number</p>
                      <p className="font-mono font-semibold text-sm">
                        {selectedDevice.vehicle.chassis_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Valid Till</p>
                      <p className="font-semibold">
                        {new Date(selectedDevice.vehicle.valid_till).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Plan</p>
                      <p className="font-semibold">{selectedDevice.vehicle.choose_plan}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
