import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Device = {
  id: number;
  serial: string;
  manufacturer: string;
  distributor: string;
  imei: string;
  model: string;
  status: string;
};

const SAMPLE_DATA: Device[] = [
  { id: 1, serial: 'APM1N1A092500006763', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061448920', model: 'APMG', status: 'Assigned' },
  { id: 2, serial: 'APM1N1A092500006764', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061451270', model: 'APMG', status: 'Assigned' },
  { id: 3, serial: 'APM1N1A092500006765', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061449225', model: 'APMG', status: 'Assigned' },
  { id: 4, serial: 'APM1N1A092500006766', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061445298', model: 'APMG', status: 'Assigned' },
  { id: 5, serial: 'APM1N1A092500006767', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061427171', model: 'APMG', status: 'Assigned' },
  { id: 6, serial: 'APM1N1A092500006748', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061425787', model: 'APMG', status: 'Assigned' },
  { id: 7, serial: 'APM1N1A092500006749', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061448235', model: 'APMG', status: 'Assigned' },
  { id: 8, serial: 'APM1N1A092500006752', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061453359', model: 'APMG', status: 'Assigned' },
  { id: 9, serial: 'APM1N1A092500006751', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061444887', model: 'APMG', status: 'Assigned' },
  { id: 10, serial: 'APM1N1A092500006750', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061444523', model: 'APMG', status: 'Assigned' },
  { id: 11, serial: 'APM1N1A092500006762', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061453482', model: 'APMG', status: 'Assigned' },
  { id: 12, serial: 'APM1N1A092500006758', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061451734', model: 'APMG', status: 'Assigned' },
  { id: 13, serial: 'APM1N1A092500006759', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061448375', model: 'APMG', status: 'Assigned' },
  { id: 14, serial: 'APM1N1A092500006760', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061449415', model: 'APMG', status: 'Assigned' },
  { id: 15, serial: 'APM1N1A092500006761', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061451221', model: 'APMG', status: 'Assigned' },
  { id: 16, serial: 'APM1N1A092500006743', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061449035', model: 'APMG', status: 'Assigned' },
  { id: 17, serial: 'APM1N1A092500006744', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061448896', model: 'APMG', status: 'Assigned' },
  { id: 18, serial: 'APM1N1A092500006746', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061442394', model: 'APMG', status: 'Assigned' },
  { id: 19, serial: 'APM1N1A092500006745', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061452104', model: 'APMG', status: 'Assigned' },
  { id: 20, serial: 'APM1N1A092500006747', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061432767', model: 'APMG', status: 'Assigned' },
  { id: 21, serial: 'APM1N1A092500006715', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061495533', model: 'APMG', status: 'Assigned' },
  { id: 22, serial: 'APM1N1A092500006714', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061518680', model: 'APMG', status: 'Assigned' },
  { id: 23, serial: 'APM1N1A092500006757', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061464323', model: 'APMG', status: 'Assigned' },
  { id: 24, serial: 'APM1N1A092500006756', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061459455', model: 'APMG', status: 'Assigned' },
  { id: 25, serial: 'APM1N1A092500006755', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061449456', model: 'APMG', status: 'Assigned' },
  { id: 26, serial: 'APM1N1A092500006754', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061464471', model: 'APMG', status: 'Assigned' },
  { id: 27, serial: 'APM1N1A092500006753', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061444697', model: 'APMG', status: 'Assigned' },
  { id: 28, serial: 'APM1N1A092500006742', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061442212', model: 'APMG', status: 'Assigned' },
  { id: 29, serial: 'APM1N1A092500006741', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061449654', model: 'APMG', status: 'Assigned' },
  { id: 30, serial: 'APM1N1A092500006740', manufacturer: 'APM GROUP PRIVATE LIMITED', distributor: 'R K Enterprises', imei: '861850061449845', model: 'APMG', status: 'Assigned' },
];

export function ManufacturerInventory() {
  const [query, setQuery] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('2025-03-05');
  const [toDate, setToDate] = useState<string>('2025-10-30');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [totalCount] = useState<number>(1403);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const q = query.trim();
    return SAMPLE_DATA.filter(d => {
      if (q && !d.imei.includes(q) && !d.serial.includes(q) && !d.manufacturer.toLowerCase().includes(q.toLowerCase())) return false;
      // Date filtering is not applied to sample data (no dates), but kept for UI
      return true;
    });
  }, [query]);

  const downloadCSV = (rows: Device[]) => {
    const headers = ['#','Device Serial No','Manufacturer Name','Distributor Name','IMEI Number','VLTD Model Code','Action'];
    const body = rows.map((r, idx) => [String(idx+1), r.serial, r.manufacturer, r.distributor, r.imei, r.model, r.status]);
    const csv = [headers, ...body].map(r => r.map(c => '"' + String(c).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'device-inventory.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadExcel = (rows: Device[]) => {
    const headers = ['#','Device Serial No','Manufacturer Name','Distributor Name','IMEI Number','VLTD Model Code','Action'];
    const body = rows.map((r, idx) => [String(idx+1), r.serial, r.manufacturer, r.distributor, r.imei, r.model, r.status]);
    const csv = [headers, ...body].map(r => r.join('\t')).join('\n');
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'device-inventory.xls';
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPDF = (rows: Device[]) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const tableHtml = `\n      <html>\n        <head>\n          <title>Device Inventory</title>\n          <style>table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px}</style>\n        </head>\n        <body>\n          <h1>Device Inventory</h1>\n          <table>\n            <thead>\n              <tr>${['#','Device Serial No','Manufacturer Name','Distributor Name','IMEI Number','VLTD Model Code','Action'].map(h=>`<th>${h}</th>`).join('')}<\/tr>\n            <\/thead>\n            <tbody>\n              ${rows.map((r,idx)=>`<tr><td>${idx+1}</td><td>${r.serial}</td><td>${r.manufacturer}</td><td>${r.distributor}</td><td>${r.imei}</td><td>${r.model}</td><td>${r.status}</td></tr>`).join('')}\n            <\/tbody>\n          <\/table>\n        <\/body>\n      <\/html>\n    `;
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
              <Button onClick={() => { setQuery(''); }}>Search</Button>
              <Button onClick={() => downloadCSV(filtered)}>CSV</Button>
              <Button onClick={() => downloadExcel(filtered)}>Excel</Button>
              <Button onClick={() => printPDF(filtered)}>PDF</Button>
              <Button variant="ghost" className="ml-4">Unblock Permitholder</Button>
              <div className="text-sm text-gray-600 ml-4">Total Count: {totalCount}</div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Device Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex items-center gap-2">
                <label className="text-sm">From Date:</label>
                <Input type="date" value={fromDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFromDate(e.target.value)} />
                <label className="text-sm ml-4">Upto Date:</label>
                <Input type="date" value={toDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToDate(e.target.value)} />
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Input placeholder="Search By IMEI or Serial" value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} />
                <Button onClick={() => { setQuery(''); }}>Clear</Button>
                <Button onClick={() => downloadCSV(filtered)}>CSV</Button>
                <Button onClick={() => downloadExcel(filtered)}>Excel</Button>
                <Button onClick={() => printPDF(filtered)}>PDF</Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">#</th>
                    <th className="px-4 py-2 text-left">Device Serial No</th>
                    <th className="px-4 py-2 text-left">Manufacturer Name</th>
                    <th className="px-4 py-2 text-left">Distributor Name</th>
                    <th className="px-4 py-2 text-left">IMEI Number</th>
                    <th className="px-4 py-2 text-left">VLTD Model Code</th>
                    <th className="px-4 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((d, idx) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 align-top">{idx + 1}</td>
                      <td className="px-4 py-2 align-top font-mono">{d.serial}</td>
                      <td className="px-4 py-2 align-top">{d.manufacturer}</td>
                      <td className="px-4 py-2 align-top">{d.distributor}</td>
                      <td className="px-4 py-2 align-top">{d.imei}</td>
                      <td className="px-4 py-2 align-top">{d.model}</td>
                      <td className="px-4 py-2 align-top text-green-600">{d.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}