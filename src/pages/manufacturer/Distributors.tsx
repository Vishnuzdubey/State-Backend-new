import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Distributor = {
  id: number;
  name: string;
  code: string;
  address: string;
  district: string;
  pincode: string;
};

const SAMPLE: Distributor[] = [
  { id: 1, name: 'R K Enterprises', code: 'RKE', address: 'B-704, Balaji Complex, Plot 12 & 13, Sector 8E, Kalamboli, Navi Mumbai', district: 'Raigad', pincode: '410218' }
];

export default function ManufacturerDistributors() {
  const [query, setQuery] = useState('');
  const [perPage] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SAMPLE;
    return SAMPLE.filter(d => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.district.toLowerCase().includes(q));
  }, [query]);

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  const downloadCSV = (rows: Distributor[]) => {
    const headers = ['Entity Name','Entity Code','Address','District','Pin Code'];
    const body = rows.map(r => [r.name, r.code, r.address, r.district, r.pincode]);
    const csv = [headers, ...body].map(r => r.map(c => '"' + String(c).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'distributors.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadExcel = (rows: Distributor[]) => {
    const headers = ['Entity Name','Entity Code','Address','District','Pin Code'];
    const body = rows.map(r => [r.name, r.code, r.address, r.district, r.pincode]);
    const csv = [headers, ...body].map(r => r.join('\t')).join('\n');
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'distributors.xls';
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPDF = (rows: Distributor[]) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const tableHtml = `
      <html>
        <head>
          <title>Distributors</title>
          <style>table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px}</style>
        </head>
        <body>
          <h1>Distributors</h1>
          <table>
            <thead>
              <tr>${['Entity Name','Entity Code','Address','District','Pin Code'].map(h=>`<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(r => `<tr><td>${r.name}</td><td>${r.code}</td><td>${r.address}</td><td>${r.district}</td><td>${r.pincode}</td></tr>`).join('')}
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Distributors</h1>
        <div className="text-sm text-gray-600">Total Count: {filtered.length}</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distributor List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Input placeholder="Search by name, code, district" value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} />
            <Button onClick={() => setQuery('')}>Search</Button>
            <Button onClick={() => downloadCSV(filtered)}>CSV</Button>
            <Button onClick={() => downloadExcel(filtered)}>Excel</Button>
            <Button onClick={() => printPDF(filtered)}>PDF</Button>
            <div className="ml-auto flex items-center gap-2">
              <div className="text-sm">Show</div>
              <select value={perPage} onChange={() => {}} className="border rounded px-2 py-1 text-sm">
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <div className="text-sm">page {page} of {Math.max(1, Math.ceil(filtered.length / perPage))}</div>
              <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-2">⬅️</button>
              <button disabled={page >= Math.ceil(filtered.length / perPage)} onClick={() => setPage(p => p + 1)} className="px-2">➡️</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Entity Name</th>
                  <th className="px-4 py-2 text-left">Entity Code</th>
                  <th className="px-4 py-2 text-left">Address</th>
                  <th className="px-4 py-2 text-left">District</th>
                  <th className="px-4 py-2 text-left">Pin Code</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paged.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 align-top">{d.name}</td>
                    <td className="px-4 py-2 align-top font-mono">{d.code}</td>
                    <td className="px-4 py-2 align-top">{d.address}</td>
                    <td className="px-4 py-2 align-top">{d.district}</td>
                    <td className="px-4 py-2 align-top">{d.pincode}</td>
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
