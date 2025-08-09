import { useState } from 'react';
import { Plus, Download, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/common/DataTable';
import { useNavigate } from 'react-router-dom';

interface Distributor {
  id: string;
  entityName: string;
  code: string;
  address: string;
  district: string;
  pinCode: string;
  manufacturer: string;
}

export function Distributors() {
  const navigate = useNavigate();
  const [manufacturerFilter, setManufacturerFilter] = useState('');
  const [search, setSearch] = useState('');

  // Mock manufacturers for filter
  const manufacturers = [
    { id: '1', name: 'Watsoo Express' },
    { id: '2', name: 'Ecogas Impex' },
    { id: '3', name: 'TechFlow Solutions' },
  ];

  // Updated distributor data with your examples
  const [distributors] = useState<Distributor[]>([
    {
      id: '1',
      entityName: 'R K Enterprises',
      code: 'RKE',
      address: 'B-704, Balaji Complex, Plot 12 & 13, Sector 8E, Kalamboli, Navi Mumbai',
      district: 'Raigad',
      pinCode: '410218',
      manufacturer: 'Watsoo Express',
    },
    {
      id: '2',
      entityName: 'Rohit Trading Company',
      code: 'RTC',
      address: 'Lodha Bellissimo, N.M. Joshi Marg, Mahalaxmi',
      district: 'Mumbai',
      pinCode: '400009',
      manufacturer: 'Ecogas Impex',
    },
    {
      id: '3',
      entityName: 'Ashirwad Traders',
      code: 'AST',
      address: 'Shop No 3, Gomaji Kasturi Chs, Sec 5, Ulwe',
      district: 'Navi Mumbai',
      pinCode: '410206',
      manufacturer: 'TechFlow Solutions',
    },
    {
      id: '4',
      entityName: 'Star Auto Electric Company',
      code: 'SAEC',
      address: 'B 30/2 T/F, NEAR SAI BABA MANDIR, Jhilmil Industrial Area',
      district: 'Shahdara',
      pinCode: '110095',
      manufacturer: 'Watsoo Express',
    },
    {
      id: '5',
      entityName: 'Bharat Trading Company',
      code: 'BTC',
      address: 'Plot No. 877, In Steel Warehousing Complex, Steel Market Road, On Service Road',
      district: 'Raigad',
      pinCode: '410218',
      manufacturer: 'Ecogas Impex',
    },
    {
      id: '6',
      entityName: 'Balaji Traders',
      code: 'BJT',
      address: 'Office No 602, NMS Titanium, Sec 15 CBD Belapur',
      district: 'Belapur',
      pinCode: '400614',
      manufacturer: 'TechFlow Solutions',
    },
  ]);

  // Filter and search logic
  const filteredDistributors = distributors.filter(distributor =>
    (!manufacturerFilter || distributor.manufacturer === manufacturerFilter) &&
    (
      distributor.entityName.toLowerCase().includes(search.toLowerCase()) ||
      distributor.code.toLowerCase().includes(search.toLowerCase()) ||
      distributor.district.toLowerCase().includes(search.toLowerCase())
    )
  );

  const columns = [
    {
      key: 'entityName',
      header: 'Entity Name',
      render: (value: string, row: any) => (
        <button
          className="text-blue-600 underline hover:text-blue-800 text-left"
          onClick={() => navigate(`/super-admin/distributors/${row.id}`)}
        >
          {value}
        </button>
      ),
      sortable: true,
    },
    { key: 'code', header: 'Entity Code', sortable: true },
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
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DISTRIBUTORS LIST</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/super-admin/distributors/map')}
          >
            Distributor Map
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate('/super-admin/distributors/add')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Distributor
          </Button>
        </div>
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
            Total Count: <span className="text-blue-600">{filteredDistributors.length}</span>
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

      {/* Distributors Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <DataTable
          data={filteredDistributors}
          columns={columns}
          actions={actions}
        />
      </div>
    </div>
  );
}