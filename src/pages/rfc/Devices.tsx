import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Wifi, Shield, Calendar, Zap, Plus, Search, X, Printer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataTable } from '@/components/common/DataTable';
import { rfcApi, type RFCDevice } from '@/api/rfc';
import { printCertificate } from '@/utils/certificateUtils';

interface ActivationStep {
  step: 'search' | 'device-result' | 'user-choice' | 'find-user' | 'create-user' | 'assign-vehicle';
}

interface DeviceResult {
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
  vehicle: any | null;
}

interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  pincode: number;
  district: string;
  state: string;
  username: string;
  permit_holder_type: string;
}

export function RFCDevices() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<RFCDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generatingImei, setGeneratingImei] = useState<string | null>(null);
  const [printingImei, setPrintingImei] = useState<string | null>(null);

  // Activation Dialog State
  const [activationOpen, setActivationOpen] = useState(false);
  const [activationStep, setActivationStep] = useState<ActivationStep['step']>('search');
  const [searchImei, setSearchImei] = useState('');
  const [foundDevice, setFoundDevice] = useState<DeviceResult | null>(null);
  const [searchPhoneUser, setSearchPhoneUser] = useState('');
  const [foundUser, setFoundUser] = useState<UserData | null>(null);
  const [activationLoading, setActivationLoading] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);

  // Form state for creating user
  const [createUserForm, setCreateUserForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    pincode: '',
    district: '',
    state: '',
    username: '',
    permit_holder_type: '',
    password: '123456',
  });

  // Form state for assigning vehicle
  const [assignForm, setAssignForm] = useState({
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
    choose_plan: 'Premium',
    vehicle_number: '',
    chassis_number: '',
    imei: '',
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rfcApi.getInventory();
      setDevices(response.data);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
      setError(err instanceof Error ? err.message : 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async (imei: string) => {
    setGeneratingImei(imei);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await rfcApi.generateCertificate(imei);
      console.log('✅ Certificate generation response:', result);
      setSuccessMessage(`Certificate generated successfully for IMEI: ${imei}`);
      await fetchDevices();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to generate certificate:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate certificate');
    } finally {
      setGeneratingImei(null);
    }
  };

  const handlePrintCertificate = async (imei: string) => {
    setPrintingImei(imei);
    setError(null);

    try {
      // Get device details first
      const response = await rfcApi.getDeviceDetails(imei);
      await printCertificate(response.device);
    } catch (err) {
      console.error('Failed to print certificate:', err);
      setError(err instanceof Error ? err.message : 'Failed to print certificate');
    } finally {
      setPrintingImei(null);
    }
  };

  const handleSearchDevice = async () => {
    if (!searchImei.trim()) {
      setActivationError('Please enter an IMEI');
      return;
    }

    setActivationLoading(true);
    setActivationError(null);

    try {
      const result = await rfcApi.findDevice(searchImei.trim());
      setFoundDevice(result.device);

      // Check if already assigned
      if (result.device.vehicle) {
        setActivationError('This device is already assigned to a vehicle');
        return;
      }

      setActivationStep('device-result');
    } catch (err) {
      setActivationError(err instanceof Error ? err.message : 'Device not found');
    } finally {
      setActivationLoading(false);
    }
  };

  const handleSearchUser = async () => {
    if (!searchPhoneUser.trim()) {
      setActivationError('Please enter a phone number');
      return;
    }

    setActivationLoading(true);
    setActivationError(null);

    try {
      const result = await rfcApi.findUser(searchPhoneUser.trim());
      setFoundUser(result.user);
      setAssignForm(prev => ({
        ...prev,
        owner_name: result.user.first_name + ' ' + result.user.last_name,
        owner_email: result.user.email,
        owner_phone: result.user.phone,
        owner_address: result.user.address,
      }));
      setActivationStep('assign-vehicle');
    } catch (err) {
      setActivationError(err instanceof Error ? err.message : 'User not found');
    } finally {
      setActivationLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!createUserForm.first_name || !createUserForm.email || !createUserForm.phone) {
      setActivationError('Please fill in required fields (First Name, Email, Phone)');
      return;
    }

    setActivationLoading(true);
    setActivationError(null);

    try {
      const result = await rfcApi.createUser({
        first_name: createUserForm.first_name,
        last_name: createUserForm.last_name,
        email: createUserForm.email,
        phone: createUserForm.phone,
        address: createUserForm.address,
        pincode: createUserForm.pincode,
        district: createUserForm.district,
        state: createUserForm.state,
        username: createUserForm.username || createUserForm.first_name.toLowerCase(),
        permit_holder_type: createUserForm.permit_holder_type,
        password: createUserForm.password,
      });

      const newUser = result.user;
      setFoundUser(newUser);
      setAssignForm(prev => ({
        ...prev,
        owner_name: newUser.first_name + ' ' + newUser.last_name,
        owner_email: newUser.email,
        owner_phone: newUser.phone,
        owner_address: newUser.address,
      }));
      setActivationStep('assign-vehicle');
    } catch (err) {
      setActivationError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setActivationLoading(false);
    }
  };

  const handleAssignDevice = async () => {
    if (!foundUser || !foundDevice) {
      setActivationError('Missing user or device information');
      return;
    }

    if (!assignForm.vehicle_number || !assignForm.chassis_number) {
      setActivationError('Please fill in Vehicle Number and Chassis Number');
      return;
    }

    setActivationLoading(true);
    setActivationError(null);

    try {
      await rfcApi.assignDevice(foundUser.id, {
        ...assignForm,
        imei: foundDevice.imei,
      });

      setSuccessMessage('Device assigned successfully!');
      await fetchDevices();

      // Reset and close dialog
      setTimeout(() => {
        resetActivationDialog();
        setActivationOpen(false);
        setSuccessMessage(null);
      }, 2000);
    } catch (err) {
      setActivationError(err instanceof Error ? err.message : 'Failed to assign device');
    } finally {
      setActivationLoading(false);
    }
  };

  const resetActivationDialog = () => {
    setActivationStep('search');
    setSearchImei('');
    setFoundDevice(null);
    setSearchPhoneUser('');
    setFoundUser(null);
    setActivationError(null);
    setCreateUserForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      pincode: '',
      district: '',
      state: '',
      username: '',
      permit_holder_type: '',
      password: '123456',
    });
    setAssignForm({
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
      choose_plan: 'Premium',
      vehicle_number: '',
      chassis_number: '',
      imei: '',
    });
  };

  const columns = [
    {
      key: 'imei',
      header: 'IMEI',
      sortable: true,
      render: (value: string) => (
        <button
          onClick={() => navigate(`/rfc/devices/${encodeURIComponent(value)}`)}
          className="font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {value}
        </button>
      ),
    },
    {
      key: 'serial_number',
      header: 'Serial Number',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'VLTD_model_code',
      header: 'Model Code',
      render: (value: string) => (
        <Badge variant="outline" className="font-medium">
          {value}
        </Badge>
      ),
    },
    {
      key: 'eSIM_1_provider',
      header: 'eSIM Providers',
      render: (_value: string, row: RFCDevice) => (
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-blue-500" />
          <span className="text-sm">{row.eSIM_1_provider} / {row.eSIM_2_provider}</span>
        </div>
      ),
    },
    {
      key: 'ICCID',
      header: 'ICCID',
      render: (value: string) => (
        <span className="text-sm font-mono text-gray-600">{value}</span>
      ),
    },
    {
      key: 'certificate_number',
      header: 'Certificate',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-500" />
          <span className="text-sm font-mono">{value}</span>
        </div>
      ),
    },
    {
      key: 'rfc_entity_id',
      header: 'Status',
      render: (_value: string | null, row: RFCDevice) => (
        row.vehicle ? (
          <Badge className="bg-green-100 text-green-800 border-green-300">Assigned</Badge>
        ) : (
          <Badge variant="outline" className="text-gray-600">Not Assigned</Badge>
        )
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">
            {new Date(value).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_value: string, row: RFCDevice) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleGenerateCertificate(row.imei)}
            disabled={generatingImei === row.imei}
            className="text-blue-600 hover:text-blue-800 gap-1"
          >
            <Zap className="h-4 w-4" />
            {generatingImei === row.imei ? 'Generating...' : 'Generate'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePrintCertificate(row.imei)}
            disabled={printingImei === row.imei || !row.vehicle}
            className="text-green-600 hover:text-green-800 gap-1"
            title={!row.vehicle ? 'Device must be assigned to print' : ''}
          >
            <Printer className="h-4 w-4" />
            {printingImei === row.imei ? 'Printing...' : 'Print'}
          </Button>
        </div>
      ),
    },
  ];

  const totalDevices = devices.length;
  const withCertificate = devices.filter(d => d.certificate_number).length;
  const assignedDevices = devices.filter(d => d.vehicle).length;
  const uniqueModels = new Set(devices.map(d => d.VLTD_model_code)).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Device Inventory</h1>
          <p className="text-gray-600">
            Manage assigned devices and track inventory ({devices.length} devices)
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 gap-2"
          onClick={() => {
            resetActivationDialog();
            setActivationOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Activate Device
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />
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
              <Shield className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">With Certificate</p>
                <p className="text-2xl font-bold">{withCertificate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Assigned Devices</p>
                <p className="text-2xl font-bold">{assignedDevices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Unique Models</p>
                <p className="text-2xl font-bold">{uniqueModels}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devices Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={devices}
            columns={columns}
            searchable={true}
            pagination={true}
            pageSize={20}
          />
        </CardContent>
      </Card>

      {/* Activation Dialog */}
      <Dialog open={activationOpen} onOpenChange={setActivationOpen}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Activate Device</DialogTitle>
            <DialogDescription>
              {activationStep === 'search' && 'Search for a device by IMEI'}
              {activationStep === 'device-result' && 'Device found - proceed with activation'}
              {activationStep === 'user-choice' && 'Choose how to proceed'}
              {activationStep === 'find-user' && 'Search for existing user'}
              {activationStep === 'create-user' && 'Create a new user'}
              {activationStep === 'assign-vehicle' && 'Assign vehicle to device'}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Search Device */}
          {activationStep === 'search' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Device IMEI</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter device IMEI"
                    value={searchImei}
                    onChange={(e) => setSearchImei(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchDevice()}
                  />
                  <Button
                    onClick={handleSearchDevice}
                    disabled={activationLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {activationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {activationError}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Device Result */}
          {activationStep === 'device-result' && foundDevice && (
            <div className="space-y-4">
              <Card className="bg-blue-50">
                <CardContent className="p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">IMEI:</span>
                      <p className="font-mono text-blue-700">{foundDevice.imei}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Model:</span>
                      <p className="text-blue-700">{foundDevice.VLTD_model_code}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Serial:</span>
                      <p className="font-mono text-blue-700">{foundDevice.serial_number}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Certificate:</span>
                      <p className="text-blue-700">{foundDevice.certificate_number}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <p className="text-sm text-gray-600">This device is ready for activation. Choose how to proceed:</p>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setActivationStep('find-user');
                    setActivationError(null);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Find Existing User
                </Button>
                <Button
                  onClick={() => {
                    setActivationStep('create-user');
                    setActivationError(null);
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Create New User
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setActivationStep('search');
                  setActivationError(null);
                }}
                className="w-full"
              >
                Search Different Device
              </Button>
            </div>
          )}

          {/* Step 3: Find User */}
          {activationStep === 'find-user' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Phone Number</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter phone number"
                    value={searchPhoneUser}
                    onChange={(e) => setSearchPhoneUser(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                  />
                  <Button
                    onClick={handleSearchUser}
                    disabled={activationLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {activationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {activationError}
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  setActivationStep('create-user');
                  setActivationError(null);
                }}
                className="w-full"
              >
                Create New User Instead
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setActivationStep('device-result');
                  setActivationError(null);
                }}
                className="w-full"
              >
                Back
              </Button>
            </div>
          )}

          {/* Step 4: Create User */}
          {activationStep === 'create-user' && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
                  <Input
                    value={createUserForm.first_name}
                    onChange={(e) => setCreateUserForm({...createUserForm, first_name: e.target.value})}
                    placeholder="First Name"
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                  <Input
                    value={createUserForm.last_name}
                    onChange={(e) => setCreateUserForm({...createUserForm, last_name: e.target.value})}
                    placeholder="Last Name"
                    size="sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                  <Input
                    value={createUserForm.email}
                    onChange={(e) => setCreateUserForm({...createUserForm, email: e.target.value})}
                    placeholder="Email"
                    type="email"
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone *</label>
                  <Input
                    value={createUserForm.phone}
                    onChange={(e) => setCreateUserForm({...createUserForm, phone: e.target.value})}
                    placeholder="Phone"
                    size="sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                <Input
                  value={createUserForm.address}
                  onChange={(e) => setCreateUserForm({...createUserForm, address: e.target.value})}
                  placeholder="Address"
                  size="sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Pincode</label>
                  <Input
                    value={createUserForm.pincode}
                    onChange={(e) => setCreateUserForm({...createUserForm, pincode: e.target.value})}
                    placeholder="Pincode"
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">District</label>
                  <Input
                    value={createUserForm.district}
                    onChange={(e) => setCreateUserForm({...createUserForm, district: e.target.value})}
                    placeholder="District"
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                  <Input
                    value={createUserForm.state}
                    onChange={(e) => setCreateUserForm({...createUserForm, state: e.target.value})}
                    placeholder="State"
                    size="sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Permit Type</label>
                <Input
                  value={createUserForm.permit_holder_type}
                  onChange={(e) => setCreateUserForm({...createUserForm, permit_holder_type: e.target.value})}
                  placeholder="e.g., Type D"
                  size="sm"
                />
              </div>

              {activationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {activationError}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateUser}
                  disabled={activationLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Create User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setActivationStep('device-result');
                    setActivationError(null);
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Assign Vehicle */}
          {activationStep === 'assign-vehicle' && foundDevice && foundUser && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <Card className="bg-gray-50">
                <CardContent className="p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Device & User Summary</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium">IMEI:</span>
                      <p className="text-gray-600">{foundDevice.imei}</p>
                    </div>
                    <div>
                      <span className="font-medium">User:</span>
                      <p className="text-gray-600">{foundUser.first_name} {foundUser.last_name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Owner Name *</label>
                  <Input
                    value={assignForm.owner_name}
                    onChange={(e) => setAssignForm({...assignForm, owner_name: e.target.value})}
                    placeholder="Owner Name"
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Owner Email</label>
                  <Input
                    value={assignForm.owner_email}
                    onChange={(e) => setAssignForm({...assignForm, owner_email: e.target.value})}
                    placeholder="Email"
                    size="sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Owner Phone</label>
                  <Input
                    value={assignForm.owner_phone}
                    onChange={(e) => setAssignForm({...assignForm, owner_phone: e.target.value})}
                    placeholder="Phone"
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                  <Input
                    value={assignForm.owner_address}
                    onChange={(e) => setAssignForm({...assignForm, owner_address: e.target.value})}
                    placeholder="Address"
                    size="sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">RC Registered Name</label>
                <Input
                  value={assignForm.rc_registered_name}
                  onChange={(e) => setAssignForm({...assignForm, rc_registered_name: e.target.value})}
                  placeholder="RC Registered Name"
                  size="sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Number *</label>
                  <Input
                    value={assignForm.vehicle_number}
                    onChange={(e) => setAssignForm({...assignForm, vehicle_number: e.target.value})}
                    placeholder="e.g., TES-1234"
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Chassis Number *</label>
                  <Input
                    value={assignForm.chassis_number}
                    onChange={(e) => setAssignForm({...assignForm, chassis_number: e.target.value})}
                    placeholder="Chassis Number"
                    size="sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Make</label>
                  <Input
                    value={assignForm.vehicle_make}
                    onChange={(e) => setAssignForm({...assignForm, vehicle_make: e.target.value})}
                    placeholder="e.g., Tesla"
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Model</label>
                  <Input
                    value={assignForm.vehicle_model}
                    onChange={(e) => setAssignForm({...assignForm, vehicle_model: e.target.value})}
                    placeholder="e.g., Model 3"
                    size="sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <select
                    value={assignForm.vehicle_type}
                    onChange={(e) => setAssignForm({...assignForm, vehicle_type: e.target.value})}
                    className="w-full px-2 py-1 border rounded text-xs"
                  >
                    <option value="CAR">Car</option>
                    <option value="TRUCK">Truck</option>
                    <option value="BUS">Bus</option>
                    <option value="TWO_WHEELER">Two Wheeler</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fuel Type</label>
                  <select
                    value={assignForm.fuel_type}
                    onChange={(e) => setAssignForm({...assignForm, fuel_type: e.target.value})}
                    className="w-full px-2 py-1 border rounded text-xs"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
              </div>

              {activationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {activationError}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleAssignDevice}
                  disabled={activationLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {activationLoading ? 'Assigning...' : 'Assign Device'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setActivationStep('device-result');
                    setActivationError(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}