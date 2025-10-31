import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type RFCItem = {
  id: number;
  name: string;
  code: string;
  address: string;
  district: string;
  pincode: string;
};

const SAMPLE_RFC: RFCItem[] = [
  { id: 1, name: 'Logic Labs Infotronics Limited', code: 'RFCLOGIC', address: '002, Shree ji Krupa Bldg, Cross Garden Rd, behind Dena Bank, Bhayandar', district: 'Thane', pincode: '401101' },
  { id: 2, name: 'Hira Auto Garage', code: 'RFCHAG', address: 'PLOT NO. 29, TATA POWER COMPANY, VICCO NAKA, NEAR MANPADA POLICE STATION, DOMBIVALI EAST', district: 'DOMBIVALI EAST', pincode: '421201' },
  { id: 3, name: 'Siddnath Industries', code: 'RFCSI', address: 'G.NO-367, WARD NO.24/ 232 -C, NR.SINCHAN BHAWAN, AURANGBAD BYPASS ROAD', district: 'Osmanabad State', pincode: '413501' },
  { id: 4, name: 'Protech india', code: 'RFCPI', address: 'SHOP NO B 2, PRIVIA BUSINESS CENTER, NEAR NEW PCMC RTO OFFICE, SECTOR 6', district: 'Pune', pincode: '412105' },
  { id: 5, name: 'SK Fuel', code: 'RFCSKF', address: 'Shop No- 2, Sai Baba Nagar, Vaman Bhoir Road, Dahisar West,', district: 'Dahisar', pincode: '400068' },
  { id: 6, name: 'Hindustan Auto Gas', code: 'RFCHAGA', address: '10 NUMBER PULIYA, Keshaw Complex, Kamptee Rd, near KADBI CHOWK, Dobi Nagar', district: 'Nagpur', pincode: '440017' },
  { id: 7, name: 'Sharvil Enterprises', code: 'RFCSE', address: 'INDIRA NAGAR NO 1, 5, Dattatray Chawl, Golibar Road, KM Two Wheeler Garage', district: 'Ghatkopar', pincode: '400086' },
  { id: 8, name: 'OM AUTOMOBILES', code: 'RFCOMA', address: 'Shop No.12, Plot No.56/57, Sector-19C, Vashi', district: 'Navi Mumbai', pincode: '400705' },
  { id: 9, name: 'GLOBAL MOTORS', code: 'RFCGM', address: '138/2 VEDANT NAGAR, AKKALKOT ROAD,', district: 'SOLAPUR', pincode: '413006' },
  { id: 10, name: 'SOHAIL AUTO', code: 'RFCSA', address: 'Hiraram Complex, Bhangsimata Road, New RTO Office, Karodi, Chh Sambhaji Nagar', district: 'Aurangabad', pincode: '413113' }
];

export default function ManufacturerRFCs() {
  const [query, setQuery] = useState<string>('');
  // Total count requested as 55 in the sample
  const [totalCount] = useState<number>(55);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SAMPLE_RFC;
    return SAMPLE_RFC.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      r.district.toLowerCase().includes(q)
    );
  }, [query]);

  const downloadCSV = (rows: RFCItem[]) => {
    const headers = ['Entity Name','Entity Code','Address','District','Pin Code'];
    const body = rows.map(r => [r.name, r.code, r.address, r.district, r.pincode]);
    const csv = [headers, ...body].map(r => r.map(c => '"' + String(c).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rfc-list.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadExcel = (rows: RFCItem[]) => {
    const headers = ['Entity Name','Entity Code','Address','District','Pin Code'];
    const body = rows.map(r => [r.name, r.code, r.address, r.district, r.pincode]);
    const csv = [headers, ...body].map(r => r.join('\t')).join('\n');
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rfc-list.xls';
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPDF = (rows: RFCItem[]) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const tableHtml = `
      <html>
        <head>
          <title>RFC List</title>
          <style>table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px}</style>
        </head>
        <body>
          <h1>RFC List</h1>
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
        <h1 className="text-2xl font-bold">RFC List</h1>
        <div className="text-sm text-gray-600">Total Count: {totalCount}</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>RFCs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Input placeholder="Search by name, code or district" value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} />
            <Button onClick={() => setQuery('')}>Search</Button>
            <Button onClick={() => downloadCSV(filtered)}>CSV</Button>
            <Button onClick={() => downloadExcel(filtered)}>Excel</Button>
            <Button onClick={() => printPDF(filtered)}>PDF</Button>
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
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 align-top">{r.name}</td>
                    <td className="px-4 py-2 align-top font-mono">{r.code}</td>
                    <td className="px-4 py-2 align-top">{r.address}</td>
                    <td className="px-4 py-2 align-top">{r.district}</td>
                    <td className="px-4 py-2 align-top">{r.pincode}</td>
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
