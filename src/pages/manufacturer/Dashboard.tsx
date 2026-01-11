import { useState, useEffect } from 'react';
import {
  Activity,
  Package,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { StatsCard } from '@/components/common/StatsCard';
import { MapComponent } from '@/components/common/MapComponent';
import { manufacturerApi } from '@/api/manufacturer';

export function ManufacturerDashboard() {
  const [metrics, setMetrics] = useState({
    activeDevices: 0,
    inventoryUploaded: 0,
    activations7Days: 0,
    expiringIn30Days: 0,
    expiredNotRenewed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await manufacturerApi.getDashboard();
      
      // Map API response to component metrics
      setMetrics({
        activeDevices: response.data.activeInventory,
        inventoryUploaded: response.data.inventoryCount,
        activations7Days: response.data.activationsInLastWeek,
        expiringIn30Days: response.data.inventoryExpiring,
        expiredNotRenewed: response.data.inventoryExpired
      });
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 w-full min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Manufacturer Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Manage your device inventory and monitor activations
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Active Devices"
          value={metrics.activeDevices.toLocaleString()}
          icon={Activity}
          trend={{ value: 8, isPositive: true }}
          className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        />

        <StatsCard
          title="Inventory Uploaded"
          value={metrics.inventoryUploaded.toLocaleString()}
          icon={Package}
          trend={{ value: 15, isPositive: true }}
          className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
        />

        <StatsCard
          title="Activations (7 days)"
          value={metrics.activations7Days}
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
          className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
        />

        <StatsCard
          title="Expiring in 30 days"
          value={metrics.expiringIn30Days}
          icon={Clock}
          className={`${metrics.expiringIn30Days > 0
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
        />

        <StatsCard
          title="Expired, not renewed"
          value={metrics.expiredNotRenewed}
          icon={AlertTriangle}
          className={`${metrics.expiredNotRenewed > 0
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
        />
      </div>



      {/* Additional Status Information */}
      

      {/* Device Location Map */}
      <MapComponent height="500px" />

      {/* Status Indicators */}
      {(metrics.expiringIn30Days > 0 || metrics.expiredNotRenewed > 0) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
              Attention Required
            </h4>
          </div>
          <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            {metrics.expiringIn30Days > 0 && (
              <p>• {metrics.expiringIn30Days} device(s) will expire in the next 30 days</p>
            )}
            {metrics.expiredNotRenewed > 0 && (
              <p>• {metrics.expiredNotRenewed} device(s) have expired and need renewal</p>
            )}
          </div>
        </div>
      )}

      {/* Success Message for Clean Status */}
      {metrics.expiringIn30Days === 0 && metrics.expiredNotRenewed === 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-800 dark:text-green-200">
              All devices are up to date
            </span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            No devices are expiring soon or require renewal.
          </p>
        </div>
      )}
        </>
      )}
    </div>
  );
}