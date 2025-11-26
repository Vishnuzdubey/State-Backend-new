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
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { superAdminApi, type ManufacturerData } from '@/api';

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

  useEffect(() => {
    fetchManufacturerDetails();
    // Check if we should open acknowledge modal
    if (location.state?.action === 'acknowledge') {
      setShowAcknowledgeModal(true);
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

  const handleUpdateStatus = async (newStatus: 'PENDING' | 'ACKNOWLEDGED' | 'APPROVED', pwd?: string) => {
    if (!manufacturer) return;

    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
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

  const distributors = [
    { id: '1', name: 'Metro Distributors Pvt Ltd', code: 'METRO001', city: 'Mumbai' },
    { id: '2', name: 'Global Supply Chain Ltd', code: 'GLOBAL002', city: 'Delhi' },
    { id: '3', name: 'Tech Distribution Services', code: 'TECH003', city: 'Bangalore' }
  ];

  const rfcs = [
    { id: '1', name: 'SmartTrack RFC Solutions', code: 'SMART001', city: 'Gurgaon' },
    { id: '2', name: 'VehicleTech RFC Services', code: 'VEH002', city: 'Noida' },
    { id: '3', name: 'GPS Plus RFC Network', code: 'GPS003', city: 'Faridabad' }
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
        <button className="px-4 py-2 text-sm font-medium border-b-2 border-blue-600 text-blue-600">
          All Details
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
          Account
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
          Distributors
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
          RFCs
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
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
              onClick={() => handleUpdateStatus('APPROVED')}
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

      {/* Associated Distributors and RFCs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distributors */}
        <Card>
          <CardHeader>
            <CardTitle>Associated Distributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {distributors.map((distributor) => (
                <div key={distributor.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{distributor.name}</p>
                    <p className="text-sm text-gray-500">{distributor.code} • {distributor.city}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* RFCs */}
        <Card>
          <CardHeader>
            <CardTitle>Associated RFCs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rfcs.map((rfc) => (
                <div key={rfc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{rfc.name}</p>
                    <p className="text-sm text-gray-500">{rfc.code} • {rfc.city}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
