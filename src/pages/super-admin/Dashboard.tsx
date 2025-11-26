import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Package,
  TrendingUp,
  Clock,
  XCircle,
  MapPin,
  CheckCircle
} from 'lucide-react';
import { StatsCard } from '@/components/common/StatsCard';
import { MapComponent } from '@/components/common/MapComponent';
import { DataTable, StatusBadge } from '@/components/common/DataTable';
import { superAdminApi, type ManufacturerData } from '@/api';

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [manufacturers, setManufacturers] = useState<ManufacturerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  const metrics = {
    activeDevices: 15420,
    inventoryUploaded: 8920,
    activations: 1240,
    devicesExpiring: 89,
    expiredDevices: 23,
    pendingApprovals: 0
  };

  useEffect(() => {
    fetchManufacturers();
  }, []);

  const fetchManufacturers = async () => {
    try {
      const response = await superAdminApi.getManufacturers();
      setManufacturers(response.data);
      console.log('📊 Dashboard loaded with', response.data.length, 'manufacturers');
    } catch (error) {
      console.error('Failed to fetch manufacturers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingManufacturers = manufacturers.filter(m => m.status === 'PENDING');
  const pendingApprovals = pendingManufacturers.map(m => ({
    id: m.id,
    entityName: m.name,
    type: 'Manufacturer',
    district: m.district,
    status: m.status.toLowerCase(),
    email: m.email,
    phone: m.phone,
  }));

  metrics.pendingApprovals = pendingApprovals.length;

  const approvalColumns = [
    { key: 'entityName', header: 'Entity Name' },
    { key: 'type', header: 'Type' },
    { key: 'district', header: 'District' },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => <StatusBadge status={value} />
    }
  ];

  const approvalActions = [
    {
      label: 'View Details',
      onClick: (row: any) => navigate(`/super-admin/manufacturers/${row.id}`)
    },
    {
      label: 'Open Manufacturers',
      onClick: () => navigate('/super-admin/manufacturers')
    }
  ];

  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
        <p className="text-gray-600 text-lg">Overview of your RoadEye device management system</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Devices"
          value={metrics.activeDevices.toLocaleString()}
          icon={Activity}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Inventory Uploaded"
          value={metrics.inventoryUploaded.toLocaleString()}
          icon={Package}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Activations (7 days)"
          value={metrics.activations.toLocaleString()}
          icon={TrendingUp}
          trend={{ value: 23, isPositive: true }}
        />
        <StatsCard
          title="Devices Expiring (30 days)"
          value={metrics.devicesExpiring}
          icon={Clock}
          trend={{ value: 5, isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Expired Devices"
          value={metrics.expiredDevices}
          icon={XCircle}
          className="border-red-200"
        />
        <StatsCard
          title="Pending Approvals"
          value={metrics.pendingApprovals}
          icon={CheckCircle}
          className="border-yellow-200"
        />
      </div>

      {/* Map and Approvals */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <MapComponent />

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Pending Approvals</h2>
          <DataTable
            data={pendingApprovals}
            columns={approvalColumns}
            actions={approvalActions}
            searchable={false}
            pagination={false}
          />
        </div>
      </div>
    </div>
  );
}