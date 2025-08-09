import { 
  Package,
  Users
} from 'lucide-react';
import { StatsCard } from '@/components/common/StatsCard';

export function DistributorDashboard() {
  const metrics = {
    assignedInventories: 2340,
    rfcAssignments: 15
  };

  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Distributor Dashboard</h1>
        <p className="text-gray-600 text-lg">Manage inventory distribution and RFC assignments</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        <StatsCard
          title="Assigned Inventories"
          value={metrics.assignedInventories.toLocaleString()}
          icon={Package}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="RFC Assignments"
          value={metrics.rfcAssignments}
          icon={Users}
          trend={{ value: 3, isPositive: true }}
        />
      </div>
    </div>
  );
}