import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ManufacturerStatusGuard } from '@/components/ManufacturerStatusGuard';
import { Layout } from '@/components/layout/Layout';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';

// Super Admin Pages
import { SuperAdminDashboard } from '@/pages/super-admin/Dashboard';
import { Manufacturers } from '@/pages/super-admin/Manufacturers';
import { ManufacturerDetails } from '@/pages/super-admin/ManufacturerDetails';
import { AddManufacturer } from '@/pages/super-admin/AddManufacturer';
import { Distributors } from '@/pages/super-admin/Distributors';
import { DistributorDetails } from '@/pages/super-admin/DistributorDetails';
import { AddDistributor } from '@/pages/super-admin/AddDistributor';
import { RFCs } from '@/pages/super-admin/RFCs';
import { RFCDetails } from '@/pages/super-admin/RFCDetails';
import { AddRFC } from '@/pages/super-admin/AddRFC';
import { Devices } from '@/pages/super-admin/Devices';
import { DeviceDetails } from '@/pages/super-admin/DeviceDetails';
import { DeviceLiveMap } from '@/pages/super-admin/DeviceLiveMap';
import { DeviceInventory } from '@/pages/super-admin/device-inventory';
import { Plans } from '@/pages/super-admin/Plans';
import { PlanDetails } from '@/pages/super-admin/PlanDetails';
import { AddPlan } from '@/pages/super-admin/AddPlan';
import { Users } from '@/pages/super-admin/Users';
import { Settings } from '@/pages/super-admin/Settings';

// Manufacturer Pages
import { ManufacturerDashboard } from '@/pages/manufacturer/Dashboard';
import { ManufacturerInventory } from '@/pages/manufacturer/Inventory';
import { MDeviceDetails } from '@/pages/manufacturer/DeviceDetails';
import { ManufacturerSettings } from '@/pages/manufacturer/Settings';
import { Onboarding } from '@/pages/manufacturer/Onboarding';
import ManufacturerRFCs from '@/pages/manufacturer/RFCs';
import AddInventory from '@/pages/manufacturer/AddInventory';
import ManufacturerDistributors from '@/pages/manufacturer/Distributors';
import AddDevice from '@/pages/manufacturer/AddDevice';
import ManufacturerDevices from '@/pages/manufacturer/Devices';
import ManufacturerUsers from '@/pages/manufacturer/Users';


// Distributor Pages
import { DistributorDashboard } from '@/pages/distributor/Dashboard';
import { DistributorInventory } from '@/pages/distributor/Inventory';
import { DistributorSettings } from '@/pages/distributor/Settings';
import { DistributorRFCs } from '@/pages/distributor/RFCs';

// RFC Pages
import { RFCDashboard } from '@/pages/rfc/Dashboard';
import { RFCDevices } from '@/pages/rfc/Devices';
import { RFCDeviceDetails } from '@/pages/rfc/DeviceDetails';
import { RFCSettings } from '@/pages/rfc/Settings';
import { RFCUsers } from '@/pages/rfc/Users';
import { RFCUserDetails } from '@/pages/rfc/UserDetails';

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  // Root redirect based on user role and status
  const getRootRedirect = () => {
    if (!isAuthenticated || !user) return '/login';

    switch (user.role) {
      case 'super-admin':
        return '/super-admin';
      case 'manufacturer':
        // Check manufacturer status for proper routing
        if (user.status === 'APPROVED') {
          return '/manufacturer';
        } else {
          // ACKNOWLEDGED, PENDING, or any other status goes to onboarding
          return '/manufacturer/onboarding';
        }
      case 'distributor':
        return '/distributor';
      case 'rfc':
        return '/rfc';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<Navigate to={getRootRedirect()} replace />} />

      {/* Super Admin Routes */}
      <Route
        path="/super-admin/*"
        element={
          <ProtectedRoute allowedRoles={['super-admin']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="manufacturers" element={<Manufacturers />} />
        <Route path="manufacturers/add" element={<AddManufacturer />} />
        <Route path="manufacturers/:id" element={<ManufacturerDetails />} />
        <Route path="distributors" element={<Distributors />} />
        <Route path="distributors/add" element={<AddDistributor />} />
        <Route path="distributors/:id" element={<DistributorDetails />} />
        <Route path="rfcs" element={<RFCs />} />
        <Route path="rfcs/add" element={<AddRFC />} />
        <Route path="rfcs/:id" element={<RFCDetails />} />
        <Route path="devices" element={<Devices />} />
        <Route path="devices/map" element={<DeviceLiveMap />} />
        <Route path="devices/:imei" element={<DeviceDetails />} />
        <Route path="device-inventory" element={<DeviceInventory />} />
        <Route path="plans" element={<Plans />} />
        <Route path="plans/add" element={<AddPlan />} />
        <Route path="plans/:id" element={<PlanDetails />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Manufacturer Routes - Onboarding (for non-approved) */}
      <Route
        path="/manufacturer/onboarding"
        element={
          <ProtectedRoute allowedRoles={['manufacturer']}>
            <ManufacturerStatusGuard requireApproved={false}>
              <Layout />
            </ManufacturerStatusGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Onboarding />} />
      </Route>

      {/* Manufacturer Routes - Dashboard (for approved only) */}
      <Route
        path="/manufacturer/*"
        element={
          <ProtectedRoute allowedRoles={['manufacturer']}>
            <ManufacturerStatusGuard requireApproved={true}>
              <Layout />
            </ManufacturerStatusGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<ManufacturerDashboard />} />
        <Route path="rfcs" element={<ManufacturerRFCs />} />
        <Route path="add-inventory" element={<AddInventory />} />
        <Route path="add-device" element={<AddDevice />} />
        <Route path="distributors" element={<ManufacturerDistributors />} />
        <Route path="devices" element={<ManufacturerDevices />} />
        <Route path="users" element={<ManufacturerUsers />} />
        <Route path="inventory" element={<ManufacturerInventory />} />
        <Route path="inventory/:id" element={<MDeviceDetails />} />
        <Route path="settings" element={<ManufacturerSettings />} />
      </Route>

      {/* Distributor Routes */}
      <Route
        path="/distributor/*"
        element={
          <ProtectedRoute allowedRoles={['distributor']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DistributorDashboard />} />
        <Route path="inventory" element={<DistributorInventory />} />
        <Route path="rfcs" element={<DistributorRFCs />} />
        <Route path="settings" element={<DistributorSettings />} />
      </Route>

      {/* RFC Routes */}
      <Route
        path="/rfc/*"
        element={
          <ProtectedRoute allowedRoles={['rfc']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RFCDashboard />} />
        <Route path="devices" element={<RFCDevices />} />
        <Route path="devices/:imei" element={<RFCDeviceDetails />} />
        <Route path="users" element={<RFCUsers />} />
        <Route path="users/:id" element={<RFCUserDetails />} />
        <Route path="settings" element={<RFCSettings />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;