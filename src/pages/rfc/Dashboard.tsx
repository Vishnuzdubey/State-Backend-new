import { 
  Activity,
  Truck
} from 'lucide-react';
import { StatsCard } from '@/components/common/StatsCard';

export function RFCDashboard() {
  const metrics = {
    deviceActivations: 1240,
    linkedVehicles: 45
  };

  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">RFC Dashboard</h1>
        <p className="text-gray-600 text-lg">Regional Fleet Control management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        <StatsCard
          title="Device Activation Count"
          value={metrics.deviceActivations.toLocaleString()}
          icon={Activity}
          trend={{ value: 18, isPositive: true }}
        />
        <StatsCard
          title="Linked Vehicles"
          value={metrics.linkedVehicles}
          icon={Truck}
          trend={{ value: 7, isPositive: true }}
        />
      </div>
    </div>
  );
}