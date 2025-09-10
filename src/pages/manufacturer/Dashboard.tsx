import { 
  Activity,
  Package,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { StatsCard } from '@/components/common/StatsCard';

export function ManufacturerDashboard() {
  const metrics = {
    activeDevices: 3203,
    inventoryUploaded: 8626,
    activations7Days: 36,
    expiringIn30Days: 0,
    expiredNotRenewed: 0
  };

  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Manufacturer Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Manage your device inventory and monitor activations
        </p>
      </div>

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
          className={`${
            metrics.expiringIn30Days > 0 
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' 
              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}
        />
        
        <StatsCard
          title="Expired, not renewed"
          value={metrics.expiredNotRenewed}
          icon={AlertTriangle}
          className={`${
            metrics.expiredNotRenewed > 0 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}
        />
      </div>

      {/* Additional Status Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Status Overview */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Device Status Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Active Devices</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {metrics.activeDevices.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Recent Activations (7 days)</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                +{metrics.activations7Days}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Devices Expiring Soon</span>
              <span className={`font-semibold ${
                metrics.expiringIn30Days > 0 
                  ? 'text-yellow-600 dark:text-yellow-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {metrics.expiringIn30Days}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Expired Devices</span>
              <span className={`font-semibold ${
                metrics.expiredNotRenewed > 0 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {metrics.expiredNotRenewed}
              </span>
            </div>
          </div>
        </div>

        {/* Inventory Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Inventory Management
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Inventory Uploaded</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {metrics.inventoryUploaded.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Devices Assigned</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {metrics.activeDevices.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Available for Assignment</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {(metrics.inventoryUploaded - metrics.activeDevices).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Assignment Rate</span>
              <span className="font-semibold text-gray-600 dark:text-gray-400">
                {((metrics.activeDevices / metrics.inventoryUploaded) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}