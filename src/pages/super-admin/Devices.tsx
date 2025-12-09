import { useState, useEffect } from 'react';
import { Plus, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { superAdminApi, type DeviceData } from '@/api/superAdmin';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function Devices() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page] = useState(1);
  const [pageSize] = useState(100);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [, setIsDeleting] = useState(false);
  const [newDevice, setNewDevice] = useState({
    imei: '',
    serial_number: '',
    manufacturer: '',
    distributor: '',
    VLTD_model_code: '',
  });

  useEffect(() => {
    fetchDevices();
  }, [page, pageSize]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminApi.getDevices({ page, pageSize });
      setDevices(response.devices);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
      setError(err instanceof Error ? err.message : 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async () => {
    try {
      setLoading(true);
      await superAdminApi.createDevice(newDevice);
      setIsAddDialogOpen(false);
      setNewDevice({
        imei: '',
        serial_number: '',
        manufacturer: '',
        distributor: '',
        VLTD_model_code: '',
      });
      fetchDevices();
    } catch (err) {
      console.error('Failed to create device:', err);
      alert(err instanceof Error ? err.message : 'Failed to create device');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to delete this device?')) return;

    try {
      setIsDeleting(true);
      await superAdminApi.deleteDevice(deviceId);
      fetchDevices();
    } catch (err) {
      console.error('Failed to delete device:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete device');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [

    {
      key: 'imei',
      header: 'IMEI',
      sortable: true,
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
      key: 'VLTD_model_code',
      header: 'Model Code',
      sortable: true,
      render: (value: string) => <Badge variant="outline">{value}</Badge>
    },
    {
      key: 'manufacturer_entity_id',
      header: 'Manufacturer',
      render: (value: string, row: any) => (
        value ? (
          <button
            onClick={() => navigate(`/super-admin/manufacturers/${value}`)}
            className="text-orange-600 hover:text-orange-800 hover:underline font-medium"
          >
            {row.manufacturer_entity?.name || value}
          </button>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      key: 'distributor_entity_id',
      header: 'Distributor',
      render: (value: string, row: any) => (
        value ? (
          <button
            onClick={() => navigate(`/super-admin/distributors/${value}`)}
            className="text-green-600 hover:text-green-800 hover:underline font-medium"
          >
            {row.distributor_entity?.name || value}
          </button>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      key: 'rfc_entity_id',
      header: 'RFC Name',
      render: (value: string, row: any) => (
        value ? (
          <button
            onClick={() => navigate(`/super-admin/rfcs/${value}`)}
            className="text-purple-600 hover:text-purple-800 hover:underline font-medium"
          >
            {row.rfc_entity?.name || value}
          </button>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (value: any) => value?.vehicle_number || <span className="text-gray-400">Not assigned</span>
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const actions = [
    {
      label: 'View Details',
      onClick: (row: DeviceData) => navigate(`/super-admin/devices/${row.imei}`)
    },
    {
      label: 'Delete',
      onClick: (row: DeviceData) => handleDeleteDevice(row.id),
      variant: 'destructive' as const
    },
  ];

  if (loading && devices.length === 0) {
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
    <div className="space-y-8 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Device Inventory</h1>
          <p className="text-gray-600 text-lg">
            Manage RoadEye device inventory ({devices.length} devices)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/super-admin/devices/map')}
          >
            <Map className="mr-2 h-4 w-4" />
            Live Map
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Device
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <DataTable
          data={devices}
          columns={columns}
          actions={actions}
          searchable={true}
          pagination={true}
          pageSize={20}
        />
      </div>

      {/* Add Device Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="imei">IMEI *</Label>
              <Input
                id="imei"
                value={newDevice.imei}
                onChange={(e) => setNewDevice({ ...newDevice, imei: e.target.value })}
                placeholder="Enter IMEI number"
              />
            </div>
            <div>
              <Label htmlFor="serial">Serial Number *</Label>
              <Input
                id="serial"
                value={newDevice.serial_number}
                onChange={(e) => setNewDevice({ ...newDevice, serial_number: e.target.value })}
                placeholder="Enter serial number"
              />
            </div>
            <div>
              <Label htmlFor="manufacturer">Manufacturer *</Label>
              <Input
                id="manufacturer"
                value={newDevice.manufacturer}
                onChange={(e) => setNewDevice({ ...newDevice, manufacturer: e.target.value })}
                placeholder="Enter manufacturer name"
              />
            </div>
            <div>
              <Label htmlFor="distributor">Distributor *</Label>
              <Input
                id="distributor"
                value={newDevice.distributor}
                onChange={(e) => setNewDevice({ ...newDevice, distributor: e.target.value })}
                placeholder="Enter distributor name"
              />
            </div>
            <div>
              <Label htmlFor="model">VLTD Model Code *</Label>
              <Input
                id="model"
                value={newDevice.VLTD_model_code}
                onChange={(e) => setNewDevice({ ...newDevice, VLTD_model_code: e.target.value })}
                placeholder="Enter model code"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddDevice}
              disabled={!newDevice.imei || !newDevice.serial_number || !newDevice.manufacturer || !newDevice.distributor || !newDevice.VLTD_model_code || loading}
            >
              {loading ? 'Creating...' : 'Create Device'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}