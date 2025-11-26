import { API_BASE_URL, tokenManager } from './config';

// Super Admin Types
export interface SuperAdminLoginRequest {
  email: string;
  password: string;
}

export interface SuperAdminLoginResponse {
  status: string;
  message: string;
  token: string;
  user: {
    id: string;
    fullname: string;
    email: string;
    password: string;
  };
}

// Manufacturer Management Types
export interface ManufacturerData {
  id: string;
  name: string;
  gst: string;
  pan: string;
  fullname_user: string;
  email: string;
  password: string | null;
  phone: string;
  address: string;
  pincode: string;
  district: string;
  state: string;
  status: 'PENDING' | 'ACKNOWLEDGED' | 'APPROVED';
  gst_doc: string | null;
  balance_sheet_doc: string | null;
  address_proof_doc: string | null;
  pan_doc: string | null;
  user_pan_doc: string | null;
  user_address_proof_doc: string | null;
  createdAt: string;
}

export interface GetManufacturersResponse {
  status: string;
  data: ManufacturerData[];
}

export interface UpdateManufacturerStatusRequest {
  status: 'PENDING' | 'ACKNOWLEDGED' | 'APPROVED';
  password?: string;
}

export interface UpdateManufacturerStatusResponse {
  status: string;
  message: string;
}

// Device Management Types
export interface DeviceVehicle {
  vehicle_number: string;
  owner_name: string;
  chassis_number: string;
  owner_email: string;
  owner_address: string;
  owner_phone: string;
}

export interface DeviceData {
  id: string;
  imei: string;
  serial_number: string;
  manufacturer: string;
  distributor: string;
  VLTD_model_code: string;
  ICCID: string;
  eSIM_1: string;
  eSIM_1_provider: string;
  eSIM_2: string;
  eSIM_2_provider: string;
  certificate_number: string;
  createdAt: string;
  vehicle: DeviceVehicle | null;
}

export interface GetDevicesResponse {
  status: string;
  message: string;
  devices: DeviceData[];
}

export interface DeviceDetailsUser {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
  address: string;
  pincode: number;
  district: string;
  state: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceDetailsVehicle {
  id: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  owner_address: string;
  fuel_type: string;
  rc_registered_name: string;
  vehicle_make: string;
  vehicle_model: string;
  entity_type: string;
  choose_plan: string;
  vehicle_number: string;
  chassis_number: string;
  engine_number: string;
  vehicle_type: string;
  plan_years: number;
  createdAt: string;
  updatedAt: string;
  valid_till: string;
  user_id: string;
  device_id: string;
  user: DeviceDetailsUser;
}

export interface DeviceDetails {
  id: string;
  imei: string;
  serial_number: string;
  manufacturer: string;
  distributor: string;
  VLTD_model_code: string;
  ICCID: string;
  eSIM_1: string;
  eSIM_1_provider: string;
  eSIM_2: string;
  eSIM_2_provider: string;
  certificate_number: string;
  createdAt: string;
  manufacturer_entity_id: string | null;
  vehicle: DeviceDetailsVehicle | null;
}

export interface GetDeviceDetailsResponse {
  status: string;
  data: DeviceDetails;
}

export interface DeviceLocation {
  imei: string;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
}

export interface GetDeviceLocationsResponse {
  status: string;
  message: string;
  time: string;
  data: DeviceLocation[];
}

export interface CreateDeviceRequest {
  imei: string;
  serial_number: string;
  manufacturer: string;
  distributor: string;
  VLTD_model_code: string;
}

export interface CreateDeviceResponse {
  status: string;
  message: string;
  device: DeviceData;
}

export interface DeleteDeviceResponse {
  status: string;
  message: string;
}

export interface SearchDeviceResponse {
  status: string;
  message: string;
  devices: DeviceData[];
}

export interface PermitHolderUser {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
  address: string;
  pincode: number;
  district: string;
  state: string;
  email: string;
  password: string;
  push_token: string;
  permit_holder_type: string;
  createdAt: string;
  updatedAt: string;
}

export interface FindUserResponse {
  user: PermitHolderUser;
}

export interface AssignVehicleRequest {
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  owner_address: string;
  fuel_type: string;
  rc_registered_name: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_type: string;
  entity_type: string;
  choose_plan: string;
  vehicle_number: string;
  chassis_number: string;
  imei: string;
}

export interface AssignVehicleResponse {
  status: string;
  message: string;
  vehicle: any;
}

// User Management Types
export interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
  address: string;
  pincode: number;
  district: string;
  state: string;
  email: string;
  password: string;
  push_token: string | null;
  permit_holder_type: string;
  createdAt: string;
  updatedAt: string;
  vehicleCount: number;
}

