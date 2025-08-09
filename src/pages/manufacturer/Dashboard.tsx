import { 
  Activity,
  Package,
  Users,
  CheckCircle
} from 'lucide-react';
import { StatsCard } from '@/components/common/StatsCard';

export function ManufacturerDashboard() {
  const metrics = {
    activeDevices: 5420,
    uploadedInventory: 8920,
    assignedDevices: 3200,
    approvalsPending: 12
  };

  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manufacturer Dashboard</h1>
        <p className="text-gray-600 text-lg">Manage your device inventory and approvals</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Devices"
          value={metrics.activeDevices.toLocaleString()}
          icon={Activity}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Uploaded Inventory"
          value={metrics.uploadedInventory.toLocaleString()}
          icon={Package}
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Assigned Devices"
          value={metrics.assignedDevices.toLocaleString()}
          icon={Users}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Device Approval Status"
          value={metrics.approvalsPending}
          icon={CheckCircle}
          className="border-yellow-200"
        />
      </div>
    </div>
  );
}