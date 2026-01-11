import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Package,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import { StatsCard } from '@/components/common/StatsCard';
import { MapComponent } from '@/components/common/MapComponent';
import { API_BASE_URL, tokenManager } from '@/api';

export function SuperAdminDashboard() {
  // const navigate = useNavigate();
  const [, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeInventory: 0,
    inventoryCount: 0,
    activationsInLastWeek: 0,
    inventoryExpiring: 0,
    inventoryExpired: 0
  });

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      const token = tokenManager.getToken('SUPER_ADMIN');
      if (!token) {
        console.error('No authentication token found');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/dashboard/main`, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      const result = await response.json();
      if (result.status === 'success') {
        setMetrics(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
        <p className="text-gray-600 text-lg">Overview of your Venus device management system</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Active Inventory"
          value={metrics.activeInventory.toLocaleString()}
          icon={Activity}
        />
        <StatsCard
          title="Total Inventory"
          value={metrics.inventoryCount.toLocaleString()}
          icon={Package}
        />
        <StatsCard
          title="Activations (7 days)"
          value={metrics.activationsInLastWeek.toLocaleString()}
          icon={TrendingUp}
        />
        <StatsCard
          title="Expiring (30 days)"
          value={metrics.inventoryExpiring}
          icon={Clock}
          className="border-orange-200"
        />
        <StatsCard
          title="Expired Inventory"
          value={metrics.inventoryExpired}
          icon={AlertCircle}
          className="border-red-200"
        />
      </div>

      {/* Map */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Device Locations</h2>
        <MapComponent />
      </div>
    </div>
  );
}