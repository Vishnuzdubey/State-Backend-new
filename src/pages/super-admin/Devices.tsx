import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, StatusBadge } from '@/components/common/DataTable';
import { Device } from '@/types';

export function Devices() {
  const [devices] = useState<Device[]>([
    {
      id: '1',
      serialNo: 'RoadEye001234',
      imei: '123456789012345',
      modelCode: 'RoadEye-V1-2024',
      status: 'active',
      assignedTo: 'RFC001',
      assignedToType: 'rfc',
      activationDate: '2024-01-15',
      expiryDate: '2025-01-15',
    },
    {
      id: '2',
      serialNo: 'RoadEye001235',
      imei: '123456789012346',
      modelCode: 'RoadEye-V2-2024',
      status: 'pending',
      assignedTo: 'GDN001',
      assignedToType: 'distributor',
    },
    {
      id: '3',
      serialNo: 'RoadEye001236',
      imei: '123456789012347',
      modelCode: 'RoadEye-V1-2024',
      status: 'expired',
      assignedTo: 'RFC002',
      assignedToType: 'rfc',
      activationDate: '2023-01-15',
      expiryDate: '2024-01-15',
    },
  ]);

  const columns = [
    { key: 'serialNo', header: 'Serial No', sortable: true },
    { key: 'imei', header: 'IMEI', sortable: true },
    { key: 'modelCode', header: 'Model Code', sortable: true },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => <StatusBadge status={value} />
    },
    { key: 'assignedTo', header: 'Assigned To' },
  ];

  const actions = [
    { label: 'Edit', onClick: (row: Device) => console.log('Edit', row) },
    { label: 'View Details', onClick: (row: Device) => console.log('View', row) },
    { label: 'Track Location', onClick: (row: Device) => console.log('Track', row) },
    { label: 'Deactivate', onClick: (row: Device) => console.log('Deactivate', row), variant: 'destructive' as const },
  ];

  return (
    <div className="space-y-8 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Device Inventory</h1>
          <p className="text-gray-600 text-lg">Manage RoadEye device inventory and tracking</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Device
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <DataTable
          data={devices}
          columns={columns}
          actions={actions}
        />
      </div>
    </div>
  );
}