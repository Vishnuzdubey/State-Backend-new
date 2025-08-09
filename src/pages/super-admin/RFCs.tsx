import { useState } from 'react';
import { Plus, Download, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

export function RFCs() {
  const navigate = useNavigate();
  const [manufacturerFilter, setManufacturerFilter] = useState('');
  const [search, setSearch] = useState('');

  // Mock manufacturers for filter
  const manufacturers = [
    { id: '1', name: 'Watsoo Express' },
    { id: '2', name: 'Ecogas Impex' },
    { id: '3', name: 'TechFlow Solutions' },
  ];

  // RFCs mock data (randomized)
  const [rfcs] = useState([
    {
      id: '1',
      name: 'FleetX Solutions',
      code: 'RFCFX01',
      address: 'Plot 12, Tech Park, Sector 21',
      district: 'Noida',
      pinCode: '201301',
      manufacturer: 'Watsoo Express',
    },
    {
      id: '2',
      name: 'Urban Mobility Hub',
      code: 'RFCUMH02',
      address: '45, Main Road, Indira Nagar',
      district: 'Lucknow',
      pinCode: '226016',
      manufacturer: 'Ecogas Impex',
    },
    {
      id: '3',
      name: 'Metro Fleet Services',
      code: 'RFCMFS03',
      address: '88, MG Road, Near Metro Station',
      district: 'Bangalore',
      pinCode: '560001',
      manufacturer: 'TechFlow Solutions',
    },
    {
      id: '4',
      name: 'Rapid Transport Control',
      code: 'RFCRTC04',
      address: '7, Expressway, Sector 62',
      district: 'Gurgaon',
      pinCode: '122001',
      manufacturer: 'Watsoo Express',
    },
    {
      id: '5',
      name: 'Green Wheels Authority',
      code: 'RFCGWA05',
      address: 'Plot 5, Green Park',
      district: 'Pune',
      pinCode: '411001',
      manufacturer: 'Ecogas Impex',
    },
  ]);

  // Filter and search logic
  const filteredRFCs = rfcs.filter(rfc =>
    (!manufacturerFilter || rfc.manufacturer === manufacturerFilter) &&
    (
      rfc.name.toLowerCase().includes(search.toLowerCase()) ||
      rfc.code.toLowerCase().includes(search.toLowerCase()) ||
      rfc.district.toLowerCase().includes(search.toLowerCase())
    )
  );

  const columns = [
    {
      key: 'name',
      header: 'Entity Name',
      render: (value: string, row: any) => (
        <button
          className="text-blue-600 underline hover:text-blue-800"
          onClick={() => navigate(`/super-admin/rfcs/${row.id}`)}
        >
          {value}
        </button>
      ),
      sortable: true,
    },
    { key: 'code', header: 'Entitiy Code', sortable: true },
    { key: 'address', header: 'Address' },
    { key: 'district', header: 'District', sortable: true },
    { key: 'pinCode', header: 'Pin Code' },
  ];

  const actions = [
    { label: 'Edit', onClick: (row: any) => console.log('Edit', row) },
  ];

  // Export handlers (mock)
  const handleExport = (type: string) => {
    alert(`Exporting as ${type}`);
  };

  return (
    <div className="space-y-8 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RFC LIST</h1>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate('/super-admin/rfcs/add')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add RFC
        </Button>
      </div>

      {/* Filter, Count, Export, Search */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4 items-center">
          <label className="font-medium">Filter By Manufacturer:</label>
          <select
            className="border rounded px-2 py-1"
            value={manufacturerFilter}
            onChange={e => setManufacturerFilter(e.target.value)}
          >
            <option value="">All</option>
            {manufacturers.map(m => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
          <span className="ml-6 text-lg font-semibold">
            Total Count: <span className="text-blue-600">{filteredRFCs.length}</span>
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('CSV')}>
            <FileText className="h-4 w-4 mr-2" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('Excel')}>
            <Download className="h-4 w-4 mr-2" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('PDF')}>
            <FileText className="h-4 w-4 mr-2" /> PDF
          </Button>
        </div>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-48"
          />
          <Search className="text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <DataTable
          data={filteredRFCs}
          columns={columns}
          actions={actions}
        />
      </div>
    </div>
  );
}