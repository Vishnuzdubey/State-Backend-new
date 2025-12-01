import { useState, useEffect } from 'react';
import {
  Activity,
  Truck,
  Package,
  Wifi
} from 'lucide-react';
import { StatsCard } from '@/components/common/StatsCard';
import { rfcApi } from '@/api/rfc';

export function RFCDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalDevices: 0,
    withCertificate: 0,
    jioProvider: 0,
    airtelProvider: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const inventoryResponse = await rfcApi.getInventory();
      const devices = inventoryResponse.data;

      const withCert = devices.filter(d => d.certificate_number).length;
      const jio = devices.filter(d =>
        d.eSIM_1_provider === 'Jio' || d.eSIM_2_provider === 'Jio'
      ).length;
      const airtel = devices.filter(d =>
        d.eSIM_1_provider === 'Airtel' || d.eSIM_2_provider === 'Airtel'
      ).length;

      setMetrics({
        totalDevices: devices.length,
        withCertificate: withCert,
        jioProvider: jio,
        airtelProvider: airtel,
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">RFC Dashboard</h1>
        <p className="text-gray-600 text-lg">Regional Facilitating Center - Device Management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Devices"
          value={metrics.totalDevices.toLocaleString()}
          icon={Package}
        />
        <StatsCard
          title="With Certificate"
          value={metrics.withCertificate.toLocaleString()}
          icon={Activity}
        />
        <StatsCard
          title="Jio eSIM"
          value={metrics.jioProvider.toLocaleString()}
          icon={Wifi}
        />
        <StatsCard
          title="Airtel eSIM"
          value={metrics.airtelProvider.toLocaleString()}
          icon={Truck}
        />
      </div>
    </div>
  );
}