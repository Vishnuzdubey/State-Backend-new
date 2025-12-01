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
};
