import { useState, useEffect } from 'react';
import { Plus, Download, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/common/DataTable';
import { useNavigate } from 'react-router-dom';
import { superAdminApi, type DistributorData } from '@/api/superAdmin';
import { Card, CardContent } from '@/components/ui/card';

export function Distributors() {
  const navigate = useNavigate();
  const [distributors, setDistributors] = useState<DistributorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDistributors();
  }, []);

  const fetchDistributors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminApi.getDistributors({ page: 1, limit: 100, search });
      setDistributors(response.distributors);
    } catch (err) {
      console.error('Failed to fetch distributors:', err);
      setError(err instanceof Error ? err.message : 'Failed to load distributors');
    } finally {
      setLoading(false);
    }
  };

  // Search with API
  const handleSearch = () => {
    fetchDistributors();
  };

  const [distributorsOld] = useState<any[]>([
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

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (value: string, row: any) => (
        <button
          className="text-blue-600 underline hover:text-blue-800 text-left font-medium"
          onClick={() => navigate(`/super-admin/distributors/${row.id}`)}
        >
          {value || 'Unnamed Distributor'}
        </button>
      ),
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email',
      render: (value: string) => (
        <span className="text-gray-700">{value}</span>
      ),
      sortable: true
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
      sortable: true
    },
  ];

  const actions = [
    { label: 'Edit', onClick: (row: any) => console.log('Edit', row) },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading distributors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DISTRIBUTORS LIST</h1>
          <p className="text-gray-600">{distributors.length} distributor(s) found</p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate('/super-admin/distributors/add')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Distributor
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Distributors Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={distributors}
            columns={columns}
            searchable={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}