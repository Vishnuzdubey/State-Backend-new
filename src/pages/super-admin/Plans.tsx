import { useState } from 'react';
import { Plus, Download, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable';
import { useNavigate } from 'react-router-dom';

interface Plan {
  id: string;
  planName: string;
  planDescription: string;
  validityMonth: number;
  price: number;
  status: string;
  createdDate: string;
  createdBy: string;
}

export function Plans() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Mock plans data
  const [plans] = useState<Plan[]>([
    {
      id: '7',
      planName: '24 Month',
      planDescription: '24 Month plan',
      validityMonth: 24,
      price: 2,
      status: 'Active',
      createdDate: '2024-07-29T10:38:44',
      createdBy: '1'
    },
    {
      id: '8',
      planName: '12 Month',
      planDescription: '12 Month plan',
      validityMonth: 12,
      price: 1,
      status: 'Active',
      createdDate: '2024-07-29T10:38:44',
      createdBy: '1'
    }
  ]);

  // Filter plans based on search
  const filteredPlans = plans.filter(plan =>
    plan.planName.toLowerCase().includes(search.toLowerCase()) ||
    plan.planDescription.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'planName',
      header: 'Plan Name',
      render: (value: string, row: any) => (
        <button
          className="text-blue-600 underline hover:text-blue-800 text-left"
          onClick={() => navigate(`/super-admin/plans/${row.id}`)}
        >
          {value}
        </button>
      ),
      sortable: true,
    },
    { 
      key: 'planDescription', 
      header: 'Plan Description',
      sortable: true 
    },
    { 
      key: 'validityMonth', 
      header: 'Validity Month',
      sortable: true 
    },
    { 
      key: 'price', 
      header: 'Price',
      sortable: true 
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <Badge 
          variant={value === 'Active' ? 'default' : 'secondary'}
          className={value === 'Active' ? 'bg-green-100 text-green-800' : ''}
        >
          {value}
        </Badge>
      ),
    },
  ];

  const actions = [
    { 
      label: 'Edit', 
      onClick: (row: any) => console.log('Edit plan', row) 
    },
  ];

  // Export handlers (mock)
  const handleExport = (type: string) => {
    alert(`Exporting plans as ${type}`);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PLAN LIST</h1>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate('/super-admin/plans/add')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Plan
        </Button>
      </div>

      {/* Count, Export, Search */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4 items-center">
          <span className="text-lg font-semibold">
            Total Count: <span className="text-blue-600">{filteredPlans.length}</span>
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

      {/* Plans Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <DataTable
          data={filteredPlans}
          columns={columns}
          actions={actions}
          pagination={true}
          pageSize={10}
        />
      </div>
    </div>
  );
}