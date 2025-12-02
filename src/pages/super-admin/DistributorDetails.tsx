import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable';
import { useNavigate, useParams } from 'react-router-dom';
import { superAdminApi, type DistributorData } from '@/api/superAdmin';

export function DistributorDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [distributorData, setDistributorData] = useState<DistributorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchDistributorDetails();
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
  };  // Mock user details
  const userDetails = [
    {
      id: 1,
      fullName: 'Ankur Garg',
      username: 'disbtc',
      designation: 'Admin',
      emailId: 'bharattradingco1091@gmail.com',
      contactNo: '9996031091',
      editable: true
    },
    {
      id: 2,
      fullName: 'Rutvi Gandhi',
      username: 'disbtclogiclab',
      designation: 'InventoryManager',
      emailId: 'crmbhy5@gmail.com',
      contactNo: '9152011465',
      editable: false
    },
    {
      id: 3,
      fullName: 'Chandresh Matbar Kevat',
      username: 'disomabtc',
      designation: 'InventoryManager',
      emailId: 'omautomobilepuc@gmail.com',
      contactNo: '7506191817',
      editable: false
    },
    {
      id: 4,
      fullName: 'Rajesh auto',
      username: 'Disrabtc',
      designation: 'InventoryManager',
      emailId: 'Rajeshauto123@gmail.com',
      contactNo: '2212122122',
      editable: false
    },
    {
      id: 5,
      fullName: 'Atul Dhumal',
      username: 'disrmbtc',
      designation: 'InventoryManager',
      emailId: 'rajemotorsfinance@gmail.com',
      contactNo: 'admin',
      editable: false
    }
  ];

  const userColumns = [
    {
      key: 'fullName',
      header: 'Full Name',
      render: (value: string) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'username',
      header: 'Username',
      render: (value: string) => (
        <div className="font-mono text-sm">{value}</div>
      )
    },
    {
      key: 'designation',
      header: 'Designation',
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'emailId',
      header: 'Email Id',
      render: (value: string) => (
        <div className="text-blue-600">{value}</div>
      )
    },
    {
      key: 'contactNo',
      header: 'Contact No.',
      render: (value: string) => (
        <div className="font-mono">{value}</div>
      )
    },
    {
      key: 'editable',
      header: 'Action',
      render: (value: boolean) => (
        value ? (
          <Button size="sm" variant="outline">
            Edit
          </Button>
        ) : (
          <span className="text-gray-500 text-sm">No Editable</span>
        )
      )
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
      <Card>
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
      </Card>

      {/* Distributor Device Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Distributor Device Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Smartphone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No Device Details</p>
            <p className="text-sm">No devices are currently assigned to this distributor</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
