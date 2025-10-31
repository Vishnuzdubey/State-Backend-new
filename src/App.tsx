import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { Login } from '@/pages/auth/Login';

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
import { DeviceInventory } from '@/pages/super-admin/device-inventory';
import { Plans } from '@/pages/super-admin/Plans';
import { PlanDetails } from '@/pages/super-admin/PlanDetails';
import { AddPlan } from '@/pages/super-admin/AddPlan';
import { Users } from '@/pages/super-admin/Users';
import { Settings } from '@/pages/super-admin/Settings';

// Manufacturer Pages
import { ManufacturerDashboard } from '@/pages/manufacturer/Dashboard';
import { ManufacturerInventory } from '@/pages/manufacturer/Inventory';
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

// RFC Pages
import { RFCDashboard } from '@/pages/rfc/Dashboard';
import { RFCDevices } from '@/pages/rfc/Devices';
import { RFCSettings } from '@/pages/rfc/Settings';

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  // Root redirect based on user role
  const getRootRedirect = () => {
    if (!isAuthenticated || !user) return '/login';
    
    switch (user.role) {
      case 'super-admin':
        return '/super-admin';
      case 'manufacturer':
        return '/manufacturer';
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
  {/* Public registration route for manufacturers (accessible without authentication) */}
  <Route path="/register/manufacturer" element={<AddManufacturer />} />
      
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
        <Route path="device-inventory" element={<DeviceInventory />} />
        <Route path="plans" element={<Plans />} />
        <Route path="plans/add" element={<AddPlan />} />
        <Route path="plans/:id" element={<PlanDetails />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Manufacturer Routes */}
      <Route 
        path="/manufacturer/*" 
        element={
          <ProtectedRoute allowedRoles={['manufacturer']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ManufacturerDashboard />} />
  <Route path="onboarding" element={<Onboarding />} />
  <Route path="rfcs" element={<ManufacturerRFCs />} />
  <Route path="add-inventory" element={<AddInventory />} />
  <Route path="add-device" element={<AddDevice />} />
  <Route path="distributors" element={<ManufacturerDistributors />} />
  <Route path="devices" element={<ManufacturerDevices />} />
  <Route path="users" element={<ManufacturerUsers />} />
    <Route path="inventory" element={<ManufacturerInventory />} />
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