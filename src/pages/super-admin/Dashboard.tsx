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

export function SuperAdminDashboard() {
  // Mock data
  const metrics = {
    activeDevices: 15420,
    inventoryUploaded: 8920,
    activations: 1240,
    devicesExpiring: 89,
    expiredDevices: 23,
    pendingApprovals: 12
  };

  const pendingApprovals = [
    { id: 1, entityName: 'TechCorp Manufacturing', type: 'Manufacturer', district: 'Mumbai', status: 'pending' },
    { id: 2, entityName: 'Global Distributors Ltd', type: 'Distributor', district: 'Delhi', status: 'pending' },
    { id: 3, entityName: 'Smart RFC Solutions', type: 'RFC', district: 'Bangalore', status: 'pending' },
  ];

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
    { label: 'Approve', onClick: (row: any) => console.log('Approve', row) },
    { label: 'Reject', onClick: (row: any) => console.log('Reject', row), variant: 'destructive' as const },
    { label: 'View Details', onClick: (row: any) => console.log('View', row) }
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