export interface GetUsersResponse {
  users: UserData[];
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  username: string;
  address: string;
  phone: string;
  pincode: string;
  district: string;
  state: string;
  email: string;
  password: string;
  permit_holder_type: string;
}

export interface UpdateUserRequest {
  first_name: string;
  last_name: string;
  username: string;
  address: string;
  pincode: string;
  district: string;
  state: string;
  email: string;
  password: string;
  permit_holder_type: string;
}

export interface CreateUserResponse {
  status: string;
  message: string;
  user: UserData;
}

export interface UpdateUserResponse {
  status: string;
  message: string;
  user: UserData;
}

export interface DeleteUserResponse {
  status: string;
  message: string;
}

// Super Admin API endpoints
export const superAdminApi = {
  login: async (credentials: SuperAdminLoginRequest): Promise<SuperAdminLoginResponse> => {
    console.log('🔐 Super Admin login attempt');
    const response = await fetch(`${API_BASE_URL}/admin/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('✅ Super Admin login successful');
      tokenManager.setToken('SUPER_ADMIN', data.token);
      return data;
    }

    throw new Error(data.message || 'Super admin login failed');
  },

  logout: () => {
    tokenManager.removeToken('SUPER_ADMIN');
  },

  // Manufacturer Management
  getManufacturers: async (params?: {
    page?: number;
    limit?: number;
    filter?: string;
    search?: string;
  }): Promise<GetManufacturersResponse> => {
    const token = tokenManager.getToken('SUPER_ADMIN');
    if (!token) throw new Error('Not authenticated');

    const queryParams = new URLSearchParams({
      page: String(params?.page || 1),
      limit: String(params?.limit || 100000000000),
      filter: params?.filter || '',
      search: params?.search || '',
    });

    console.log('📋 Fetching manufacturers...');
    const response = await fetch(`${API_BASE_URL}/admin/manufacturer?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('✅ Manufacturers fetched:', data.data.length);
      return data;
    }

    throw new Error(data.message || 'Failed to fetch manufacturers');
  },

  updateManufacturerStatus: async (
    manufacturerId: string,
    statusData: UpdateManufacturerStatusRequest
  ): Promise<UpdateManufacturerStatusResponse> => {
    const token = tokenManager.getToken('SUPER_ADMIN');
    if (!token) throw new Error('Not authenticated');

    console.log(`🔄 Updating manufacturer ${manufacturerId} status to ${statusData.status}`);
    const response = await fetch(`${API_BASE_URL}/admin/manufacturer/${manufacturerId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statusData),
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('✅ Manufacturer status updated successfully');
      return data;
    }

    throw new Error(data.message || 'Failed to update manufacturer status');
  },

  // Device Management
  getDevices: async (params?: {
    page?: number;
    pageSize?: number;
  }): Promise<GetDevicesResponse> => {
    const token = tokenManager.getToken('SUPER_ADMIN');
    if (!token) throw new Error('Not authenticated');

    const queryParams = new URLSearchParams({
      page: String(params?.page || 1),
      pageSize: String(params?.pageSize || 100),
    });

    console.log('📱 Fetching devices...');
    const response = await fetch(`${API_BASE_URL}/admin/devices?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('✅ Devices fetched:', data.devices.length);
      return data;
    }

    throw new Error(data.message || 'Failed to fetch devices');
  },

  getDeviceDetails: async (imei: string): Promise<GetDeviceDetailsResponse> => {
    const token = tokenManager.getToken('SUPER_ADMIN');
    if (!token) throw new Error('Not authenticated');

    console.log(`📱 Fetching device details for IMEI: ${imei}`);
    const response = await fetch(`${API_BASE_URL}/admin/packet/details/${imei}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('✅ Device details fetched');
      return data;
    }

    throw new Error(data.message || 'Failed to fetch device details');
  },

  getDeviceLocations: async (): Promise<GetDeviceLocationsResponse> => {
    const token = tokenManager.getToken('SUPER_ADMIN');
    if (!token) throw new Error('Not authenticated');

    console.log('🗺️ Fetching all device locations...');
    const response = await fetch(`${API_BASE_URL}/admin/packet/alldevices`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('✅ Device locations fetched:', data.data.length);
      return data;
    }

    throw new Error(data.message || 'Failed to fetch device locations');
  },

  createDevice: async (deviceData: CreateDeviceRequest): Promise<CreateDeviceResponse> => {
    const token = tokenManager.getToken('SUPER_ADMIN');
    if (!token) throw new Error('Not authenticated');

    console.log('➕ Creating new device...');
    const response = await fetch(`${API_BASE_URL}/admin/devices`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deviceData),
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('✅ Device created successfully');
      return data;
    }

    throw new Error(data.message || 'Failed to create device');
  },

  deleteDevice: async (deviceId: string): Promise<DeleteDeviceResponse> => {
    const token = tokenManager.getToken('SUPER_ADMIN');
    if (!token) throw new Error('Not authenticated');

    console.log(`🗑️ Deleting device: ${deviceId}`);
    const response = await fetch(`${API_BASE_URL}/admin/devices/${deviceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('✅ Device deleted successfully');
      return data;
    }

    throw new Error(data.message || 'Failed to delete device');
  },

  searchDevice: async (imei: string): Promise<SearchDeviceResponse> => {
    const token = tokenManager.getToken('SUPER_ADMIN');
    if (!token) throw new Error('Not authenticated');

    console.log(`🔍 Searching device by IMEI: ${imei}`);
    const response = await fetch(`${API_BASE_URL}/admin/devices/search?imei=${imei}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('✅ Device search completed');
      return data;
    }

    throw new Error(data.message || 'Failed to search device');
  },

  findUser: async (phone: string): Promise<FindUserResponse> => {
    const token = tokenManager.getToken('SUPER_ADMIN');
    if (!token) throw new Error('Not authenticated');

    console.log(`👤 Finding user by phone: ${phone}`);
    const response = await fetch(`${API_BASE_URL}/admin/users/find/${phone}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.user) {
      console.log('✅ User found');
      return data;
    }

    throw new Error('User not found');
  },

  assignVehicle: async (userId: string, vehicleData: AssignVehicleRequest): Promise<AssignVehicleResponse> => {
    const token = tokenManager.getToken('SUPER_ADMIN');
    if (!token) throw new Error('Not authenticated');

    console.log(`🚗 Assigning vehicle to user: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/admin/vehicles/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vehicleData),
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('✅ Vehicle assigned successfully');
      return data;
    }

    throw new Error(data.message || 'Failed to assign vehicle');
  },

  // User Management
  getUsers: async (params?: {
    page?: number;
    pageSize?: number;
  }): Promise<GetUsersResponse> => {
    const token = tokenManager.getToken('SUPER_ADMIN');
    if (!token) throw new Error('Not authenticated');

    const queryParams = new URLSearchParams({
      page: String(params?.page || 1),
      pageSize: String(params?.pageSize || 5000),
    });

    console.log('👥 Fetching users...');
    const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && Array.isArray(data)) {
      console.log('✅ Users fetched:', data.length);
      return { users: data };
    }

    throw new Error('Failed to fetch users');
  },

  createUser: async (userData: CreateUserRequest): Promise<CreateUserResponse> => {
    const token = tokenManager.getToken('SUPER_ADMIN');
    if (!token) throw new Error('Not authenticated');

    console.log('➕ Creating new user...');
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('✅ User created successfully');
      return data;
    }

    throw new Error(data.message || 'Failed to create user');
  },

  updateUser: async (userId: string, userData: UpdateUserRequest): Promise<UpdateUserResponse> => {
    const token = tokenManager.getToken('SUPER_ADMIN');
    if (!token) throw new Error('Not authenticated');

    console.log(`🔄 Updating user: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('✅ User updated successfully');
      return data;
    }

    throw new Error(data.message || 'Failed to update user');
  },

  deleteUser: async (userId: string): Promise<DeleteUserResponse> => {
    const token = tokenManager.getToken('SUPER_ADMIN');
    if (!token) throw new Error('Not authenticated');

    console.log(`🗑️ Deleting user: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('✅ User deleted successfully');
      return data;
    }

    throw new Error(data.message || 'Failed to delete user');
  },
};
