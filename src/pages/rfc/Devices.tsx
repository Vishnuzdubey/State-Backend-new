import { useState, useEffect } from 'react';
import { Package, Wifi, Shield, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable';
import { rfcApi, type RFCDevice } from '@/api/rfc';

export function RFCDevices() {
  const [devices, setDevices] = useState<RFCDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rfcApi.getInventory();
      setDevices(response.data);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
      setError(err instanceof Error ? err.message : 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'imei',
      header: 'IMEI',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm font-medium">{value}</span>
      ),
    },
    {
      key: 'serial_number',
      header: 'Serial Number',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'VLTD_model_code',
      header: 'Model Code',
      render: (value: string) => (
        <Badge variant="outline" className="font-medium">
          {value}
        </Badge>
      ),
    },
    {
      key: 'eSIM_1_provider',
      header: 'eSIM Providers',
      render: (_value: string, row: RFCDevice) => (
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-blue-500" />
          <span className="text-sm">{row.eSIM_1_provider} / {row.eSIM_2_provider}</span>
        </div>
      ),
    },
    {
      key: 'ICCID',
      header: 'ICCID',
      render: (value: string) => (
        <span className="text-sm font-mono text-gray-600">{value}</span>
      ),
    },
    {
      key: 'certificate_number',
      header: 'Certificate',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-500" />
          <span className="text-sm font-mono">{value}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">
            {new Date(value).toLocaleDateString()}
          </span>
        </div>
      ),
    },
  ];

  const totalDevices = devices.length;
  const withCertificate = devices.filter(d => d.certificate_number).length;
  const uniqueModels = new Set(devices.map(d => d.VLTD_model_code)).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Device Inventory</h1>
        <p className="text-gray-600">
          Manage assigned devices and track inventory ({devices.length} devices)
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Devices</p>
                <p className="text-2xl font-bold">{totalDevices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">With Certificate</p>
                <p className="text-2xl font-bold">{withCertificate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Unique Models</p>
                <p className="text-2xl font-bold">{uniqueModels}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devices Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={devices}
            columns={columns}
            searchable={true}
            pagination={true}
            pageSize={20}
          />
        </CardContent>
      </Card>
    </div>
  );
}