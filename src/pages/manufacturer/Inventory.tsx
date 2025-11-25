import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RefreshCw } from 'lucide-react';
import { manufacturerApi, type InventoryItem } from '@/api';

export function ManufacturerInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('2025-03-05');
  const [toDate, setToDate] = useState<string>('2025-10-30');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
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
    const headers = ['#', 'IMEI', 'Serial Number', 'Model Code', 'ICCID', 'eSIM 1', 'eSIM 2', 'Providers', 'Certificate'];
    const body = rows.map((r, idx) => [
      String(idx + 1),
      r.imei,
      r.serial_number,
      r.VLTD_model_code,
      r.ICCID,
      r.eSIM_1,
      r.eSIM_2,
      r.providers,
      r.certificate
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
    const headers = ['#', 'IMEI', 'Serial Number', 'Model Code', 'ICCID', 'eSIM 1', 'eSIM 2', 'Providers', 'Certificate'];
    const body = rows.map((r, idx) => [
      String(idx + 1),
      r.imei,
      r.serial_number,
      r.VLTD_model_code,
      r.ICCID,
      r.eSIM_1,
      r.eSIM_2,
      r.providers,
      r.certificate
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
          <style>table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;font-size:12px}</style>
        </head>
        <body>
          <h1>Device Inventory</h1>
          <table>
            <thead>
              <tr>${['#', 'IMEI', 'Serial Number', 'Model Code', 'ICCID', 'eSIM 1', 'eSIM 2', 'Providers', 'Certificate'].map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map((r, idx) => `<tr><td>${idx + 1}</td><td>${r.imei}</td><td>${r.serial_number}</td><td>${r.VLTD_model_code}</td><td>${r.ICCID}</td><td>${r.eSIM_1}</td><td>${r.eSIM_2}</td><td>${r.providers}</td><td>${r.certificate}</td></tr>`).join('')}
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
    <div className="p-6">
      {/* Top toolbar with primary filters and actions */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" className="bg-blue-600 text-white">All Devices</Button>
          <Button variant="outline" onClick={() => navigate('/manufacturer/add-inventory')}>Add Inventory</Button>
          <Button variant="outline">Not Sending Data</Button>
          <Button variant="outline">All Inventory Pending by CT</Button>
          <Button variant="outline">Activated Devices</Button>
          <div className="ml-4 text-sm font-semibold">DEVICE INVENTORY LIST</div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <input id="file-input" type="file" className="hidden" onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name || null)} />
            <label htmlFor="file-input" className="inline-flex items-center gap-2 px-3 py-2 rounded border bg-white hover:bg-gray-50 cursor-pointer">Choose file</label>
            <div className="text-sm text-gray-600">{selectedFileName || 'No file chosen'}</div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm">From Date:</label>
            <Input type="date" value={fromDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFromDate(e.target.value)} />
            <label className="text-sm ml-4">Upto Date:</label>
            <Input type="date" value={toDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToDate(e.target.value)} />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Input placeholder="Search By IMEI or Serial" value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} />
            <Button onClick={fetchInventory} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => downloadCSV(filtered)}>CSV</Button>
            <Button onClick={() => downloadExcel(filtered)}>Excel</Button>
            <Button onClick={() => printPDF(filtered)}>PDF</Button>
            <div className="text-sm text-gray-600 ml-4">Total Count: {inventory.length}</div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Device Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading inventory...</span>
            </div>
          ) : inventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 mb-4">No inventory found</p>
              <Button onClick={() => navigate('/manufacturer/add-inventory')}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Device
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">#</th>
                    <th className="px-4 py-2 text-left">IMEI</th>
                    <th className="px-4 py-2 text-left">Serial Number</th>
                    <th className="px-4 py-2 text-left">Model Code</th>
                    <th className="px-4 py-2 text-left">ICCID</th>
                    <th className="px-4 py-2 text-left">eSIM 1</th>
                    <th className="px-4 py-2 text-left">eSIM 2</th>
                    <th className="px-4 py-2 text-left">Providers</th>
                    <th className="px-4 py-2 text-left">Certificate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((d, idx) => (
                    <tr key={d.manufacturer_inventory_id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 align-top">{idx + 1}</td>
                      <td className="px-4 py-2 align-top font-mono">{d.imei}</td>
                      <td className="px-4 py-2 align-top font-mono">{d.serial_number}</td>
                      <td className="px-4 py-2 align-top">{d.VLTD_model_code}</td>
                      <td className="px-4 py-2 align-top font-mono">{d.ICCID}</td>
                      <td className="px-4 py-2 align-top">{d.eSIM_1}</td>
                      <td className="px-4 py-2 align-top">{d.eSIM_2}</td>
                      <td className="px-4 py-2 align-top">{d.providers}</td>
                      <td className="px-4 py-2 align-top">{d.certificate}</td>
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