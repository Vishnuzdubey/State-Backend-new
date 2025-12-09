import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, RefreshCw } from 'lucide-react';
import { manufacturerApi, type InventoryItem } from '@/api/manufacturer';
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

export default function ManufacturerRFCs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [rfcs, setRfcs] = useState<RFC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [selectedRFC, setSelectedRFC] = useState<RFC | null>(null);
  const [isDevicesDialogOpen, setIsDevicesDialogOpen] = useState(false);
  const [rfcDevices, setRfcDevices] = useState<InventoryItem[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

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

  // Handle navigation from DeviceDetails with viewRFCId state
  useEffect(() => {
    if (location.state?.viewRFCId && rfcs.length > 0) {
      const rfcToView = rfcs.find(r => r.id === location.state.viewRFCId);
      if (rfcToView) {
        handleViewDevices(rfcToView);
        // Clear the state to prevent re-opening on page reload
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state?.viewRFCId, rfcs]);

  const fetchRFCs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await manufacturerApi.getRFCs();
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
      const response = await manufacturerApi.getInventoryByQuery({
        page: 1,
        limit: 100,
        search: '',
        rfcId,
      });
      setRfcDevices(response.data || []);
    } catch (err) {
      console.error('Failed to fetch RFC devices:', err);
      setRfcDevices([]);
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleViewDevices = (rfc: RFC) => {
    setSelectedRFC(rfc);
    setIsDevicesDialogOpen(true);
    fetchRFCDevices(rfc.id);
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

  const downloadExcel = (rows: RFC[]) => {
    const headers = ['Name', 'Email', 'Created Date'];
    const body = rows.map(r => [r.name, r.email, new Date(r.createdAt).toLocaleDateString()]);
    const csv = [headers, ...body].map(r => r.join('\t')).join('\n');
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rfc-list.xls';
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPDF = (rows: RFC[]) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const tableHtml = `
      <html>
        <head>
          <title>RFC List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            td, th { border: 1px solid #ddd; padding: 10px; font-size: 12px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            h1 { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>RFC List</h1>
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Created Date</th></tr>
            </thead>
            <tbody>
              ${rows.map(r => `<tr><td>${r.name}</td><td>${r.email}</td><td>${new Date(r.createdAt).toLocaleDateString()}</td></tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    win.document.write(tableHtml);
    win.document.close();
    win.print();
  };

  const handleDeviceView = (device: InventoryItem) => {
    navigate('/manufacturer/inventory/' + device.id, { state: { device } });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">RFC List</h1>
          <p className="text-gray-600">Manage and view RFC entities</p>
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
          <CardTitle className="text-lg">RFC Entities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by name or email..."
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={() => downloadCSV(filtered)}>
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadExcel(filtered)}>
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => printPDF(filtered)}>
              PDF
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
                      <td className="px-4 py-3 font-medium text-gray-900">{rfc.name}</td>
                      <td className="px-4 py-3 text-gray-700">{rfc.email}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(rfc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDevices(rfc)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Devices
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

      <Dialog open={isDevicesDialogOpen} onOpenChange={setIsDevicesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Devices for RFC: {selectedRFC?.name}
            </DialogTitle>
          </DialogHeader>

          {loadingDevices ? (
            <div className="text-center py-8 text-gray-500">Loading devices...</div>
          ) : rfcDevices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No devices found for this RFC</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">IMEI</th>
                    <th className="px-4 py-2 text-left font-semibold">Serial</th>
                    <th className="px-4 py-2 text-left font-semibold">Model</th>
                    <th className="px-4 py-2 text-left font-semibold">Certificate</th>
                    <th className="px-4 py-2 text-left font-semibold">Status</th>
                    <th className="px-4 py-2 text-left font-semibold">Created Date</th>
                    <th className="px-4 py-2 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rfcDevices.map(device => (
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
