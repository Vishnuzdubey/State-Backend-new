import { useState } from 'react';
import { Plus, Download, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable';
import { Manufacturer } from '@/types';
import { useNavigate } from 'react-router-dom';

export function Manufacturers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [manufacturers] = useState<Manufacturer[]>([
    {
      id: '1',
      entityName: 'Watsoo Express Private Limited',
      code: 'WATS8196',
      district: 'Gurgaon',
      pinCode: '122016',
      status: 'active',
      email: 'vltd@watsoo.com',
      phone: '8448835133',
      address: 'Plot No. 872, Udyog Vihar, Phase-V',
      remainingPoints: 99562,
    },
    {
      id: '2',
      entityName: 'Ecogas Impex Pvt Ltd',
      code: 'ECOG5365',
      district: 'Faridabad',
      pinCode: '121003',
      status: 'active',
      email: 'info@ecogas.com',
      phone: '9876543210',
      address: 'Industrial Area, Sector 25',
      remainingPoints: 96220,
    },
    {
      id: '3',
      entityName: 'RDM ENTERPRISES PRIVATE LIMITED',
      code: 'RDM 8367',
      district: 'Faridabad',
      pinCode: '121102',
      status: 'active',
      email: 'contact@rdm.com',
      phone: '9876543211',
      address: 'Plot 45, Industrial Complex',
      remainingPoints: 93700,
    },
    {
      id: '4',
      entityName: 'ACUTE COMMUNICATION SERVICES PVT LTD',
      code: 'ACUT4287',
      district: 'North East Delhi',
      pinCode: '110053',
      status: 'active',
      email: 'info@acute.com',
      phone: '9876543212',
      address: 'Block A, Commercial Complex',
      remainingPoints: 98263,
    },
    {
      id: '5',
      entityName: 'TechFlow Solutions Ltd',
      code: 'TECH7891',
      district: 'Bangalore',
      pinCode: '560100',
      status: 'active',
      email: 'admin@techflow.com',
      phone: '9876543213',
      address: 'Electronic City, Phase 2',
      remainingPoints: 85420,
    },
  ]);

  const totalCount = 19;

  const filteredManufacturers = manufacturers.filter(manufacturer =>
    manufacturer.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manufacturer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manufacturer.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      key: 'entityName', 
      header: 'Entity Name', 
      sortable: true,
      render: (value: string, row: Manufacturer) => (
        <button
          onClick={() => navigate(`/super-admin/manufacturers/${row.id}`)}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left"
        >
          {value}
        </button>
      )
    },
    { key: 'code', header: 'Entity Code', sortable: true },
    { key: 'district', header: 'District', sortable: true },
    { key: 'pinCode', header: 'Pin Code' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Uploaded
        </Badge>
      )
    },
    {
      key: 'remainingPoints',
      header: 'Remaining Points',
      render: (value: number) => (
        <span className="font-medium">{value?.toLocaleString() || 0}</span>
      )
    },
    {
      key: 'addPoints',
      header: 'Add Points',
      render: () => (
        <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
          Add
        </Button>
      )
    }
  ];

  const actions = [
    { label: 'Edit', onClick: (row: Manufacturer) => console.log('Edit', row) },
    { label: 'View Details', onClick: (row: Manufacturer) => navigate(`/super-admin/manufacturers/${row.id}`) },
    { label: 'Deactivate', onClick: (row: Manufacturer) => console.log('Deactivate', row), variant: 'destructive' as const },
  ];

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    console.log(`Exporting as ${format.toUpperCase()}`);
    // Implement export functionality
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manufacturers List</h1>
          <p className="text-gray-600 text-lg">Manage manufacturer accounts and approvals</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate('/super-admin/manufacturers/add')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Manufacturer
        </Button>
      </div>

      {/* Summary and Export */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold">
            Total Count: <span className="text-blue-600">{totalCount}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExport('csv')}
          >
            <FileText className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExport('excel')}
          >
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExport('pdf')}
          >
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Manufacturers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, code, or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Manufacturers Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={filteredManufacturers}
            columns={columns}
            actions={actions}
            searchable={false}
            pagination={true}
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  );
}