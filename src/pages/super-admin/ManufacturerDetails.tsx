import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  FileText,
  Edit,
  Eye,
  Users,
  CheckCircle,
  XCircle,
  ExternalLink,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { superAdminApi, type ManufacturerData } from '@/api';
import { manufacturerApi } from '@/api/manufacturer';

export function ManufacturerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [manufacturer, setManufacturer] = useState<ManufacturerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [distributors, setDistributors] = useState<any[]>([]);
  const [availableDistributors, setAvailableDistributors] = useState<any[]>([]);
  const [loadingDistributors, setLoadingDistributors] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [allRFCs, setAllRFCs] = useState<any[]>([]);
  const [loadingRFCs, setLoadingRFCs] = useState(false);
  const [showAssignDistributor, setShowAssignDistributor] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  useEffect(() => {
    fetchManufacturerDetails();
    // Check if we should open acknowledge modal
    if (location.state?.action === 'acknowledge') {
      setShowAcknowledgeModal(true);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchManufacturerDistributors();
      fetchAvailableDistributors();
    }
  }, [id]);

  const fetchManufacturerDetails = async () => {
    try {
      const response = await superAdminApi.getManufacturers();
      const mfr = response.data.find(m => m.id === id);
      if (mfr) {
        setManufacturer(mfr);
        console.log('📋 Loaded manufacturer details:', mfr);
      } else {
        setError('Manufacturer not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch manufacturer details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchManufacturerDistributors = async () => {
    if (!id) return;

    try {
      setLoadingDistributors(true);
      const response = await superAdminApi.getManufacturerDistributors(id);
      setDistributors(response.data);
    } catch (err: any) {
      console.error('Failed to fetch manufacturer distributors:', err);
    } finally {
      setLoadingDistributors(false);
    }
  };

  const fetchAvailableDistributors = async () => {
    try {
      const response = await superAdminApi.getDistributors({ page: 1, limit: 100, search: '' });
      setAvailableDistributors(response.distributors);
    } catch (err: any) {
      console.error('Failed to fetch available distributors:', err);
    }
  };

  const fetchAllRFCs = async () => {
    if (!distributors.length) return;

    try {
      setLoadingRFCs(true);
      const rfcPromises = distributors.map(async (distributor) => {
        try {
          const response = await superAdminApi.getDistributorRFCs(distributor.id);
          return response.rfcs.map((rfc: any) => ({
            ...rfc,
            distributorName: distributor.name,
            distributorId: distributor.id
          }));
        } catch (err) {
          console.error(`Failed to fetch RFCs for distributor ${distributor.id}:`, err);
          return [];
        }
      });

      const rfcArrays = await Promise.all(rfcPromises);
      const allRFCsList = rfcArrays.flat();
      setAllRFCs(allRFCsList);
    } catch (err: any) {
      console.error('Failed to fetch RFCs:', err);
    } finally {
      setLoadingRFCs(false);
    }
  };

  const fetchManufacturerDevices = async () => {
    if (!id) return;

    try {
      setLoadingDevices(true);
      console.log('🔄 Fetching manufacturer devices with ID:', id);

      // Try with manufacturerApi first (uses MANUFACTURER token), fallback to superAdminApi
      let response;
      try {
        response = await manufacturerApi.getInventoryByQuery({
          manufacturerId: id,
          page: 1,
          limit: 100
        });
      } catch (err: any) {
        console.log('⚠️ ManufacturerAPI failed, trying SuperAdminAPI:', err.message);
        response = await superAdminApi.getInventoryByQuery({
          manufacturerId: id,
          page: 1,
          limit: 100
        });
      }

      console.log('✅ Response received:', response);
      setDevices(response.data || []);
      console.log('📱 Loaded manufacturer devices:', response.data);
    } catch (err: any) {
      console.error('❌ Failed to fetch manufacturer devices:', err);
      console.error('Error details:', err.message);
      setError(`Failed to load devices: ${err.message}`);
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleAssignDistributor = async (distributorId: string) => {
    if (!id) return;

    try {
      setError(null);
      await superAdminApi.assignDistributorToManufacturer(id, { distributorId });
      setSuccess('Distributor assigned successfully');
      await fetchManufacturerDistributors();
    } catch (err: any) {
      setError(err.message || 'Failed to assign distributor');
    }
  };

  const handleRemoveDistributor = async (distributorId: string) => {
    if (!id) return;

    try {
      setError(null);
      await superAdminApi.removeDistributorFromManufacturer(id, { distributorId });
      setSuccess('Distributor removed successfully');
      await fetchManufacturerDistributors();
    } catch (err: any) {
      setError(err.message || 'Failed to remove distributor');
    }
  };

  const handleUpdateStatus = async (newStatus: 'PENDING' | 'ACKNOWLEDGED' | 'APPROVED', pwd: string) => {
    if (!manufacturer) return;

    // Validate password
    if (!pwd || pwd.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🔄 Updating manufacturer status...');
      console.log('Manufacturer ID:', manufacturer.id);
      console.log('New Status:', newStatus);
      console.log('Password length:', pwd.length);

      await superAdminApi.updateManufacturerStatus(manufacturer.id, {
        status: newStatus,
        password: pwd,
      });

      setSuccess(`Manufacturer ${newStatus.toLowerCase()} successfully!`);
      setShowAcknowledgeModal(false);
      setPassword('');

      // Refresh data
      await fetchManufacturerDetails();
    } catch (err: any) {
      console.error('❌ Failed to update manufacturer status:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        error: err,
      });
      setError(err.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading manufacturer details...</div>
      </div>
    );
  }

  if (!manufacturer) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/super-admin/manufacturers')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Manufacturers
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Manufacturer not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const userDetails = [
    {
      id: '1',
      fullName: 'Vishal Pandey',
      userName: 'vltd_watsoo',
      designation: 'Admin',
      emailId: 'vltd@watsoo.com',
      contactNo: '8448835133'
    },
    {
      id: '2',
      fullName: 'Rajesh Kumar',
      userName: 'rajesh_watsoo',
      designation: 'Manager',
      emailId: 'rajesh@watsoo.com',
      contactNo: '9876543210'
    },
    {
      id: '3',
      fullName: 'Priya Sharma',
      userName: 'priya_watsoo',
      designation: 'Operator',
      emailId: 'priya@watsoo.com',
      contactNo: '8765432109'
    }
  ];

  const documents = [
    { name: 'GST Document', url: manufacturer.gst_doc, status: manufacturer.gst_doc ? 'Uploaded' : 'Pending' },
    { name: 'Balance Sheet', url: manufacturer.balance_sheet_doc, status: manufacturer.balance_sheet_doc ? 'Uploaded' : 'Pending' },
    { name: 'Address Proof', url: manufacturer.address_proof_doc, status: manufacturer.address_proof_doc ? 'Uploaded' : 'Pending' },
    { name: 'PAN Document', url: manufacturer.pan_doc, status: manufacturer.pan_doc ? 'Uploaded' : 'Pending' },
    { name: 'User PAN', url: manufacturer.user_pan_doc, status: manufacturer.user_pan_doc ? 'Uploaded' : 'Pending' },
    { name: 'User Address Proof', url: manufacturer.user_address_proof_doc, status: manufacturer.user_address_proof_doc ? 'Uploaded' : 'Pending' },
  ];

  const allDocumentsUploaded = documents.every(doc => doc.status === 'Uploaded');
  const canApprove = allDocumentsUploaded && manufacturer.status === 'ACKNOWLEDGED';

  const userColumns = [
    { key: 'fullName', header: 'Full Name', sortable: true },
    { key: 'userName', header: 'User Name', sortable: true },
    { key: 'designation', header: 'Designation' },
    { key: 'emailId', header: 'Email Id' },
    { key: 'contactNo', header: 'Contact No' },
  ];

  const userActions = [
    {
      label: 'Edit',
      onClick: (row: any) => console.log('Edit user', row),
      icon: Edit
    },
    {
      label: 'View',
      onClick: (row: any) => console.log('View user', row),
      icon: Eye
    }
  ];

  const distributorColumns = [
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

  const distributorActions = [
    {
      label: 'Remove',
      onClick: (row: any) => handleRemoveDistributor(row.id),
      variant: 'destructive' as const
    },
    {
      label: 'View Details',
      onClick: (row: any) => navigate(`/super-admin/distributors/${row.id}`),
      icon: Eye
    }
  ];

  const rfcColumns = [
    {
      key: 'name',
      header: 'RFC Name',
      render: (value: string) => <span className="font-medium">{value || 'N/A'}</span>
    },
    { key: 'email', header: 'Email' },
    {
      key: 'distributorName',
      header: 'Distributor',
      render: (value: string) => <span className="text-blue-600">{value}</span>
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
  ];

  const rfcActions = [
    {
      label: 'View RFC',
      onClick: (row: any) => navigate(`/super-admin/rfcs/${row.id}`),
      icon: Eye
    },
    {
      label: 'View Distributor',
      onClick: (row: any) => navigate(`/super-admin/distributors/${row.distributorId}`),
      icon: Building2
    }
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/super-admin/manufacturers')}
            className="text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Details</h1>
            <p className="text-gray-600">Complete manufacturer information</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            All Manufacturers
          </Button>
          <Button variant="outline" size="sm">
            Empanelment
          </Button>
          <Button variant="outline" size="sm">
            Add Manufacturers
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('details')}
        >
          All Details
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'account' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('account')}
        >
          Account
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'distributors' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => {
            setActiveTab('distributors');
            if (distributors.length === 0) fetchManufacturerDistributors();
          }}
        >
          Distributors
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'rfcs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => {
            setActiveTab('rfcs');
            fetchAllRFCs();
          }}
        >
          RFCs
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'devices' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => {
            setActiveTab('devices');
            if (devices.length === 0) fetchManufacturerDevices();
          }}
        >
          Devices
        </button>
      </div>

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

      {/* All Details Tab */}
      {activeTab === 'details' && (
        <>
          {/* Status and Actions */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Current Status:</span>
              <Badge
                className={
                  manufacturer.status === 'APPROVED' ? 'bg-green-100 text-green-800 border-green-300' :
                    manufacturer.status === 'ACKNOWLEDGED' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      'bg-yellow-100 text-yellow-800 border-yellow-300'
                }
              >
                {manufacturer.status}
              </Badge>
              <span className="text-sm font-medium">Documents:</span>
              <Badge className={allDocumentsUploaded ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                {allDocumentsUploaded ? 'All Uploaded' : `${documents.filter(d => d.status === 'Uploaded').length}/${documents.length} Uploaded`}
              </Badge>
            </div>
            <div className="flex gap-2">
              {manufacturer.status === 'PENDING' && (
                <Button
                  onClick={() => setShowAcknowledgeModal(true)}
                  className="bg-blue-600"
                  disabled={isUpdating}
                >
                  Acknowledge & Set Password
                </Button>
              )}
              {canApprove && (
                <Button
                  onClick={() => {
                    // Use existing password or prompt for it
                    const pwd = manufacturer.password || prompt('Enter password for approval (min 6 characters):');
                    if (pwd && pwd.length >= 6) {
                      handleUpdateStatus('APPROVED', pwd);
                    } else {
                      setError('Valid password required for approval');
                    }
                  }}
                  className="bg-green-600"
                  disabled={isUpdating}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Manufacturer
                </Button>
              )}
            </div>
          </div>

          {/* Acknowledge Modal */}
          {showAcknowledgeModal && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle>Acknowledge Manufacturer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">
                  Set a password for this manufacturer. They will use this password to login and upload documents.
                </p>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password for manufacturer"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleUpdateStatus('ACKNOWLEDGED', password)}
                    disabled={!password || isUpdating}
                    className="bg-blue-600"
                  >
                    {isUpdating ? 'Acknowledging...' : 'Acknowledge'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAcknowledgeModal(false);
                      setPassword('');
                    }}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manufacturer Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Manufacturer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Entity Name</label>
                  <p className="text-lg font-semibold">{manufacturer.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">GST Number</label>
                  <p className="text-lg font-semibold">{manufacturer.gst}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">PAN Number</label>
                  <p className="text-lg font-semibold">{manufacturer.pan}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Person</label>
                  <p className="text-lg">{manufacturer.fullname_user}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg">{manufacturer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-lg">{manufacturer.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-lg">{manufacturer.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">District</label>
                  <p className="text-lg">{manufacturer.district}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">State</label>
                  <p className="text-lg">{manufacturer.state}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Pin Code</label>
                  <p className="text-lg">{manufacturer.pincode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-lg">{new Date(manufacturer.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manufacturer User Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Manufacturer User Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                data={userDetails}
                columns={userColumns}
                actions={userActions}
                searchable={false}
                pagination={false}
              />
            </CardContent>
          </Card>

          {/* Document Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Document Details
                {allDocumentsUploaded && (
                  <Badge className="ml-2 bg-green-100 text-green-800">All Documents Uploaded</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{doc.name}</h4>
                      <Badge
                        variant="outline"
                        className={doc.status === 'Uploaded' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-800 border-gray-300'}
                      >
                        {doc.status}
                      </Badge>
                    </div>
                    {doc.url ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => window.open(doc.url!, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Document
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full mt-3" disabled>
                        <XCircle className="h-4 w-4 mr-2" />
                        Not Uploaded
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {!allDocumentsUploaded && manufacturer.status === 'ACKNOWLEDGED' && (
                <Alert className="mt-4 bg-orange-50 border-orange-200">
                  <AlertDescription className="text-orange-800">
                    Manufacturer needs to upload all documents before approval can be granted.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

        </>
      )}

      {/* Distributors Tab */}
      {activeTab === 'distributors' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Associated Distributors ({distributors.length})</CardTitle>
              <Button
                onClick={() => setShowAssignDistributor(!showAssignDistributor)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Assign Distributor
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAssignDistributor && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium mb-3">Select Distributor to Assign</h4>
                <div className="grid grid-cols-1 gap-2">
                  {availableDistributors
                    .filter(d => !distributors.find(ad => ad.id === d.id))
                    .map(d => (
                      <div key={d.id} className="flex items-center justify-between p-3 bg-white border rounded hover:border-blue-500">
                        <div>
                          <p className="font-medium">{d.name || 'Unnamed'}</p>
                          <p className="text-sm text-gray-600">{d.email}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            handleAssignDistributor(d.id);
                            setShowAssignDistributor(false);
                          }}
                        >
                          Assign
                        </Button>
                      </div>
                    ))}
                  {availableDistributors.filter(d => !distributors.find(ad => ad.id === d.id)).length === 0 && (
                    <p className="text-center text-gray-500 py-4">All distributors are already assigned</p>
                  )}
                </div>
              </div>
            )}

            {loadingDistributors ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>Loading distributors...</p>
              </div>
            ) : distributors.length > 0 ? (
              <DataTable
                data={distributors}
                columns={distributorColumns}
                actions={distributorActions}
                searchable={false}
                pagination={false}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No distributors assigned yet</p>
                <p className="text-sm">Click "Assign Distributor" to add one</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* RFCs Tab */}
      {activeTab === 'rfcs' && (
        <Card>
          <CardHeader>
            <CardTitle>All RFCs from Distributors ({allRFCs.length})</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Showing all RFCs from all distributors assigned to this manufacturer
            </p>
          </CardHeader>
          <CardContent>
            {loadingRFCs ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>Loading RFCs...</p>
              </div>
            ) : allRFCs.length > 0 ? (
              <DataTable
                data={allRFCs}
                columns={rfcColumns}
                actions={rfcActions}
                searchable={true}
                pagination={true}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No RFCs found</p>
                <p className="text-sm">
                  {distributors.length === 0
                    ? 'No distributors assigned to this manufacturer yet'
                    : 'None of the assigned distributors have RFCs'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <p>Account details coming soon...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Devices Tab */}
      {activeTab === 'devices' && (
        <Card>
          <CardHeader>
            <CardTitle>Manufacturer Devices ({devices.length})</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              All devices manufactured by {manufacturer.name}
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
                      <th className="px-4 py-2 text-left font-semibold">Distributor</th>
                      <th className="px-4 py-2 text-left font-semibold">RFC</th>
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
                          {device.rfc_entity_id ? (
                            <button
                              onClick={() => navigate(`/super-admin/rfcs/${device.rfc_entity_id}`)}
                              className="text-purple-600 hover:text-purple-800 hover:underline font-medium"
                            >
                              {device.rfc_entity?.name || device.rfc_entity_id}
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
                <p className="text-sm">This manufacturer has not created any devices yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
