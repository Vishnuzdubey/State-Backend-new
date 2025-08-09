import { useState } from 'react';
import { 
  Download,
  FileText,
  Search,
  MapPin,
  Calendar,
  Smartphone,
  Wifi,
  Shield,
  ArrowLeft,
  Power,
  Map,
  Route
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable';

export function DeviceInventory() {
  const [fromDate, setFromDate] = useState('2025-02-10');
  const [uptoDate, setUptoDate] = useState('2025-08-09');
  const [searchImei, setSearchImei] = useState('');

  // Mock data based on your provided example
  const devices = [
    {
      id: 1,
      vehicleRegNumber: 'MA3JMTB1SSGD33219',
      vltdModelCode: 'ECO VTS',
      imeiNumber: '866334072138387',
      esimProvider: 'Sensorise',
      validUpto: '08-08-2027',
      lastLocation: 'Veer Shahid Abdul Hamid Road, BL Sait Pan Road, Wadala East, Mumbai, Maharashtra. 50 m from SBM Toilet, Pin-400037 (India)',
      deviceUploadDate: '08-08-2025',
      deviceActivationDate: '08-08-2025',
      certificate: 'Available'
    },
    // Add more mock data
    {
      id: 2,
      vehicleRegNumber: 'MH12AB1234',
      vltdModelCode: 'PRO VTS',
      imeiNumber: '866334072138388',
      esimProvider: 'Airtel',
      validUpto: '15-09-2027',
      lastLocation: 'Andheri West, Mumbai, Maharashtra. Near Metro Station, Pin-400058 (India)',
      deviceUploadDate: '07-08-2025',
      deviceActivationDate: '07-08-2025',
      certificate: 'Available'
    },
    {
      id: 3,
      vehicleRegNumber: 'DL8CAB9876',
      vltdModelCode: 'SMART VTS',
      imeiNumber: '866334072138389',
      esimProvider: 'Jio',
      validUpto: '22-10-2027',
      lastLocation: 'Connaught Place, New Delhi, Delhi. Near Central Park, Pin-110001 (India)',
      deviceUploadDate: '06-08-2025',
      deviceActivationDate: '06-08-2025',
      certificate: 'Available'
    }
  ];

  const totalCount = 4395;

  const deviceColumns = [
    { 
      key: 'vehicleRegNumber', 
      header: 'Vehicle Registration Number',
      render: (value: string) => (
        <div className="font-mono text-sm font-medium">{value}</div>
      )
    },
    { 
      key: 'vltdModelCode', 
      header: 'VLTD Model Code',
      render: (value: string) => (
        <Badge variant="outline" className="font-medium">{value}</Badge>
      )
    },
    { 
      key: 'imeiNumber', 
      header: 'IMEI Number',
      render: (value: string) => (
        <div className="font-mono text-sm">{value}</div>
      )
    },
    { 
      key: 'esimProvider', 
      header: 'ESIM Provider',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-blue-500" />
          <span>{value}</span>
        </div>
      )
    },
    { 
      key: 'validUpto', 
      header: 'Valid Upto',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-green-500" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    { 
      key: 'lastLocation', 
      header: 'Last Location',
      render: (value: string) => (
        <div className="max-w-xs">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600 line-clamp-2">{value}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'deviceUploadDate', 
      header: 'Device Upload Date',
      render: (value: string) => (
        <div className="text-sm">{value}</div>
      )
    },
    { 
      key: 'deviceActivationDate', 
      header: 'Device Activation Date',
      render: (value: string) => (
        <div className="text-sm">{value}</div>
      )
    },
    { 
      key: 'certificate', 
      header: 'Certificate',
      render: (value: string) => (
        <Button variant="outline" size="sm" className="text-xs">
          <Shield className="h-3 w-3 mr-1" />
          {value}
        </Button>
      )
    }
  ];

  const deviceActions = [
    { 
      label: 'View Location', 
      onClick: (row: any) => console.log('View location for', row.imeiNumber),
      icon: MapPin
    },
    { 
      label: 'Deactivate', 
      onClick: (row: any) => console.log('Deactivate device', row.imeiNumber),
      variant: 'destructive' as const,
      icon: Power
    },
    { 
      label: 'View Certificate', 
      onClick: (row: any) => console.log('View certificate for', row.imeiNumber),
      icon: Shield
    }
  ];

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    console.log(`Exporting as ${format.toUpperCase()}`);
    // Implement export functionality
  };

  const filteredDevices = devices.filter(device => 
    searchImei === '' || device.imeiNumber.includes(searchImei)
  );

  return (
    <div className="space-y-6 w-full">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Device Inventory List</h1>
            <p className="text-gray-600">Manufacturer Backend - All Devices</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Power className="h-4 w-4 mr-2" />
            Deactivate Device
          </Button>
          <Button variant="outline" size="sm">
            <Map className="h-4 w-4 mr-2" />
            Live Map
          </Button>
          <Button variant="outline" size="sm">
            <Route className="h-4 w-4 mr-2" />
            Trails
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Smartphone className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Active Devices</p>
                <p className="text-2xl font-bold">{totalCount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wifi className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Connected</p>
                <p className="text-2xl font-bold">{(totalCount * 0.95).toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold">89</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Certified</p>
                <p className="text-2xl font-bold">{totalCount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date:</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Upto Date:</label>
              <Input
                type="date"
                value={uptoDate}
                onChange={(e) => setUptoDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search By IMEI:</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter IMEI number"
                  value={searchImei}
                  onChange={(e) => setSearchImei(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary and Export */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold">
            Total Count: <span className="text-blue-600">{totalCount.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExport('csv')}
          >
            <FileText className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExport('excel')}
          >
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExport('pdf')}
          >
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Device Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={filteredDevices}
            columns={deviceColumns}
            actions={deviceActions}
            searchable={true}
            pagination={true}
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  );
}
