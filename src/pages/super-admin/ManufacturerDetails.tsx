import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  FileText,
  Edit,
  Eye,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable';

export function ManufacturerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock manufacturer data - in real app, fetch based on ID
  const manufacturer = {
    id: '480',
    entityCode: 'WATS8196',
    entityName: 'Watsoo Express Private Limited',
    gstPan: '06AACCW0191M1Z5',
    location: 'Plot No. 872, Udyog Vihar, Phase-V',
    district: 'Gurgaon',
    state: 'Haryana',
    pinCode: '122016',
    status: 'active',
    remainingPoints: 99562,
  };

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
    { name: 'Company GSTN', status: 'Verified', uploadDate: '15-07-2025' },
    { name: 'Company Profile', status: 'Verified', uploadDate: '15-07-2025' },
    { name: 'Company Address Proof', status: 'Verified', uploadDate: '16-07-2025' },
    { name: 'Company PAN', status: 'Verified', uploadDate: '16-07-2025' },
    { name: 'Director ID Proof', status: 'Pending', uploadDate: '17-07-2025' },
    { name: 'Director Address Proof', status: 'Verified', uploadDate: '17-07-2025' },
  ];

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
              <label className="text-sm font-medium text-gray-500">ID</label>
              <p className="text-lg font-semibold">{manufacturer.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Entity Code</label>
              <p className="text-lg font-semibold">{manufacturer.entityCode}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Entity Name</label>
              <p className="text-lg font-semibold">{manufacturer.entityName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">GST/PAN</label>
              <p className="text-lg font-semibold">{manufacturer.gstPan}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Location</label>
              <p className="text-lg">{manufacturer.location}</p>
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
              <p className="text-lg">{manufacturer.pinCode}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Remaining Points</label>
              <p className="text-lg font-semibold text-green-600">{manufacturer.remainingPoints.toLocaleString()}</p>
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
            View Document Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{doc.name}</h4>
                  <Badge 
                    variant={doc.status === 'Verified' ? 'default' : 'secondary'}
                    className={doc.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                  >
                    {doc.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mb-3">Uploaded: {doc.uploadDate}</p>
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Document
                </Button>
              </div>
            ))}
          </div>
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
