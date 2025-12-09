import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Eye, Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { DataTable } from '@/components/common/DataTable';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { superAdminApi, type DistributorData } from '@/api/superAdmin';
import { manufacturerApi, type InventoryItem } from '@/api/manufacturer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function DistributorDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [distributorData, setDistributorData] = useState<DistributorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rfcs, setRfcs] = useState<any[]>([]);
  const [availableRFCs, setAvailableRFCs] = useState<any[]>([]);
  const [loadingRFCs, setLoadingRFCs] = useState(false);
  const [showAssignRFC, setShowAssignRFC] = useState(false);
  const [distributorDevices, setDistributorDevices] = useState<InventoryItem[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [isDevicesDialogOpen, setIsDevicesDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDistributorDetails();
      fetchDistributorRFCs();
      fetchAvailableRFCs();
    }
  }, [id]);

  const fetchDistributorDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Try to get from list endpoint since individual endpoint may not exist
      const response = await superAdminApi.getDistributors({ page: 1, limit: 100, search: '' });
      const distributor = response.distributors.find(d => d.id === id);

      if (!distributor) {
        throw new Error('Distributor not found');
      }

      setDistributorData(distributor);
    } catch (err) {
      console.error('Failed to fetch distributor details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load distributor details');
    } finally {
      setLoading(false);
    }
  };

  const fetchDistributorRFCs = async () => {
    if (!id) return;

    try {
      setLoadingRFCs(true);
      const response = await superAdminApi.getDistributorRFCs(id);
      setRfcs(response.rfcs);
    } catch (err: any) {
      console.error('Failed to fetch distributor RFCs:', err);
    } finally {
      setLoadingRFCs(false);
    }
  };

  const fetchAvailableRFCs = async () => {
    try {
      const response = await superAdminApi.getRFCs({ page: 1, limit: 100, search: '' });
      setAvailableRFCs(response.rfcs);
    } catch (err: any) {
      console.error('Failed to fetch available RFCs:', err);
    }
  };

  const handleAssignRFC = async (rfcId: string) => {
    if (!id) return;

    try {
      setError(null);
      setSuccess(null);
      await superAdminApi.assignRFCToDistributor(id, { rfcId });
      setSuccess('RFC assigned successfully');
      await fetchDistributorRFCs();
    } catch (err: any) {
      setError(err.message || 'Failed to assign RFC');
    }
  };

  const handleRemoveRFC = async (rfcId: string) => {
    if (!id) return;

    try {
      setError(null);
      setSuccess(null);
      await superAdminApi.removeRFCFromDistributor(id, { rfcId });
      setSuccess('RFC removed successfully');
      await fetchDistributorRFCs();
    } catch (err: any) {
      setError(err.message || 'Failed to remove RFC');
    }
  };

  const fetchDistributorDevices = async () => {
    if (!id) return;

    try {
      setLoadingDevices(true);
      // Try with manufacturerApi first (uses MANUFACTURER token), fallback to superAdminApi
      let response;
      try {
        response = await manufacturerApi.getInventoryByQuery({
          page: 1,
          limit: 100,
          search: '',
          distributorId: id,
        });
      } catch (err: any) {
        console.log('⚠️ ManufacturerAPI failed, trying SuperAdminAPI:', err.message);
        response = await superAdminApi.getInventoryByQuery({
          page: 1,
          limit: 100,
          search: '',
          distributorId: id,
        });
      }
      setDistributorDevices(response.data || []);
    } catch (err) {
      console.error('Failed to fetch distributor devices:', err);
      setDistributorDevices([]);
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleViewDistributorDevices = () => {
    setIsDevicesDialogOpen(true);
    fetchDistributorDevices();
  };

  const handleDeviceView = (device: InventoryItem) => {
    navigate('/manufacturer/inventory/' + device.id, { state: { device } });
    setIsDevicesDialogOpen(false);
  };

  // Mock user details
  // const userDetails = [
  //   {
  //     id: 1,
  //     fullName: 'Ankur Garg',
  //     username: 'disbtc',
  //     designation: 'Admin',
  //     emailId: 'bharattradingco1091@gmail.com',
  //     contactNo: '9996031091',
  //     editable: true
  //   },
  //   {
  //     id: 2,
  //     fullName: 'Rutvi Gandhi',
  //     username: 'disbtclogiclab',
  //     designation: 'InventoryManager',
  //     emailId: 'crmbhy5@gmail.com',
  //     contactNo: '9152011465',
  //     editable: false
  //   },
  //   {
  //     id: 3,
  //     fullName: 'Chandresh Matbar Kevat',
  //     username: 'disomabtc',
  //     designation: 'InventoryManager',
  //     emailId: 'omautomobilepuc@gmail.com',
  //     contactNo: '7506191817',
  //     editable: false
  //   },
  //   {
  //     id: 4,
  //     fullName: 'Rajesh auto',
  //     username: 'Disrabtc',
  //     designation: 'InventoryManager',
  //     emailId: 'Rajeshauto123@gmail.com',
  //     contactNo: '2212122122',
  //     editable: false
  //   },
  //   {
  //     id: 5,
  //     fullName: 'Atul Dhumal',
  //     username: 'disrmbtc',
  //     designation: 'InventoryManager',
  //     emailId: 'rajemotorsfinance@gmail.com',
  //     contactNo: 'admin',
  //     editable: false
  //   }
  // ];

  // const userColumns = [
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
  //   },
  //   {
  //     key: 'editable',
  //     header: 'Action',
  //     render: (value: boolean) => (
  //       value ? (
  //         <Button size="sm" variant="outline">
  //           Edit
  //         </Button>
  //       ) : (
  //         <span className="text-gray-500 text-sm">No Editable</span>
  //       )
  //     )
  //   }
  // ];

  // RFC columns and actions
  const rfcColumns = [
    {
      key: 'name',
      header: 'Name',
      render: (value: string) => <span className="font-medium">{value || 'N/A'}</span>
    },
    { key: 'email', header: 'Email' },
    {
      key: 'createdAt',
      header: 'Created Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
  ];

  const rfcActions = [
    {
      label: 'Remove',
      onClick: (row: any) => handleRemoveRFC(row.id),
      variant: 'destructive' as const
    },
    {
      label: 'View',
      onClick: (row: any) => navigate(`/super-admin/rfcs/${row.id}`),
      icon: Eye
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading distributor details...</p>
        </div>
      </div>
    );
  }

  if (error || !distributorData) {
    return (
      <div className="space-y-6 w-full">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/super-admin/distributors')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Distributor not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Status Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/super-admin/distributors')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>All Distributors</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Distributor Details</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate('/super-admin/distributors/add')}
          >
            Add Distributor
          </Button>
        </div>
      </div>

      {/* Distributor Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Distributor Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">ID</label>
                <div className="mt-1 text-sm font-mono text-gray-900">
                  {distributorData.id}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <div className="mt-1 text-lg font-medium text-gray-900">
                  {distributorData.name || 'N/A'}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <div className="mt-1 text-blue-600">
                  {distributorData.email}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Created At</label>
                <div className="mt-1 text-gray-900">
                  {new Date(distributorData.createdAt).toLocaleString()}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Password</label>
                <div className="mt-1 text-gray-900 font-mono">
                  {distributorData.password ? '••••••' : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distributor User Details */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Distributor User Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={userDetails}
            columns={userColumns}
            searchable={false}
            pagination={false}
          />
        </CardContent>
      </Card> */}

      {/* Associated RFCs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Associated RFCs ({rfcs.length})
            </CardTitle>
            <Button
              onClick={() => setShowAssignRFC(!showAssignRFC)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Assign RFC
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* RFC Assignment Panel */}
            {showAssignRFC && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium mb-3">Select RFC to Assign</h4>
                <div className="grid grid-cols-1 gap-2">
                  {availableRFCs
                    .filter(rfc => !rfcs.some(assigned => assigned.id === rfc.id))
                    .map(rfc => (
                      <div key={rfc.id} className="flex items-center justify-between p-3 bg-white border rounded hover:border-blue-500">
                        <div>
                          <p className="font-medium">{rfc.name || 'Unnamed RFC'}</p>
                          <p className="text-sm text-gray-600">{rfc.email}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            handleAssignRFC(rfc.id);
                            setShowAssignRFC(false);
                          }}
                        >
                          Assign
                        </Button>
                      </div>
                    ))}
                  {availableRFCs.filter(rfc => !rfcs.some(assigned => assigned.id === rfc.id)).length === 0 && (
                    <p className="text-center text-gray-500 py-4">All RFCs are already assigned</p>
                  )}
                </div>
              </div>
            )}

            {/* RFC List */}
            {loadingRFCs ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm">Loading RFCs...</p>
              </div>
            ) : rfcs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No RFCs assigned yet</p>
                <p className="text-sm">Use the dropdown above to assign an RFC to this distributor</p>
              </div>
            ) : (
              <DataTable
                data={rfcs}
                columns={rfcColumns}
                actions={rfcActions}
                searchable={false}
                pagination={false}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Distributor Devices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Devices
            </CardTitle>
            <Button
              onClick={handleViewDistributorDevices}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Devices
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Devices Dialog */}
      <Dialog open={isDevicesDialogOpen} onOpenChange={setIsDevicesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Devices for Distributor: {distributorData?.name}
            </DialogTitle>
          </DialogHeader>

          {loadingDevices ? (
            <div className="text-center py-8 text-gray-500">Loading devices...</div>
          ) : distributorDevices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No devices found for this distributor</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">IMEI</th>
                    <th className="px-4 py-2 text-left font-semibold">Serial</th>
                    <th className="px-4 py-2 text-left font-semibold">Model</th>
                    <th className="px-4 py-2 text-left font-semibold">Certificate</th>
                    <th className="px-4 py-2 text-left font-semibold">Manufacturer</th>
                    <th className="px-4 py-2 text-left font-semibold">RFC</th>
                    <th className="px-4 py-2 text-left font-semibold">Status</th>
                    <th className="px-4 py-2 text-left font-semibold">Created Date</th>
                    <th className="px-4 py-2 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {distributorDevices.map(device => (
                    <tr key={device.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-blue-600">
                        <button
                          onClick={() => navigate('/manufacturer/inventory/' + device.id, { state: { device } })}
                          className="hover:underline"
                        >
                          {device.imei}
                        </button>
                      </td>
                      <td className="px-4 py-2 font-mono text-gray-700">{device.serial_number}</td>
                      <td className="px-4 py-2">{device.VLTD_model_code}</td>
                      <td className="px-4 py-2 font-mono text-gray-700">{device.certificate_number}</td>
                      <td className="px-4 py-2">
                        {device.manufacturer_entity_id ? (
                          <button
                            onClick={() => navigate(`/super-admin/manufacturers/${device.manufacturer_entity_id}`)}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            {device.manufacturer_entity_id}
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {device.rfc_entity_id ? (
                          <button
                            onClick={() => navigate(`/super-admin/rfcs/${device.rfc_entity_id}`)}
                            className="text-purple-600 hover:text-purple-800 hover:underline font-medium"
                          >
                            {device.rfc_entity_id}
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {device.rfc_entity_id ? (
                          <Badge className="bg-green-100 text-green-800 border-green-300">Assigned</Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">Not Assigned</Badge>
                        )}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {new Date(device.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/manufacturer/inventory/' + device.id, { state: { device } })}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
