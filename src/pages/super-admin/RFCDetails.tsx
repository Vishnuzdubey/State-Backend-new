import { useState } from 'react';
import { ArrowLeft, Edit, Eye, Users, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable';
import { useNavigate, useParams } from 'react-router-dom';

export function RFCDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock RFC data based on the ID
  const rfcData = {
    id: id,
    entityCode: 'RFCLOGIC',
    entityName: 'Logic Labs Infotronics Limited',
    gstPan: 'N/A',
    location: '002, Shree ji Krupa Bldg, Cross Garden Rd, behind Dena Bank, Bhayandar',
    district: 'Thane',
    state: 'Maharashtra',
    pinCode: '401101'
  };

  // Mock user details
  const userDetails = [
    {
      id: 1,
      fullName: 'Rutvi Gandhi',
      username: 'rfclogiclab',
      designation: 'Admin',
      emailId: 'crmlogiclab@gmail.com',
      contactNo: '9004754617'
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
    }
  ];

  const userActions = [
    { 
      label: 'Edit', 
      onClick: (row: any) => console.log('Edit user', row),
      icon: Edit
    }
  ];

  const deviceColumns = [
    { key: 'deviceId', header: 'Device ID' },
    { key: 'imei', header: 'IMEI Number' },
    { key: 'status', header: 'Status' },
    { key: 'lastSeen', header: 'Last Seen' }
  ];

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
                <label className="text-sm font-medium text-gray-600">Entity Code</label>
                <div className="mt-1 text-lg font-semibold text-gray-900">
                  {rfcData.entityCode}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Entity Name</label>
                <div className="mt-1 text-lg font-medium text-gray-900">
                  {rfcData.entityName}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">GST/PAN</label>
                <div className="mt-1 text-gray-900">
                  {rfcData.gstPan}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <div className="mt-1 text-gray-900">
                  {rfcData.location}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">District</label>
                <div className="mt-1 text-gray-900">
                  {rfcData.district}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">State</label>
                <div className="mt-1 text-gray-900">
                  {rfcData.state}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Pin Code</label>
                <div className="mt-1 text-gray-900">
                  {rfcData.pinCode}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RFC User Details */}
      <Card>
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
      </Card>

      {/* RFC Device Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            RFC Device Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deviceDetails.length > 0 ? (
            <DataTable
              data={deviceDetails}
              columns={deviceColumns}
              searchable={false}
              pagination={false}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Smartphone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No Device Details</p>
              <p className="text-sm">No devices are currently assigned to this RFC</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}