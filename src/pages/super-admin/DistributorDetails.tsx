import { useState } from 'react';
import { ArrowLeft, Users, Smartphone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable';
import { useNavigate, useParams } from 'react-router-dom';

export function DistributorDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock distributor data based on the ID
  const distributorData = {
    id: id,
    entityCode: 'BTC',
    entityName: 'Bharat Trading Company',
    gstPan: 'N/A',
    location: 'Plot No. 877, In Steel Warehousing Complex, Steel Market Road, On Service Road',
    district: 'Raigad',
    state: 'Maharashtra',
    pinCode: '410218'
  };

  // Mock user details
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

  // Mock device details (empty for now)
  const deviceDetails = [];

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
      render: (value: boolean, row: any) => (
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
            variant="outline"
            onClick={() => navigate('/super-admin/distributors/map')}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Distributor Map
          </Button>
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
                <label className="text-sm font-medium text-gray-600">Entity Code</label>
                <div className="mt-1 text-lg font-semibold text-gray-900">
                  {distributorData.entityCode}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Entity Name</label>
                <div className="mt-1 text-lg font-medium text-gray-900">
                  {distributorData.entityName}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">GST/PAN</label>
                <div className="mt-1 text-gray-900">
                  {distributorData.gstPan}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <div className="mt-1 text-gray-900">
                  {distributorData.location}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">District</label>
                <div className="mt-1 text-gray-900">
                  {distributorData.district}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">State</label>
                <div className="mt-1 text-gray-900">
                  {distributorData.state}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Pin Code</label>
                <div className="mt-1 text-gray-900">
                  {distributorData.pinCode}
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