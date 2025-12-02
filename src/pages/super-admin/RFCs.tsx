import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { superAdminApi, type RFCData } from '@/api/superAdmin';

export function RFCs() {
  const navigate = useNavigate();
  const [rfcs, setRfcs] = useState<RFCData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRFCs();
  }, []);

  const fetchRFCs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminApi.getRFCs({ page: 1, limit: 100, search });
      setRfcs(response.rfcs);
    } catch (err) {
      console.error('Failed to fetch RFCs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load RFCs');
    } finally {
      setLoading(false);
    }
  };

  // Search with API
  const handleSearch = () => {
    fetchRFCs();
  };

  const [rfcsOld] = useState([
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

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (value: string, row: any) => (
        <button
          className="text-blue-600 underline hover:text-blue-800 text-left font-medium"
          onClick={() => navigate(`/super-admin/rfcs/${row.id}`)}
        >
          {value || 'Unnamed RFC'}
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading RFCs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RFCs LIST</h1>
          <p className="text-gray-600">{rfcs.length} RFC(s) found</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate('/super-admin/rfcs/add')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add RFC
        </Button>
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

      {/* RFCs Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={rfcs}
            columns={columns}
            searchable={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}