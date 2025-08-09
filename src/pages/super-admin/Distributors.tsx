import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { Distributor } from '@/types';

export function Distributors() {
  const [distributors] = useState<Distributor[]>([
    {
      id: '1',
      entityName: 'Global Distribution Network',
      code: 'GDN001',
      district: 'Mumbai',
      pinCode: '400010',
      email: 'contact@gdn.com',
      phone: '+91 9876543220',
      address: '123 Distribution Hub, Mumbai',
      assignedManufacturers: ['TCM001', 'SDL002'],
    },
    {
      id: '2',
      entityName: 'Metro Logistics',
      code: 'ML002',
      district: 'Delhi',
      pinCode: '110010',
      email: 'info@metrologistics.com',
      phone: '+91 9876543221',
      address: '456 Logistics Park, Delhi',
      assignedManufacturers: ['IE003'],
    },
  ]);

  const columns = [
    { key: 'entityName', header: 'Entity Name', sortable: true },
    { key: 'code', header: 'Code', sortable: true },
    { key: 'district', header: 'District', sortable: true },
    { key: 'pinCode', header: 'Pin Code' },
    { 
      key: 'assignedManufacturers', 
      header: 'Assigned Manufacturers',
      render: (value: string[]) => value.length
    },
  ];

  const actions = [
    { label: 'Edit', onClick: (row: Distributor) => console.log('Edit', row) },
    { label: 'View Details', onClick: (row: Distributor) => console.log('View', row) },
    { label: 'Manage Assignments', onClick: (row: Distributor) => console.log('Assignments', row) },
  ];

  return (
    <div className="space-y-8 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Distributors</h1>
          <p className="text-gray-600 text-lg">Manage distributor accounts and assignments</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Distributor
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <DataTable
          data={distributors}
          columns={columns}
          actions={actions}
        />
      </div>
    </div>
  );
}