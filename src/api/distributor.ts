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

// Distributor API endpoints
export const distributorApi = {
  login: async (credentials: DistributorLoginRequest): Promise<DistributorLoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/distributor/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      tokenManager.setToken('DISTRIBUTOR', data.token);
      return data;
    }

    throw new Error(data.message || 'Distributor login failed');
  },

  logout: () => {
    tokenManager.removeToken('DISTRIBUTOR');
  },
};
