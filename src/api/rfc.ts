import { API_BASE_URL, tokenManager } from './config';

// RFC Types
export interface RFCLoginRequest {
  email: string;
  password: string;
}

export interface RFCLoginResponse {
  status: string;
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    fullname?: string;
  };
}

// RFC Inventory Types
export interface RFCDevice {
  id: string;
  imei: string;
  serial_number: string;
  manufacturer: string | null;
  distributor: string | null;
  VLTD_model_code: string;
  ICCID: string;
  eSIM_1: string;
  eSIM_1_provider: string;
  eSIM_2: string;
  eSIM_2_provider: string;
  certificate_number: string;
  createdAt: string;
  manufacturer_entity_id: string | null;
  distributor_entity_id: string | null;
  rfc_entity_id: string | null;
  vehicle?: {
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
    engine_number: string | null;
    vehicle_type: string;
    plan_years: number;
    createdAt: string;
    updatedAt: string;
    valid_till: string;
    user_id: string;
    device_id: string;
  } | null;
}

export interface GetRFCInventoryResponse {
  status: string;
  data: RFCDevice[];
}

// RFC API endpoints
export const rfcApi = {
  login: async (credentials: RFCLoginRequest): Promise<RFCLoginResponse> => {
    console.log('🔐 RFC login attempt');
    const response = await fetch(`${API_BASE_URL}/rfc/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('✅ RFC login successful');
      tokenManager.setToken('RFC', data.token);
      return data;
    }

    throw new Error(data.message || 'RFC login failed');
  },

  logout: () => {
    tokenManager.removeToken('RFC');
  },

  // Inventory Management
  getInventory: async (): Promise<GetRFCInventoryResponse> => {
    const token = tokenManager.getToken('RFC');
    if (!token) throw new Error('Not authenticated');

    console.log('📦 Fetching RFC inventory...');
    const response = await fetch(`${API_BASE_URL}/rfc/inventory`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('✅ RFC inventory fetched:', data.data.length);
      return data;
    }

    throw new Error('Failed to fetch RFC inventory');
  },

  generateCertificate: async (imei: string): Promise<any> => {
    const token = tokenManager.getToken('RFC');
    if (!token) throw new Error('Not authenticated');

    console.log('🔐 Generating certificate for IMEI:', imei);
    const response = await fetch(`${API_BASE_URL}/rfc/inventory/generate-certificate/${imei}`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Certificate generated successfully for IMEI:', imei);
      return data;
    }

    throw new Error(data.message || 'Failed to generate certificate');
  },

  // Device Activation Methods
  findDevice: async (imei: string): Promise<any> => {
    const token = tokenManager.getToken('RFC');
    if (!token) throw new Error('Not authenticated');

    console.log('🔍 Finding device with IMEI:', imei);
    const response = await fetch(`${API_BASE_URL}/rfc/inventory/find/${imei}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('✅ Device details fetched:', imei);
      return data;
    }

    throw new Error(data.message || 'Device not found');
  },

  findUser: async (phone: string): Promise<any> => {
    const token = tokenManager.getToken('RFC');
    if (!token) throw new Error('Not authenticated');

    console.log('🔍 Finding user with phone:', phone);
    const response = await fetch(`${API_BASE_URL}/rfc/users/find/${phone}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ User found:', phone);
      // API returns user object directly, wrap it in expected format
      return {
        status: 'success',
        user: data.user || data,
      };
    }

    throw new Error(data.message || 'User not found');
  },

  createUser: async (userData: any): Promise<any> => {
    const token = tokenManager.getToken('RFC');
    if (!token) throw new Error('Not authenticated');

    console.log('👤 Creating new user...');
    const response = await fetch(`${API_BASE_URL}/rfc/users`, {
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

  assignDevice: async (userId: string, assignmentData: any): Promise<any> => {
    const token = tokenManager.getToken('RFC');
    if (!token) throw new Error('Not authenticated');

    console.log('🚗 Assigning device to user:', userId);
    const response = await fetch(`${API_BASE_URL}/rfc/inventory/assign/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assignmentData),
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('✅ Device assigned successfully');
      return data;
    }

    throw new Error(data.message || 'Failed to assign device');
  },

  // User Management Methods
  getUsers: async (page: number = 1, limit: number = 100, search: string = ''): Promise<any> => {
    const token = tokenManager.getToken('RFC');
    if (!token) throw new Error('Not authenticated');

    console.log('👥 Fetching RFC users...');
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search,
    });

    const response = await fetch(`${API_BASE_URL}/rfc/users?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Users fetched:', Array.isArray(data) ? data.length : data.data?.length);
      // API returns array directly, wrap it in expected format
      return {
        status: 'success',
        data: Array.isArray(data) ? data : (data.data || []),
      };
    }

    throw new Error(
      (typeof data === 'object' && data.message) || 'Failed to fetch users'
    );
  },

  getUserDevices: async (userId: string): Promise<any> => {
    const token = tokenManager.getToken('RFC');
    if (!token) throw new Error('Not authenticated');

    console.log('📱 Fetching devices for user:', userId);
    const response = await fetch(`${API_BASE_URL}/rfc/inventory?page=1&limit=1000000000&search=&userId=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('✅ User devices fetched:', data.data.length);
      return data;
    }

    throw new Error(data.message || 'Failed to fetch user devices');
  },

  getDeviceDetails: async (imei: string): Promise<any> => {
    const token = tokenManager.getToken('RFC');
    if (!token) throw new Error('Not authenticated');

    console.log('🔍 Fetching device details:', imei);
    const response = await fetch(`${API_BASE_URL}/rfc/inventory/find/${imei}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('✅ Device details fetched:', imei);
      return data;
    }

    throw new Error(data.message || 'Device not found');
  },

  getUserDetails: async (userId: string): Promise<any> => {
    const token = tokenManager.getToken('RFC');
    if (!token) throw new Error('Not authenticated');

    console.log('👤 Fetching user details:', userId);
    const response = await fetch(`${API_BASE_URL}/rfc/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ User details fetched:', userId);
      // API returns user object directly, wrap it in expected format
      return {
        status: 'success',
        user: data.user || data,
      };
    }

    throw new Error(data.message || 'User not found');
  },
};