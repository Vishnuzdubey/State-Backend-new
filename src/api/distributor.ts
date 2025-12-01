import { API_BASE_URL, tokenManager } from './config';

// Distributor Types
export interface DistributorLoginRequest {
  email: string;
  password: string;
}

export interface DistributorLoginResponse {
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

// Inventory Types
export interface InventoryDevice {
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
}

export interface GetInventoryResponse {
  status: string;
  data: InventoryDevice[];
}

// RFC Types
export interface RFCData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface GetRFCsResponse {
  rfcs: RFCData[];
}

export interface AssignToRFCRequest {
  rfcId: string;
  imeis: string[];
}

export interface AssignToRFCResponse {
  status: string;
  message: string;
}

// Distributor API endpoints
export const distributorApi = {
  login: async (credentials: DistributorLoginRequest): Promise<DistributorLoginResponse> => {
    console.log('\ud83d\udd10 Distributor login attempt');
    const response = await fetch(`${API_BASE_URL}/distributor/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('\u2705 Distributor login successful');
      tokenManager.setToken('DISTRIBUTOR', data.token);
      return data;
    }

    throw new Error(data.message || 'Distributor login failed');
  },

  logout: () => {
    tokenManager.removeToken('DISTRIBUTOR');
  },

  // Inventory Management
  getInventory: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<GetInventoryResponse> => {
    const token = tokenManager.getToken('DISTRIBUTOR');
    if (!token) throw new Error('Not authenticated');

    const queryParams = new URLSearchParams({
      page: String(params?.page || 1),
      limit: String(params?.limit || 100000),
    });

    console.log('📦 Fetching distributor inventory...');
    const response = await fetch(`${API_BASE_URL}/distributor/inventory?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      console.log('✅ Inventory fetched:', data.data.length);
      return data;
    }

    throw new Error('Failed to fetch inventory');
  },

  // RFC Management
  getRFCs: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<GetRFCsResponse> => {
    const token = tokenManager.getToken('DISTRIBUTOR');
    if (!token) throw new Error('Not authenticated');

    const queryParams = new URLSearchParams({
      page: String(params?.page || 1),
      limit: String(params?.limit || 100),
    });

    if (params?.search) {
      queryParams.append('search', params.search);
    }

    console.log('👥 Fetching RFCs...');
    const response = await fetch(`${API_BASE_URL}/distributor/rfc?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.rfcs) {
      console.log('✅ RFCs fetched:', data.rfcs.length);
      return data;
    }

    throw new Error('Failed to fetch RFCs');
  },

  // Assign Inventory to RFC
  assignToRFC: async (assignmentData: AssignToRFCRequest): Promise<AssignToRFCResponse> => {
    const token = tokenManager.getToken('DISTRIBUTOR');
    if (!token) throw new Error('Not authenticated');

    console.log('🔗 Assigning devices to RFC...');
    console.log('📤 Request URL:', `${API_BASE_URL}/distributor/rfc/assign`);
    console.log('📤 Request data:', assignmentData);
    console.log('🔑 Token:', token);
    
    const response = await fetch(`${API_BASE_URL}/distributor/rfc/assign`, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assignmentData),
      mode: 'cors',
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response statusText:', response.statusText);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    const contentType = response.headers.get('content-type');
    console.log('📥 Content-Type:', contentType);

    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Non-JSON response received:');
      console.error('First 500 chars:', text.substring(0, 500));
      throw new Error(`Server returned HTML instead of JSON (Status: ${response.status}). Endpoint may not exist or authentication failed.`);
    }

    const data = await response.json();
    console.log('📥 Response data:', data);

    if (response.ok && data.status === 'success') {
      console.log('✅ Devices assigned successfully');
      return data;
    }

    throw new Error(data.message || 'Failed to assign devices to RFC');
  },
};
