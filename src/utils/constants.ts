import { UserRole } from '@/types';

export const ROLES: Record<UserRole, string> = {
  'super-admin': 'Super Admin',
  'manufacturer': 'Manufacturer',
  'distributor': 'Distributor',
  'rfc': 'RFC'
};

export const DEVICE_STATUSES = [
  { value: 'active', label: 'Active', color: 'text-green-600' },
  { value: 'inactive', label: 'Inactive', color: 'text-gray-600' },
  { value: 'expired', label: 'Expired', color: 'text-red-600' },
  { value: 'pending', label: 'Pending', color: 'text-yellow-600' }
];

export const ENTITY_STATUSES = [
  { value: 'active', label: 'Active', color: 'text-green-600' },
  { value: 'inactive', label: 'Inactive', color: 'text-gray-600' }
];

export const SIDEBAR_MENU = {
  'super-admin': [
    { label: 'Dashboard', path: '/super-admin', icon: 'LayoutDashboard' },
    { label: 'Device Inventory', path: '/super-admin/device-inventory', icon: 'Package' },
    { label: 'Manufacturers', path: '/super-admin/manufacturers', icon: 'Factory' },
    { label: 'Distributors', path: '/super-admin/distributors', icon: 'Truck' },
    { label: 'RFCs', path: '/super-admin/rfcs', icon: 'Radio' },
    { label: 'Device Type', path: '/super-admin/devices', icon: 'Cpu' },
    // { label: 'Plans', path: '/super-admin/plans', icon: 'CreditCard' },
    { label: 'User Management', path: '/super-admin/users', icon: 'Users' },
    // { label: 'Masters', path: '/super-admin/settings', icon: 'Database' },
    // { label: 'Reports', path: '/super-admin/settings', icon: 'BarChart2' },
    { label: 'Settings', path: '/super-admin/settings', icon: 'Settings' }
  ],
  'manufacturer': [
    { label: 'Dashboard', path: '/manufacturer', icon: 'LayoutDashboard' },
  { label: 'Inventory', path: '/manufacturer/inventory', icon: 'Package' },
  { label: 'RFC', path: '/manufacturer/rfcs', icon: 'Radio' },
  { label: 'Distributors', path: '/manufacturer/distributors', icon: 'Truck' },
  { label: 'Devices', path: '/manufacturer/devices', icon: 'Cpu' },
  { label: 'User Management', path: '/manufacturer/users', icon: 'Users' },
    { label: 'Settings', path: '/manufacturer/settings', icon: 'Settings' }
  ],
  'distributor': [
    { label: 'Dashboard', path: '/distributor', icon: 'LayoutDashboard' },
    { label: 'Inventory', path: '/distributor/inventory', icon: 'Package' },
    { label: 'Settings', path: '/distributor/settings', icon: 'Settings' }
  ],
  'rfc': [
    { label: 'Dashboard', path: '/rfc', icon: 'LayoutDashboard' },
    { label: 'Devices', path: '/rfc/devices', icon: 'Cpu' },
    { label: 'Settings', path: '/rfc/settings', icon: 'Settings' }
  ]
};



