import { useState, useEffect } from 'react';
import {Download, FileText, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable';
import { useNavigate } from 'react-router-dom';
import { superAdminApi, type ManufacturerData } from '@/api';

export function Manufacturers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [manufacturers, setManufacturers] = useState<ManufacturerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchManufacturers();
  }, []);

  const fetchManufacturers = async () => {
    setIsLoading(true);
    try {
      const response = await superAdminApi.getManufacturers();
      setManufacturers(response.data);
      console.log('📋 Loaded', response.data.length, 'manufacturers');
    } catch (error) {
      console.error('Failed to fetch manufacturers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasAllDocuments = (manufacturer: ManufacturerData) => {
    return !!(
      manufacturer.gst_doc &&
      manufacturer.balance_sheet_doc &&
      manufacturer.address_proof_doc &&
      manufacturer.pan_doc &&
      manufacturer.user_pan_doc &&
      manufacturer.user_address_proof_doc
    );
  };

  const getDocumentStatus = (manufacturer: ManufacturerData) => {
    if (hasAllDocuments(manufacturer)) {
      return { label: 'Uploaded', variant: 'success' };
    }
    return { label: 'Pending', variant: 'warning' };
  };

  const totalCount = manufacturers.length;

  const filteredManufacturers = manufacturers.filter(manufacturer => {
    const matchesSearch = manufacturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manufacturer.gst.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manufacturer.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manufacturer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || manufacturer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'name',
      header: 'Entity Name',
      sortable: true,
      render: (value: string, row: ManufacturerData) => (
        <button
          onClick={() => navigate(`/super-admin/manufacturers/${row.id}`)}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left"
        >
          {value}
        </button>
      )
    },
    { key: 'gst', header: 'GST Number', sortable: true },
    { key: 'district', header: 'District', sortable: true },
    { key: 'pincode', header: 'Pin Code' },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'phone', header: 'Phone' },
    {
      key: 'status',
      header: 'Approval Status',
      render: (value: string) => {
        const statusColors = {
          PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          ACKNOWLEDGED: 'bg-blue-100 text-blue-800 border-blue-300',
          APPROVED: 'bg-green-100 text-green-800 border-green-300',
        };
        return (
          <Badge variant="outline" className={statusColors[value as keyof typeof statusColors]}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'documents',
      header: 'Documents',
      render: (_: any, row: ManufacturerData) => {
        const docStatus = getDocumentStatus(row);
        return (
          <Badge
            variant="outline"
            className={
              docStatus.variant === 'success'
                ? 'bg-green-100 text-green-800 border-green-300'
                : 'bg-orange-100 text-orange-800 border-orange-300'
            }
          >
            {docStatus.label}
          </Badge>
        );
      }
    }
  ];

  const actions = [
    { label: 'View Details', onClick: (row: ManufacturerData) => navigate(`/super-admin/manufacturers/${row.id}`) },
    {
      label: 'Acknowledge',
      onClick: (row: ManufacturerData) => {
        if (row.status === 'PENDING') {
          navigate(`/super-admin/manufacturers/${row.id}`, { state: { action: 'acknowledge' } });
        }
      }
    },
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
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchManufacturers}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {/* <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate('/super-admin/manufacturers/add')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Manufacturer
          </Button> */}
        </div>
      </div>

      {/* Summary and Export */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-lg font-semibold">
            Total: <span className="text-blue-600">{totalCount}</span>
          </div>
          <button
            onClick={() => setStatusFilter(null)}
            className={`px-3 py-1 rounded transition-all ${statusFilter === null
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1 rounded transition-all font-medium ${statusFilter === 'PENDING'
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200'
              }`}
          >
            Pending: {manufacturers.filter(m => m.status === 'PENDING').length}
          </button>
          <button
            onClick={() => setStatusFilter('ACKNOWLEDGED')}
            className={`px-3 py-1 rounded transition-all font-medium ${statusFilter === 'ACKNOWLEDGED'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200'
              }`}
          >
            Acknowledged: {manufacturers.filter(m => m.status === 'ACKNOWLEDGED').length}
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1 rounded transition-all font-medium ${statusFilter === 'APPROVED'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
              }`}
          >
            Approved: {manufacturers.filter(m => m.status === 'APPROVED').length}
          </button>
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