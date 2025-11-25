import { API_BASE_URL, tokenManager } from './config';

// Types
export interface InventoryDevice {
  imei: string;
  serial_number: string;
  VLTD_model_code: string;
  ICCID: string;
  eSIM_1: string;
  eSIM_2: string;
  eSIM_1_provider: string;
  eSIM_2_provider: string;
  certificate_number: string;
}

export interface InventoryItem extends InventoryDevice {
  id: string;
  manufacturer: string | null;
  distributor: string | null;
  createdAt: string;
  manufacturer_entity_id: string;
}

interface BulkUploadRequest {
  devices: InventoryDevice[];
}

interface BulkUploadResponse {
  status: string;
  message: string;
  data?: {
    uploaded: number;
    failed: number;
  };
}

interface GetInventoryResponse {
  status: string;
  data: InventoryItem[];
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  status: string;
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    gst: string;
    pan: string;
    fullname_user: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    pincode: string;
    district: string;
    state: string;
    status: string;
    gst_doc: string | null;
    balance_sheet_doc: string | null;
    address_proof_doc: string | null;
    pan_doc: string | null;
    user_pan_doc: string | null;
    user_address_proof_doc: string | null;
    createdAt: string;
  };
}

interface RegisterRequest {
  name: string;
  gst: string;
  pan: string;
  fullname_user: string;
  email: string;
  phone: string;
  address: string;
  pincode: string;
  district: string;
  state: string;
}

interface RegisterResponse {
  status: string;
  message: string;
}

// Manufacturer API
export const manufacturerApi = {
  // Authentication
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/manufacturer/login/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(error.message || `HTTP Error: ${response.status}`);
      }

      const data: LoginResponse = await response.json();
      
      // Store token with Bearer prefix
      if (data.token) {
        tokenManager.setToken('MANUFACTURER', data.token);
      }
      
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please ensure the backend is running and CORS is enabled.');
      }
      throw error;
    }
  },

  register: async (registrationData: RegisterRequest): Promise<RegisterResponse> => {
    const response = await fetch(`${API_BASE_URL}/manufacturer/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(error.message || `HTTP Error: ${response.status}`);
    }

    const data: RegisterResponse = await response.json();
    return data;
  },

  logout: () => {
    tokenManager.removeToken('MANUFACTURER');
  },

  // Inventory Management
  bulkUploadInventory: async (devices: InventoryDevice[]): Promise<BulkUploadResponse> => {
    const token = tokenManager.getToken('MANUFACTURER');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_BASE_URL}/manufacturer/inventory/bulk-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({ devices }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Bulk upload failed' }));
      throw new Error(error.message || `HTTP Error: ${response.status}`);
    }

    return await response.json();
  },

  getInventory: async (): Promise<GetInventoryResponse> => {
    const token = tokenManager.getToken('MANUFACTURER');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_BASE_URL}/manufacturer/inventory`, {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch inventory' }));
      throw new Error(error.message || `HTTP Error: ${response.status}`);
    }

    return await response.json();
  },
};
