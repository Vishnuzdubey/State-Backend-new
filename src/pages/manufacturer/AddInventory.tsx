import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AddInventory() {
  const navigate = useNavigate();
  const [modelName, setModelName] = useState('');
  const [esimAllowed, setEsimAllowed] = useState('');
  const [bulkFileName, setBulkFileName] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState('CSV');
  const [deviceImei, setDeviceImei] = useState('');
  const [deviceSerial, setDeviceSerial] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleFile = (f?: File | null) => {
    setBulkFileName(f ? f.name : null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // basic validation
    if (!deviceImei.trim() || !deviceSerial.trim() || !modelName || !esimAllowed) {
      setError('Please fill required fields: Device IMEI, Device Serial, Model Name and ESIM Allowed.');
      return;
    }

    // simulate save: store one-off record to localStorage for now
    const payload = {
      imei: deviceImei.trim(),
      serial: deviceSerial.trim(),
      model: modelName,
      esimAllowed,
      bulkFileName,
      downloadFormat,
      createdAt: new Date().toISOString()
    };
    const existing = JSON.parse(localStorage.getItem('manufacturer_added_inventory') || '[]');
    existing.unshift(payload);
    localStorage.setItem('manufacturer_added_inventory', JSON.stringify(existing));

    setSavedMessage('Inventory saved locally.');
    // navigate back to inventory after a short delay
    setTimeout(() => navigate('/manufacturer/inventory'), 900);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Add Inventory</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
          {savedMessage && <div className="text-sm text-green-600 mb-3">{savedMessage}</div>}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Model Name*</label>
                <select className="w-full border rounded px-2 py-2" value={modelName} onChange={(e) => setModelName(e.target.value)}>
                  <option value="">Select</option>
                  <option value="APMG">APMG</option>
                  <option value="VLTDX">VLTDX</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">ESIM Allowed*</label>
                <select className="w-full border rounded px-2 py-2" value={esimAllowed} onChange={(e) => setEsimAllowed(e.target.value)}>
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bulk Upload</label>
                <input type="file" className="w-full" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
                <div className="text-sm text-gray-600 mt-1">{bulkFileName || 'No file chosen'}</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Download Format</label>
                <select className="w-full border rounded px-2 py-2" value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value)}>
                  <option value="CSV">CSV</option>
                  <option value="Excel">Excel</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Device IMEI*</label>
                <Input value={deviceImei} onChange={(e) => setDeviceImei(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Device Serial No*</label>
                <Input value={deviceSerial} onChange={(e) => setDeviceSerial(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Model Name*</label>
                <select className="w-full border rounded px-2 py-2" value={modelName} onChange={(e) => setModelName(e.target.value)}>
                  <option value="">Select</option>
                  <option value="APMG">APMG</option>
                  <option value="VLTDX">VLTDX</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" className="bg-blue-600">Save</Button>
              <Button variant="outline" onClick={() => navigate('/manufacturer/inventory')}>Back</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
