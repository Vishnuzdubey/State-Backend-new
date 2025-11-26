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

// RFC API endpoints
export const rfcApi = {
  login: async (credentials: RFCLoginRequest): Promise<RFCLoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/rfc/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      mode: 'cors',
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      tokenManager.setToken('RFC', data.token);
      return data;
    }

    throw new Error(data.message || 'RFC login failed');
  },

  logout: () => {
    tokenManager.removeToken('RFC');
  },
};
