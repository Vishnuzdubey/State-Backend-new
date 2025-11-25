import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '@/types';
import { manufacturerApi } from '@/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for development (shown in login form only)
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'superadmin@RoadEye.com',
    name: 'Super Admin',
    role: 'super-admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuperAdmin'
  },
  {
    id: '2',
    email: 'manufacturer@RoadEye.com',
    name: 'Manufacturer User',
    role: 'manufacturer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manufacturer',
    status: 'APPROVED' // For demo purposes
  },
  {
    id: '3',
    email: 'distributor@RoadEye.com',
    name: 'Distributor User',
    role: 'distributor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Distributor'
  },
  {
    id: '4',
    email: 'rfc@RoadEye.com',
    name: 'RFC User',
    role: 'rfc',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RFC'
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check for stored auth data
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } catch {
        localStorage.removeItem('auth_user');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await manufacturerApi.login({ email, password });

      if (response.status === 'success' && response.user) {
        // Store complete user data from API
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: 'manufacturer',
          avatar: undefined,
          gst: response.user.gst,
          pan: response.user.pan,
          fullname_user: response.user.fullname_user,
          phone: response.user.phone,
          address: response.user.address,
          pincode: response.user.pincode,
          district: response.user.district,
          state: response.user.state,
          status: response.user.status,
          gst_doc: response.user.gst_doc,
          balance_sheet_doc: response.user.balance_sheet_doc,
          address_proof_doc: response.user.address_proof_doc,
          pan_doc: response.user.pan_doc,
          user_pan_doc: response.user.user_pan_doc,
          user_address_proof_doc: response.user.user_address_proof_doc,
          createdAt: response.user.createdAt
        };

        localStorage.setItem('auth_user', JSON.stringify(user));
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    manufacturerApi.logout();
    localStorage.removeItem('auth_user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}