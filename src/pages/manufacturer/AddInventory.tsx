import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, Plus, Trash2, FileText } from 'lucide-react';
import { manufacturerApi } from '@/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type InventoryDevice = {
  imei: string;
  serial_number: string;
  VLTD_model_code: string;
  ICCID: string;
  eSIM_1: string;
  eSIM_2: string;
  eSIM_1_provider: string;
  eSIM_2_provider: string;
};

type UploadMode = 'single' | 'bulk';

export default function AddInventory() {
  const navigate = useNavigate();
  const [uploadMode, setUploadMode] = useState<UploadMode>('single');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Single device state
  const [singleDevice, setSingleDevice] = useState<InventoryDevice>({
    imei: '',
    serial_number: '',
    VLTD_model_code: '',
    ICCID: '',
    eSIM_1: '',
    eSIM_2: '',
    eSIM_1_provider: '',
    eSIM_2_provider: '',
  });

  // Bulk upload state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedDevices, setParsedDevices] = useState<InventoryDevice[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const downloadExampleCSV = () => {
    const csvContent = `imei,serial_number,VLTD_model_code,ICCID,eSIM_1,eSIM_2,eSIM_1_provider,eSIM_2_provider
863789450001001,SN-X1001,VLTD-XP01,8991101204500001001,EID100001-A1,EID100001-B1,Jio,Airtel
863789450001002,SN-X1002,VLTD-XP01,8991101204500001002,EID100002-A1,EID100002-B1,Jio,BSNL`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (file: File) => {
    console.log('📄 Starting CSV parsing for file:', file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        console.log('📝 CSV file content length:', text.length);
        const lines = text.split('\n').filter(line => line.trim());
        console.log('📊 Total lines found:', lines.length);

        if (lines.length < 2) {
          console.error('❌ CSV file is empty or has no data rows');
          setError('CSV file is empty or invalid');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        console.log('📋 CSV Headers found:', headers);
        const requiredHeaders = [
          'imei', 'serial_number', 'VLTD_model_code', 'ICCID',
          'eSIM_1', 'eSIM_2', 'eSIM_1_provider', 'eSIM_2_provider'
        ];

        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
          console.error('❌ Missing required headers:', missingHeaders);
          setError(`Missing required columns: ${missingHeaders.join(', ')}`);
          return;
        }
        console.log('✅ All required headers present');


        const devices: InventoryDevice[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length !== headers.length) {
            console.warn(`⚠️ Row ${i} skipped: column count mismatch (expected ${headers.length}, got ${values.length})`);
            continue;
          }

          const device: any = {};
          headers.forEach((header, index) => {
            device[header] = values[index];
          });

          devices.push(device as InventoryDevice);
        }

        console.log('✅ Successfully parsed', devices.length, 'devices from CSV');
        console.log('📦 Parsed devices:', devices);
        setParsedDevices(devices);
        setShowPreview(true);
        setError(null);
      } catch (err) {
        console.error('❌ CSV parsing error:', err);
        setError('Failed to parse CSV file. Please check the format.');
      }
    };
    reader.onerror = (err) => {
      console.error('❌ File reading error:', err);
      setError('Failed to read CSV file');
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        return;
      }
      setCsvFile(file);
      parseCSV(file);
    }
  };

  const handleSingleDeviceChange = (field: keyof InventoryDevice, value: string) => {
    setSingleDevice(prev => ({ ...prev, [field]: value }));
  };

  const validateSingleDevice = (): boolean => {
    const required = Object.entries(singleDevice);
    for (const [key, value] of required) {
      if (!value || value.trim() === '') {
        setError(`${key.replace(/_/g, ' ')} is required`);
        return false;
      }
    }
    return true;
  };

  const handleSingleUpload = async () => {
    if (!validateSingleDevice()) return;

    console.log('🚀 Starting single device upload');
    console.log('📦 Device data:', singleDevice);
    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await manufacturerApi.bulkUploadInventory([singleDevice]);
      console.log('✅ Single device upload successful:', result);
      setSuccess('Device added successfully!');
      setTimeout(() => navigate('/manufacturer/inventory'), 1500);
    } catch (err: any) {
      console.error('❌ Single device upload failed:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError(err.message || 'Failed to add device');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (parsedDevices.length === 0) {
      console.error('❌ No devices to upload');
      setError('No devices to upload');
      return;
    }

    console.log('🚀 Starting bulk upload');
    console.log('📦 Uploading', parsedDevices.length, 'devices');
    console.log('📊 Device data:', parsedDevices);
    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await manufacturerApi.bulkUploadInventory(parsedDevices);
      console.log('✅ Bulk upload successful!');
      console.log('📋 API Response:', result);
      setSuccess(`Successfully uploaded ${parsedDevices.length} device(s)!`);
      setTimeout(() => {
        console.log('🔄 Navigating to inventory page');
        navigate('/manufacturer/inventory');
      }, 2000);
    } catch (err: any) {
      console.error('❌ Bulk upload failed:', err);
      console.error('Error details:', err.response?.data || err.message);
      console.error('Error status:', err.response?.status);
      setError(err.message || 'Failed to upload devices');
    } finally {
      setIsUploading(false);
      console.log('🏁 Upload process completed');
    }
  };

  const removeDevice = (index: number) => {
    setParsedDevices(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Add Inventory</h1>
          <p className="text-gray-600 mt-1">Upload device inventory individually or in bulk</p>
        </div>
        <Button variant="outline" onClick={downloadExampleCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Download CSV Template
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as UploadMode)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="single" className="gap-2">
            <Plus className="h-4 w-4" />
            Single Device
          </TabsTrigger>
          <TabsTrigger value="bulk" className="gap-2">
            <Upload className="h-4 w-4" />
            Bulk Upload
          </TabsTrigger>
        </TabsList>

        {/* Single Device Upload */}
        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Add Single Device</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">IMEI *</label>
                  <Input
                    value={singleDevice.imei}
                    onChange={(e) => handleSingleDeviceChange('imei', e.target.value)}
                    placeholder="863789450001001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Serial Number *</label>
                  <Input
                    value={singleDevice.serial_number}
                    onChange={(e) => handleSingleDeviceChange('serial_number', e.target.value)}
                    placeholder="SN-X1001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">VLTD Model Code *</label>
                  <Input
                    value={singleDevice.VLTD_model_code}
                    onChange={(e) => handleSingleDeviceChange('VLTD_model_code', e.target.value)}
                    placeholder="VLTD-XP01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ICCID *</label>
                  <Input
                    value={singleDevice.ICCID}
                    onChange={(e) => handleSingleDeviceChange('ICCID', e.target.value)}
                    placeholder="8991101204500001001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">eSIM 1 *</label>
                  <Input
                    value={singleDevice.eSIM_1}
                    onChange={(e) => handleSingleDeviceChange('eSIM_1', e.target.value)}
                    placeholder="EID100001-A1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">eSIM 1 Provider *</label>
                  <Input
                    value={singleDevice.eSIM_1_provider}
                    onChange={(e) => handleSingleDeviceChange('eSIM_1_provider', e.target.value)}
                    placeholder="Jio"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">eSIM 2 *</label>
                  <Input
                    value={singleDevice.eSIM_2}
                    onChange={(e) => handleSingleDeviceChange('eSIM_2', e.target.value)}
                    placeholder="EID100001-B1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">eSIM 2 Provider *</label>
                  <Input
                    value={singleDevice.eSIM_2_provider}
                    onChange={(e) => handleSingleDeviceChange('eSIM_2_provider', e.target.value)}
                    placeholder="Airtel"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSingleUpload}
                  disabled={isUploading}
                  className="bg-blue-600"
                >
                  {isUploading ? 'Uploading...' : 'Add Device'}
                </Button>
                <Button variant="outline" onClick={() => navigate('/manufacturer/inventory')}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Upload */}
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Upload via CSV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Upload a CSV file with device information
                  </p>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <Button variant="outline" className="gap-2" disabled={isUploading} asChild>
                      <span className="cursor-pointer">
                        <Upload className="h-4 w-4" />
                        Choose CSV File
                      </span>
                    </Button>
                  </label>
                  {csvFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {csvFile.name}
                    </p>
                  )}
                </div>
              </div>

              {showPreview && parsedDevices.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Preview ({parsedDevices.length} devices)
                    </h3>
                    <Button
                      onClick={handleBulkUpload}
                      disabled={isUploading}
                      className="bg-green-600"
                    >
                      {isUploading ? 'Uploading...' : `Upload ${parsedDevices.length} Devices`}
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left">IMEI</th>
                            <th className="px-4 py-2 text-left">Serial Number</th>
                            <th className="px-4 py-2 text-left">Model Code</th>
                            <th className="px-4 py-2 text-left">ICCID</th>
                            <th className="px-4 py-2 text-left">eSIM 1</th>
                            <th className="px-4 py-2 text-left">eSIM 2</th>
                            <th className="px-4 py-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedDevices.map((device, index) => (
                            <tr key={index} className="border-t hover:bg-gray-50">
                              <td className="px-4 py-2">{device.imei}</td>
                              <td className="px-4 py-2">{device.serial_number}</td>
                              <td className="px-4 py-2">{device.VLTD_model_code}</td>
                              <td className="px-4 py-2">{device.ICCID}</td>
                              <td className="px-4 py-2">{device.eSIM_1}</td>
                              <td className="px-4 py-2">{device.eSIM_2}</td>
                              <td className="px-4 py-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDevice(index)}
                                  disabled={isUploading}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => navigate('/manufacturer/inventory')}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
