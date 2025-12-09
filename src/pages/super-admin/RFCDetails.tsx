
import { useState, useEffect } from 'react';
import { ArrowLeft, Smartphone, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable';
import { useNavigate, useParams } from 'react-router-dom';
import { superAdminApi, type RFCData } from '@/api/superAdmin';
import { manufacturerApi } from '@/api/manufacturer';

export function RFCDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [rfcData, setRfcData] = useState<RFCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRFCDetails();
    }
  }, [id]);

  const fetchRFCDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Try to get from list endpoint since individual endpoint may not exist
      const response = await superAdminApi.getRFCs({ page: 1, limit: 100, search: '' });
      const rfc = response.rfcs.find(r => r.id === id);

      if (!rfc) {
        throw new Error('RFC not found');
      }

      setRfcData(rfc);

      // Fetch RFC devices
      await fetchRFCDevices();
    } catch (err) {
      console.error('Failed to fetch RFC details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load RFC details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRFCDevices = async () => {
    if (!id) return;

    try {
      setLoadingDevices(true);
      // Try with manufacturerApi first (uses MANUFACTURER token), fallback to superAdminApi
      let response;
      try {
        response = await manufacturerApi.getInventoryByQuery({
          rfcId: id,
          page: 1,
          limit: 100
        });
      } catch (err: any) {
        console.log('⚠️ ManufacturerAPI failed, trying SuperAdminAPI:', err.message);
        response = await superAdminApi.getInventoryByQuery({
          rfcId: id,
          page: 1,
          limit: 100
        });
      }
      setDevices(response.data || []);
      console.log('📱 Loaded RFC devices:', response.data);
    } catch (err: any) {
      console.error('Failed to fetch RFC devices:', err);
    } finally {
      setLoadingDevices(false);
    }
  };  // Mock user details
  // const userDetails = [
  //   {
  //     id: 1,
  //     fullName: 'Rutvi Gandhi',
  //     username: 'rfclogiclab',
  //     designation: 'Admin',
  //     emailId: 'crmlogiclab@gmail.com',
  //     contactNo: '9004754617'
  //   }
  // ];

  // Mock device details (empty for now)
  const deviceDetails: string | any[] = [];
  //   {
  //     key: 'fullName',
  //     header: 'Full Name',
  //     render: (value: string) => (
  //       <div className="font-medium">{value}</div>
  //     )
  //   },
  //   {
  //     key: 'username',
  //     header: 'Username',
  //     render: (value: string) => (
  //       <div className="font-mono text-sm">{value}</div>
  //     )
  //   },
  //   {
  //     key: 'designation',
  //     header: 'Designation',
  //     render: (value: string) => (
  //       <Badge variant="outline">{value}</Badge>
  //     )
  //   },
  //   {
  //     key: 'emailId',
  //     header: 'Email Id',
  //     render: (value: string) => (
  //       <div className="text-blue-600">{value}</div>
  //     )
  //   },
  //   {
  //     key: 'contactNo',
  //     header: 'Contact No.',
  //     render: (value: string) => (
  //       <div className="font-mono">{value}</div>
  //     )
  //   }
  // ];

  // const userActions = [
  //   {
  //     label: 'Edit',
  //     onClick: (row: any) => console.log('Edit user', row),
  //     icon: Edit
  //   }
  // ];

  const deviceColumns = [
    { key: 'deviceId', header: 'Device ID' },
    { key: 'imei', header: 'IMEI Number' },
    { key: 'status', header: 'Status' },
    { key: 'lastSeen', header: 'Last Seen' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading RFC details...</p>
        </div>
      </div>
    );
  }

  if (error || !rfcData) {
    return (
      <div className="space-y-6 w-full">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/super-admin/rfcs')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'RFC not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/super-admin/rfcs')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>RFCs</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">RFC Details</span>
          </div>
        </div>

        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate('/super-admin/rfcs/add')}
        >
          Add RFC
        </Button>
      </div>

      {/* RFC Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            RFC Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">ID</label>
                <div className="mt-1 text-sm font-mono text-gray-900">
                  {rfcData.id}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <div className="mt-1 text-lg font-medium text-gray-900">
                  {rfcData.name || 'N/A'}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <div className="mt-1 text-blue-600">
                  {rfcData.email}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Created At</label>
                <div className="mt-1 text-gray-900">
                  {new Date(rfcData.createdAt).toLocaleString()}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Password</label>
                <div className="mt-1 text-gray-900 font-mono">
                  {rfcData.password ? '••••••' : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RFC User Details */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            RFC User Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userDetails.length > 0 ? (
            <DataTable
              data={userDetails}
              columns={userColumns}
              actions={userActions}
              searchable={false}
              pagination={false}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No user details available
            </div>
          )}
        </CardContent>
      </Card> */}

      {/* RFC Device Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            RFC Device Details ({devices.length})
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            All devices assigned to this RFC
          </p>
        </CardHeader>
        <CardContent>
          {loadingDevices ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p>Loading devices...</p>
            </div>
          ) : devices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">IMEI</th>
                    <th className="px-4 py-2 text-left font-semibold">Serial</th>
                    <th className="px-4 py-2 text-left font-semibold">Model</th>
                    <th className="px-4 py-2 text-left font-semibold">Certificate</th>
                    <th className="px-4 py-2 text-left font-semibold">Manufacturer</th>
                    <th className="px-4 py-2 text-left font-semibold">Distributor</th>
                    <th className="px-4 py-2 text-left font-semibold">Status</th>
                    <th className="px-4 py-2 text-left font-semibold">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {devices.map((device) => (
                    <tr key={device.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <button
                          onClick={() => navigate(`/manufacturer/inventory/${device.id}`)}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          {device.imei}
                        </button>
                      </td>
                      <td className="px-4 py-2 text-sm">{device.serial_number || '-'}</td>
                      <td className="px-4 py-2 text-sm">{device.VLTD_model_code || '-'}</td>
                      <td className="px-4 py-2 text-sm">{device.certificate_number || '-'}</td>
                      <td className="px-4 py-2">
                        {device.manufacturer_entity_id ? (
                          <button
                            onClick={() => navigate(`/super-admin/manufacturers/${device.manufacturer_entity_id}`)}
                            className="text-orange-600 hover:text-orange-800 hover:underline font-medium"
                          >
                            {device.manufacturer_entity?.name || device.manufacturer_entity_id}
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {device.distributor_entity_id ? (
                          <button
                            onClick={() => navigate(`/super-admin/distributors/${device.distributor_entity_id}`)}
                            className="text-green-600 hover:text-green-800 hover:underline font-medium"
                          >
                            {device.distributor_entity?.name || device.distributor_entity_id}
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <Badge className={device.rfc_entity_id ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {device.rfc_entity_id ? 'Assigned' : 'Not Assigned'}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {new Date(device.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No devices found</p>
              <p className="text-sm">No devices are currently assigned to this RFC</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}