import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable';
import { Send, Mail, Calendar, Package, CheckCircle2, X, Eye, ExternalLink } from 'lucide-react';
import { manufacturerApi, type ManufacturerDistributor, type InventoryItem } from '@/api/manufacturer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function ManufacturerDistributors() {
  const navigate = useNavigate();
  const location = useLocation();
  const [distributors, setDistributors] = useState<ManufacturerDistributor[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [selectedDistributor, setSelectedDistributor] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Device viewing state
  const [isDevicesDialogOpen, setIsDevicesDialogOpen] = useState(false);
  const [selectedDistributorForView, setSelectedDistributorForView] = useState<ManufacturerDistributor | null>(null);
  const [distributorDevices, setDistributorDevices] = useState<InventoryItem[]>([]);
  const [loadingDistributorDevices, setLoadingDistributorDevices] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Handle navigation from DeviceDetails with viewDistributorId state
  useEffect(() => {
    if (location.state?.viewDistributorId && distributors.length > 0) {
      const distributorToView = distributors.find(d => d.entity_id === location.state.viewDistributorId);
      if (distributorToView) {
        handleViewDistributorDevices(distributorToView);
        // Clear the state to prevent re-opening on page reload
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state?.viewDistributorId, distributors]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [distributorsResponse, inventoryResponse] = await Promise.all([
        manufacturerApi.getDistributors(),
        manufacturerApi.getInventory(),
      ]);

      setDistributors(distributorsResponse.distributors);
      setInventory(inventoryResponse.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDistributorDevices = async (distributorId: string) => {
    try {
      setLoadingDistributorDevices(true);
      const response = await manufacturerApi.getInventoryByQuery({
        page: 1,
        limit: 100,
        search: '',
        distributorId,
      });
      setDistributorDevices(response.data || []);
    } catch (err) {
      console.error('Failed to fetch distributor devices:', err);
      setDistributorDevices([]);
    } finally {
      setLoadingDistributorDevices(false);
    }
  };

  const handleViewDistributorDevices = (distributor: ManufacturerDistributor) => {
    setSelectedDistributorForView(distributor);
    setIsDevicesDialogOpen(true);
    fetchDistributorDevices(distributor.id);
  };

  const handleDeviceView = (device: InventoryItem) => {
    navigate('/manufacturer/inventory/' + device.id, { state: { device } });
    setIsDevicesDialogOpen(false);
  };

  const handleAssignToDistributor = async () => {
    if (!selectedDistributor || selectedDevices.length === 0) {
      alert('Please select distributor and at least one device');
      return;
    }

    setIsAssigning(true);

    try {
      console.log('Starting distributor assignment...');
      console.log('Distributor ID:', selectedDistributor);
      console.log('IMEIs:', selectedDevices);

      await manufacturerApi.assignToDistributor({
        distributorId: selectedDistributor,
        imeis: selectedDevices,
      });

      alert(`Successfully assigned ${selectedDevices.length} device(s) to distributor`);
      setIsAssignDialogOpen(false);
      setSelectedDevices([]);
      setSelectedDistributor('');
      fetchData();
    } catch (err) {
      console.error('❌ Failed to assign devices:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        error: err,
      });

      const errorMessage = err instanceof Error ? err.message : 'Failed to assign devices';
      alert(`Assignment failed: ${errorMessage}`);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleOpenAssignDialog = () => {
    if (selectedDevices.length === 0) {
      alert('Please select at least one device from inventory');
      return;
    }
    setIsAssignDialogOpen(true);
  };

  const handleToggleDevice = (imei: string) => {
    setSelectedDevices(prev =>
      prev.includes(imei)
        ? prev.filter(i => i !== imei)
        : [...prev, imei]
    );
  };

  const handleToggleAll = () => {
    if (selectedDevices.length === inventory.length) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(inventory.map(d => d.imei));
    }
  };

  const distributorColumns = [
    {
      key: 'name',
      header: 'Name',
      render: (value: string, row: ManufacturerDistributor) => (
        <button
          onClick={() => handleViewDistributorDevices(row)}
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {value || 'N/A'}
        </button>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
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
      render: (_value: string, row: ManufacturerDistributor) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDistributorDevices(row)}
          className="text-blue-600 hover:text-blue-800"
        >
          <Eye className="h-4 w-4 mr-1" />
          Devices
        </Button>
      ),
    },
  ];

  const inventoryColumns = [
    {
      key: 'select',
      header: '',
      render: (_value: any, row: InventoryItem) => (
        <Checkbox
          checked={selectedDevices.includes(row.imei)}
          onCheckedChange={() => handleToggleDevice(row.imei)}
        />
      ),
    },
    {
      key: 'imei',
      header: 'IMEI',
      render: (value: string) => (
        <span className="font-mono text-sm font-medium">{value}</span>
      ),
    },
    {
      key: 'serial_number',
      header: 'Serial Number',
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'VLTD_model_code',
      header: 'Model',
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      key: 'certificate_number',
      header: 'Certificate',
      render: (value: string) => (
        <span className="text-sm font-mono">{value}</span>
      ),
    },
    {
      key: 'distributor_entity_id',
      header: 'Distributor',
      render: (_value: string | null, row: InventoryItem) => (
        row.distributor_entity ? (
          <span className="text-sm font-medium text-green-700">
            {row.distributor_entity.name || 'Unnamed'}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        )
      ),
    },
    {
      key: 'rfc_entity_id',
      header: 'RFC',
      render: (_value: string | null, row: InventoryItem) => (
        row.rfc_entity ? (
          <span className="text-sm font-medium text-purple-700">
            {row.rfc_entity.name || 'Unnamed'}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        )
      ),
    },
    {
      key: 'rfc_entity_id',
      header: 'Status',
      render: (_value: string | null, row: InventoryItem) => (
        row.distributor_entity_id || row.rfc_entity_id ? (
          <Badge className="bg-green-100 text-green-800 border-green-300">Assigned</Badge>
        ) : (
          <Badge variant="outline" className="text-gray-600">Not Assigned</Badge>
        )
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading distributors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Distributors</h1>
          <p className="text-gray-600">
            Manage distributors and assign inventory ({distributors.length} distributors)
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleOpenAssignDialog}
          disabled={selectedDevices.length === 0}
        >
          <Send className="mr-2 h-4 w-4" />
          Assign to Distributor ({selectedDevices.length})
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Distributors</p>
                <p className="text-2xl font-bold">{distributors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Inventory</p>
                <p className="text-2xl font-bold">{inventory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Send className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Selected for Assignment</p>
                <p className="text-2xl font-bold">{selectedDevices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distributors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Distributor List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={distributors}
            columns={distributorColumns}
            searchable
          />
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Available Inventory</span>
            <div className="flex items-center gap-2 text-sm font-normal">
              <Checkbox
                checked={selectedDevices.length === inventory.length && inventory.length > 0}
                onCheckedChange={handleToggleAll}
              />
              <span className="text-gray-600">Select All</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={inventory}
            columns={inventoryColumns}
            searchable
          />
        </CardContent>
      </Card>

      {/* Assign to Distributor Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Devices to Distributor</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Distributor Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Distributor</label>
              <Select value={selectedDistributor} onValueChange={setSelectedDistributor}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a distributor" />
                </SelectTrigger>
                <SelectContent>
                  {distributors.map((distributor) => (
                    <SelectItem key={distributor.id} value={distributor.id}>
                      {distributor.name} - {distributor.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Devices List */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Selected Devices ({selectedDevices.length})
              </label>
              <div className="max-h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                {selectedDevices.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDevices.map((imei) => {
                      const device = inventory.find((item) => item.imei === imei);
                      return (
                        <div
                          key={imei}
                          className="flex items-center justify-between p-2 bg-white rounded border"
                        >
                          <div className="flex-1">
                            <p className="font-mono text-sm font-medium">{imei}</p>
                            {device && (
                              <p className="text-xs text-gray-500">
                                {device.serial_number} - {device.VLTD_model_code}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleDevice(imei)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">No devices selected</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignToDistributor}
              disabled={!selectedDistributor || selectedDevices.length === 0 || isAssigning}
            >
              {isAssigning ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Distributor Devices Dialog */}
      <Dialog open={isDevicesDialogOpen} onOpenChange={setIsDevicesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Devices for Distributor: {selectedDistributorForView?.name}
              {selectedDistributorForView && (
                <p className="text-sm font-normal text-gray-600 mt-1">{selectedDistributorForView.email}</p>
              )}
            </DialogTitle>
          </DialogHeader>

          {loadingDistributorDevices ? (
            <div className="text-center py-8 text-gray-500">Loading devices...</div>
          ) : distributorDevices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No devices assigned to this distributor</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">IMEI</th>
                    <th className="px-4 py-2 text-left font-semibold">Serial</th>
                    <th className="px-4 py-2 text-left font-semibold">Model</th>
                    <th className="px-4 py-2 text-left font-semibold">Certificate</th>
                    <th className="px-4 py-2 text-left font-semibold">RFC</th>
                    <th className="px-4 py-2 text-left font-semibold">Status</th>
                    <th className="px-4 py-2 text-left font-semibold">Created Date</th>
                    <th className="px-4 py-2 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {distributorDevices.map(device => (
                    <tr key={device.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-blue-600">
                        <button
                          onClick={() => handleDeviceView(device)}
                          className="hover:underline"
                        >
                          {device.imei}
                        </button>
                      </td>
                      <td className="px-4 py-2 font-mono text-gray-700">{device.serial_number}</td>
                      <td className="px-4 py-2">{device.VLTD_model_code}</td>
                      <td className="px-4 py-2 font-mono text-gray-700">{device.certificate_number}</td>
                      <td className="px-4 py-2">
                        {device.rfc_entity_id && device.rfc_entity ? (
                          <button
                            onClick={() => navigate(`/manufacturer/rfcs/${device.rfc_entity_id}`)}
                            className="text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1"
                          >
                            <span className="text-xs">{device.rfc_entity.name || device.rfc_entity_id}</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {device.distributor_entity_id || device.rfc_entity_id ? (
                          <Badge className="bg-green-100 text-green-800 border-green-300">Assigned</Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">Not Assigned</Badge>
                        )}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {new Date(device.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeviceView(device)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
