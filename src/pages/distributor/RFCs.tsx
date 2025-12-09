import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, RefreshCw } from 'lucide-react';
import { distributorApi, type InventoryDevice } from '@/api/distributor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type RFC = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export function DistributorRFCs() {
  const location = useLocation();
  const [rfcs, setRfcs] = useState<RFC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [selectedRFC, setSelectedRFC] = useState<RFC | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [rfcDevices, setRfcDevices] = useState<InventoryDevice[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<InventoryDevice | null>(null);
  const [isDeviceDetailsDialogOpen, setIsDeviceDetailsDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rfcs;
    return rfcs.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q)
    );
  }, [query, rfcs]);

  useEffect(() => {
    fetchRFCs();
  }, []);

  // Handle navigation state - auto open RFC details if rfcId in state
  useEffect(() => {
    if (location.state?.rfcId && rfcs.length > 0) {
      const rfc = rfcs.find(r => r.id === location.state.rfcId);
      if (rfc) {
        handleViewRFCDetails(rfc);
      }
    }
  }, [location.state, rfcs]);

  const fetchRFCs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await distributorApi.getRFCs({ page: 1, limit: 100, search: '' });
      setRfcs(response.rfcs || []);
    } catch (err) {
      console.error('Failed to fetch RFCs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load RFCs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRFCDevices = async (rfcId: string) => {
    try {
      setLoadingDevices(true);
      const response = await distributorApi.getInventory({ page: 1, limit: 100 });
      // Filter devices by rfc_entity_id
      const filtered = response.data.filter(d => d.rfc_entity_id === rfcId);
      setRfcDevices(filtered);
    } catch (err) {
      console.error('Failed to fetch RFC devices:', err);
      setRfcDevices([]);
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleViewRFCDetails = (rfc: RFC) => {
    setSelectedRFC(rfc);
    setIsDetailsDialogOpen(true);
    fetchRFCDevices(rfc.id);
  };

  const handleViewDeviceDetails = (device: InventoryDevice) => {
    setSelectedDevice(device);
    setIsDeviceDetailsDialogOpen(true);
  };

  const downloadCSV = (rows: RFC[]) => {
    const headers = ['Name', 'Email', 'Created Date'];
    const body = rows.map(r => [r.name, r.email, new Date(r.createdAt).toLocaleDateString()]);
    const csv = [headers, ...body].map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rfc-list.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">RFCs</h1>
          <p className="text-gray-600">View and manage assigned RFCs and their devices</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchRFCs()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">RFC List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={() => downloadCSV(filtered)}>
              CSV
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading RFCs...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No RFCs found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Name</th>
                    <th className="px-4 py-2 text-left font-semibold">Email</th>
                    <th className="px-4 py-2 text-left font-semibold">Created Date</th>
                    <th className="px-4 py-2 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map(rfc => (
                    <tr key={rfc.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewRFCDetails(rfc)}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {rfc.name}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{rfc.email}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(rfc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewRFCDetails(rfc)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
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

      {/* RFC Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">{selectedRFC?.name}</h2>
                <p className="text-sm font-normal text-gray-600">{selectedRFC?.email}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">RFC ID</p>
                  <p className="font-mono text-gray-900 break-all">{selectedRFC?.id}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Created</p>
                  <p className="text-gray-900">
                    {selectedRFC && new Date(selectedRFC.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Assigned Devices</h3>

              {loadingDevices ? (
                <div className="text-center py-8 text-gray-500">Loading devices...</div>
              ) : rfcDevices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No devices assigned to this RFC</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">IMEI</th>
                        <th className="px-4 py-2 text-left font-semibold">Serial</th>
                        <th className="px-4 py-2 text-left font-semibold">Model</th>
                        <th className="px-4 py-2 text-left font-semibold">Certificate</th>
                        <th className="px-4 py-2 text-left font-semibold">eSIM 1</th>
                        <th className="px-4 py-2 text-left font-semibold">eSIM 2</th>
                        <th className="px-4 py-2 text-left font-semibold">Status</th>
                        <th className="px-4 py-2 text-left font-semibold">Created</th>
                        <th className="px-4 py-2 text-left font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rfcDevices.map(device => (
                        <tr key={device.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-mono text-blue-600">
                            <button
                              onClick={() => handleViewDeviceDetails(device)}
                              className="hover:underline"
                            >
                              {device.imei}
                            </button>
                          </td>
                          <td className="px-4 py-2 font-mono text-gray-700">{device.serial_number}</td>
                          <td className="px-4 py-2">{device.VLTD_model_code}</td>
                          <td className="px-4 py-2 font-mono text-gray-700">{device.certificate_number}</td>
                          <td className="px-4 py-2 text-xs">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {device.eSIM_1_provider || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-xs">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                              {device.eSIM_2_provider || '-'}
                            </span>
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
                              onClick={() => handleViewDeviceDetails(device)}
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
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Device Details Dialog */}
      <Dialog open={isDeviceDetailsDialogOpen} onOpenChange={setIsDeviceDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Device Details</DialogTitle>
          </DialogHeader>

          {selectedDevice && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">IMEI</p>
                    <p className="font-mono font-semibold text-gray-900 break-all">{selectedDevice.imei}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Serial Number</p>
                    <p className="font-mono text-gray-900">{selectedDevice.serial_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Model Code</p>
                    <p className="font-mono text-gray-900">{selectedDevice.VLTD_model_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Certificate</p>
                    <p className="font-mono text-gray-900">{selectedDevice.certificate_number || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* SIM Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">SIM Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">ICCID</p>
                    <p className="font-mono text-gray-900 break-all text-xs">{selectedDevice.ICCID}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">eSIM 1 (EID)</p>
                    <p className="font-mono text-gray-900 break-all text-xs">{selectedDevice.eSIM_1 || 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">eSIM 1 Provider</p>
                    <p className="font-semibold text-gray-900">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {selectedDevice.eSIM_1_provider || 'N/A'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">eSIM 2 Provider</p>
                    <p className="font-semibold text-gray-900">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {selectedDevice.eSIM_2_provider || 'N/A'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Device ID</p>
                    <p className="font-mono text-gray-900 break-all text-xs">{selectedDevice.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created Date</p>
                    <p className="text-gray-900">{new Date(selectedDevice.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">RFC Entity ID</p>
                    <p className="font-mono text-gray-900 break-all text-xs">{selectedDevice.rfc_entity_id || 'Not assigned'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
