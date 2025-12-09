import  { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RefreshCw, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { manufacturerApi, type InventoryItem } from '@/api';

export function ManufacturerInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  // const [fromDate, setFromDate] = useState<string>('2025-03-05');
  // const [toDate, setToDate] = useState<string>('2025-10-30');
  // const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchInventory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await manufacturerApi.getInventory();
      setInventory(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inventory');
      console.error('Error fetching inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim();
    return inventory.filter(d => {
      if (q && !d.imei.includes(q) && !d.serial_number.includes(q)) return false;
      return true;
    });
  }, [query, inventory]);

  const downloadCSV = (rows: InventoryItem[]) => {
    const headers = ['#', 'IMEI', 'Serial Number', 'Model Code', 'ICCID', 'eSIM 1', 'eSIM 1 Provider', 'eSIM 2', 'eSIM 2 Provider', 'Certificate', 'Distributor', 'RFC', 'Created Date'];
    const body = rows.map((r, idx) => [
      String(idx + 1),
      r.imei,
      r.serial_number,
      r.VLTD_model_code,
      r.ICCID,
      r.eSIM_1,
      r.eSIM_1_provider || '',
      r.eSIM_2,
      r.eSIM_2_provider || '',
      r.certificate_number || '',
      r.distributor_entity?.name || r.distributor_entity_id || '-',
      r.rfc_entity?.name || r.rfc_entity_id || '-',
      new Date(r.createdAt).toLocaleDateString()
    ]);
    const csv = [headers, ...body].map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'device-inventory.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadExcel = (rows: InventoryItem[]) => {
    const headers = ['#', 'IMEI', 'Serial Number', 'Model Code', 'ICCID', 'eSIM 1', 'eSIM 1 Provider', 'eSIM 2', 'eSIM 2 Provider', 'Certificate', 'Distributor', 'RFC', 'Created Date'];
    const body = rows.map((r, idx) => [
      String(idx + 1),
      r.imei,
      r.serial_number,
      r.VLTD_model_code,
      r.ICCID,
      r.eSIM_1,
      r.eSIM_1_provider || '',
      r.eSIM_2,
      r.eSIM_2_provider || '',
      r.certificate_number || '',
      r.distributor_entity?.name || r.distributor_entity_id || '-',
      r.rfc_entity?.name || r.rfc_entity_id || '-',
      new Date(r.createdAt).toLocaleDateString()
    ]);
    const csv = [headers, ...body].map(r => r.join('\t')).join('\n');
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'device-inventory.xls';
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPDF = (rows: InventoryItem[]) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const tableHtml = `
      <html>
        <head>
          <title>Device Inventory</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            td, th { border: 1px solid #ddd; padding: 10px; font-size: 11px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            h1 { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>Device Inventory Report</h1>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>IMEI</th>
                <th>Serial Number</th>
                <th>Model Code</th>
                <th>ICCID</th>
                <th>eSIM 1</th>
                <th>eSIM 1 Provider</th>
                <th>eSIM 2</th>
                <th>eSIM 2 Provider</th>
                <th>Certificate</th>
                <th>Distributor</th>
                <th>RFC</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((r, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${r.imei}</td>
                  <td>${r.serial_number}</td>
                  <td>${r.VLTD_model_code}</td>
                  <td>${r.ICCID}</td>
                  <td>${r.eSIM_1}</td>
                  <td>${r.eSIM_1_provider || '-'}</td>
                  <td>${r.eSIM_2}</td>
                  <td>${r.eSIM_2_provider || '-'}</td>
                  <td>${r.certificate_number || '-'}</td>
                  <td>${r.distributor_entity?.name || r.distributor_entity_id || '-'}</td>
                  <td>${r.rfc_entity?.name || r.rfc_entity_id || '-'}</td>
                  <td>${new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    win.document.write(tableHtml);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Device Inventory</h1>
          <p className="text-gray-600">Manage and track all devices in inventory</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate('/manufacturer/add-inventory')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Device
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Summary Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Devices</p>
              <p className="text-3xl font-bold text-blue-600">{inventory.length}</p>
            </div>
            <Button
              onClick={fetchInventory}
              disabled={isLoading}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap items-end">
              <div className="flex-1 min-w-48">
                <label className="text-sm font-medium text-gray-700 block mb-2">Search by IMEI or Serial</label>
                <Input
                  placeholder="Enter IMEI or Serial Number..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => downloadCSV(filtered)} variant="outline" size="sm">
                  CSV
                </Button>
                <Button onClick={() => downloadExcel(filtered)} variant="outline" size="sm">
                  Excel
                </Button>
                <Button onClick={() => printPDF(filtered)} variant="outline" size="sm">
                  PDF
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filtered.length}</span> of <span className="font-semibold">{inventory.length}</span> devices
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Device List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3" />
              <span className="text-gray-600">Loading inventory...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 mb-4 text-lg">
                {inventory.length === 0 ? 'No devices found in inventory' : 'No devices match your search'}
              </p>
              {inventory.length === 0 && (
                <Button onClick={() => navigate('/manufacturer/add-inventory')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Device
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">IMEI</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Distributor</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">RFC</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Serial Number</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Model Code</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">ICCID</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">eSIM 1</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Provider</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">eSIM 2</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Provider</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Certificate</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Created</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((device, idx) => (
                    <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/manufacturer/inventory/${device.id}`, { state: { device } })}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium font-mono"
                        >
                          {device.imei}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        {device.distributor_entity ? (
                          <span className="text-sm font-medium text-green-700">
                            {device.distributor_entity.name || 'Unnamed'}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {device.rfc_entity ? (
                          <span className="text-sm font-medium text-purple-700">
                            {device.rfc_entity.name || 'Unnamed'}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-700">{device.serial_number}</td>
                      <td className="px-4 py-3 text-gray-700">{device.VLTD_model_code}</td>
                      <td className="px-4 py-3 font-mono text-gray-700">{device.ICCID}</td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-700">{device.eSIM_1}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {device.eSIM_1_provider || '-'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-700">{device.eSIM_2 || '-'}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {device.eSIM_2_provider || '-'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-700">{device.certificate_number || '-'}</td>
                      <td className="px-4 py-3">
                        {device.distributor_entity_id || device.rfc_entity_id ? (
                          <Badge className="bg-green-100 text-green-800 border-green-300">Assigned</Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">Not Assigned</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(device.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => navigate(`/manufacturer/inventory/${device.id}`, { state: { device } })}
                          className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}