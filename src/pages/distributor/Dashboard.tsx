import { useState, useEffect } from 'react';
import { 
  Package,
  Users,
  CheckCircle2,
  Box
} from 'lucide-react';
import { StatsCard } from '@/components/common/StatsCard';
import { distributorApi } from '@/api/distributor';

export function DistributorDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalInventory: 0,
    assignedInventory: 0,
    unassignedInventory: 0,
    totalRFCs: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch inventory and RFCs in parallel
      const [inventoryResponse, rfcResponse] = await Promise.all([
        distributorApi.getInventory({ page: 1, limit: 100000 }),
        distributorApi.getRFCs({ page: 1, limit: 100 }),
      ]);

      const inventory = inventoryResponse.data;
      const assignedCount = inventory.filter(d => d.rfc_entity_id).length;
      const unassignedCount = inventory.filter(d => !d.rfc_entity_id).length;

      setMetrics({
        totalInventory: inventory.length,
        assignedInventory: assignedCount,
        unassignedInventory: unassignedCount,
        totalRFCs: rfcResponse.rfcs.length,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Distributor Dashboard</h1>
        <p className="text-gray-600 text-lg">Manage inventory distribution and RFC assignments</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Inventory"
          value={metrics.totalInventory.toLocaleString()}
          icon={Package}
        />
        <StatsCard
          title="Assigned to RFC"
          value={metrics.assignedInventory.toLocaleString()}
          icon={CheckCircle2}
        />
        <StatsCard
          title="Unassigned"
          value={metrics.unassignedInventory.toLocaleString()}
          icon={Box}
        />
        <StatsCard
          title="Total RFCs"
          value={metrics.totalRFCs}
          icon={Users}
        />
      </div>
    </div>
  );
}