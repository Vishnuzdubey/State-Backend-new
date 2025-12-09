import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Download, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { manufacturerApi, type InventoryItem } from '@/api';
import { superAdminApi } from '@/api/superAdmin';

export function MDeviceDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [device, setDevice] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [distributorName, setDistributorName] = useState<string | null>(null);
  const [loadingNames, setLoadingNames] = useState(false);

  useEffect(() => {
    // First try to get device from location state
    const deviceFromState = location.state?.device;
    if (deviceFromState && deviceFromState.id === id) {
      setDevice(deviceFromState);
      setLoading(false);
      // Fetch names for the device
      if (deviceFromState.manufacturer_entity_id || deviceFromState.distributor_entity_id) {
        fetchEntityNames(deviceFromState);
      }
      return;
    }

    // Otherwise fetch it
    fetchDeviceDetails();
  }, [id]);

  const fetchEntityNames = async (dev: InventoryItem) => {
    try {
      setLoadingNames(true);

      // Fetch distributor name if ID exists
      if (dev.distributor_entity_id) {
        try {
          const distResponse = await superAdminApi.getDistributors({ page: 1, limit: 100, search: '' });
          const dist = distResponse.distributors.find((d: any) => d.id === dev.distributor_entity_id);
          if (dist) setDistributorName(dist.name);
        } catch (err) {
          console.error('Failed to fetch distributor:', err);
        }
      }
    } finally {
      setLoadingNames(false);
    }
  }; const fetchDeviceDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await manufacturerApi.getInventory();
      const foundDevice = response.data.find((d: InventoryItem) => d.id === id);

      if (!foundDevice) {
        throw new Error('Device not found');
      }

      setDevice(foundDevice);
      // Fetch names for the device
      await fetchEntityNames(foundDevice);
    } catch (err: any) {
      setError(err.message || 'Failed to load device details');
      console.error('Error fetching device details:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadDeviceInfo = () => {
    if (!device) return;

    const content = `
Device Information Report
Generated: ${new Date().toLocaleString()}

=== Basic Information ===
Device ID: ${device.id}
IMEI: ${device.imei}
Serial Number: ${device.serial_number}
Model Code: ${device.VLTD_model_code}
Certificate Number: ${device.certificate_number || 'N/A'}

=== SIM Information ===
ICCID: ${device.ICCID}

eSIM 1:
  - EID: ${device.eSIM_1}
  - Provider: ${device.eSIM_1_provider || 'N/A'}

eSIM 2:
  - EID: ${device.eSIM_2 || 'N/A'}
  - Provider: ${device.eSIM_2_provider || 'N/A'}

=== Assignment Information ===
Manufacturer: ${device.manufacturer || 'N/A'}
Distributor: ${device.distributor || 'N/A'}
RFC: ${device.rfc_entity_id || 'N/A'}

=== Metadata ===
Created: ${new Date(device.createdAt).toLocaleString()}
Manufacturer Entity ID: ${device.manufacturer_entity_id || 'N/A'}
Distributor Entity ID: ${device.distributor_entity_id || 'N/A'}
RFC Entity ID: ${device.rfc_entity_id || 'N/A'}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `device-${device.imei}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading device details...</p>
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="space-y-6 p-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/manufacturer/inventory')}
          className="text-blue-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inventory
        </Button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 text-lg">{error || 'Device not found'}</p>
        </div>
      </div>
    );
  }

  const DetailField = ({ label, value, copyable = false }: { label: string; value: string; copyable?: boolean }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex-1 p-3 bg-gray-50 border rounded font-mono text-sm text-gray-900">
          {value || 'N/A'}
        </div>
        {copyable && value && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => copyToClipboard(value, label)}
            className="h-10 w-10 p-0"
          >
            {copiedField === label ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/manufacturer/inventory')}
            className="text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Device Details</h1>
            <p className="text-gray-600">Complete device information and specifications</p>
          </div>
        </div>
        <Button
          onClick={downloadDeviceInfo}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Info
        </Button>
      </div>

      {/* Device ID and Quick Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Device ID</p>
              <p className="text-lg font-mono font-semibold text-gray-900 break-all">{device.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(device.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge className="bg-green-100 text-green-800 border-green-300 mt-1">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailField label="IMEI" value={device.imei} copyable />
            <DetailField label="Serial Number" value={device.serial_number} copyable />
            <DetailField label="Model Code" value={device.VLTD_model_code} />
            <DetailField label="Certificate Number" value={device.certificate_number || '-'} copyable />
          </div>
        </CardContent>
      </Card>

      {/* SIM Information */}
      <Card>
        <CardHeader>
          <CardTitle>SIM Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">ICCID</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-gray-50 border rounded font-mono text-sm text-gray-900">
                {device.ICCID}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(device.ICCID, 'ICCID')}
                className="h-10 w-10 p-0"
              >
                {copiedField === 'ICCID' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">eSIM 1</h4>
              <DetailField label="EID" value={device.eSIM_1} copyable />
              <DetailField label="Provider" value={device.eSIM_1_provider || '-'} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">eSIM 2</h4>
              <DetailField label="EID" value={device.eSIM_2 || '-'} copyable={!!device.eSIM_2} />
              <DetailField label="Provider" value={device.eSIM_2_provider || '-'} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manufacturer - Just show the ID with link to manufacturer's own dashboard */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Manufacturer</label>
              {device.manufacturer_entity_id ? (
                <button

                  className="w-full p-3 bg-blue-50 border border-blue-300 rounded text-left hover:bg-blue-100 transition flex items-center justify-between group"
                >
                  <div>
                    <p className="text-xs text-blue-700 font-mono break-all">ID: {device.manufacturer_entity_id}</p>
                    {/* <p className="text-xs text-blue-600 mt-1">Click to view manufacturer details</p> */}
                  </div>
                  {/* <ExternalLink className="h-4 w-4 text-blue-600 group-hover:text-blue-800 flex-shrink-0" /> */}
                </button>
              ) : (
                <div className="p-3 bg-gray-50 border rounded font-mono text-sm text-gray-900">
                  Not assigned
                </div>
              )}
            </div>

            {/* Distributor - Navigate to Distributors page to view devices */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Distributor</label>
              {device.distributor_entity_id ? (
                <button
                  onClick={() => navigate(`/manufacturer/distributors`, { state: { viewDistributorId: device.distributor_entity_id } })}
                  className="w-full p-3 bg-green-50 border border-green-300 rounded text-left hover:bg-green-100 transition flex items-center justify-between group"
                >
                  <div>
                    <p className="text-sm font-semibold text-green-900">
                      {loadingNames ? 'Loading...' : (distributorName || device.distributor_entity_id)}
                    </p>
                    <p className="text-xs text-green-700 font-mono">{device.distributor_entity_id}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-green-600 group-hover:text-green-800" />
                </button>
              ) : (
                <div className="p-3 bg-gray-50 border rounded font-mono text-sm text-gray-900">
                  Not assigned
                </div>
              )}
            </div>

            {/* RFC - Navigate to RFCs page to view devices */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">RFC</label>
              {device.rfc_entity_id ? (
                <button
                  onClick={() => navigate(`/manufacturer/rfcs`, { state: { viewRFCId: device.rfc_entity_id } })}
                  className="w-full p-3 bg-purple-50 border border-purple-300 rounded text-left hover:bg-purple-100 transition flex items-center justify-between group"
                >
                  <div>
                    <p className="text-sm font-semibold text-purple-900 font-mono break-all">{device.rfc_entity_id}</p>
                    <p className="text-xs text-purple-600 mt-1">Click to view RFC devices</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-purple-600 group-hover:text-purple-800" />
                </button>
              ) : (
                <div className="p-3 bg-gray-50 border rounded font-mono text-sm text-gray-900">
                  Not assigned
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Created At</span>
              <span className="font-mono text-gray-900">
                {new Date(device.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
