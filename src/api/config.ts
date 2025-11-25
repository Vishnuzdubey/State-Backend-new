// API Base URL Configuration
export const API_BASE_URL = 'https://be.tracker.theroadeye.com/api/v1';

// Token Storage Keys
export const TOKEN_KEYS = {
  MANUFACTURER: 'manufacturer_token',
  DISTRIBUTOR: 'distributor_token',
  RFC: 'rfc_token',
  SUPER_ADMIN: 'super_admin_token',
} as const;

// Token Management
export const tokenManager = {
  setToken: (role: keyof typeof TOKEN_KEYS, token: string) => {
    localStorage.setItem(TOKEN_KEYS[role], `Bearer ${token}`);
  },
  
  getToken: (role: keyof typeof TOKEN_KEYS): string | null => {
    return localStorage.getItem(TOKEN_KEYS[role]);
  },
  
  removeToken: (role: keyof typeof TOKEN_KEYS) => {
    localStorage.removeItem(TOKEN_KEYS[role]);
  },
};
