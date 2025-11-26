import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '@/types';
import { manufacturerApi, superAdminApi, distributorApi, rfcApi } from '@/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    console.log('🔐 Starting login attempt for:', email);

    // Try Super Admin login first
    try {
      console.log('🔍 Trying Super Admin login...');
      const response = await superAdminApi.login({ email, password });

      if (response.status === 'success' && response.user) {
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.fullname,
          role: 'super-admin',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuperAdmin'
        };

        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('user_role', 'super-admin');
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
        console.log('✅ Super Admin login successful');
        return true;
      }
    } catch (error) {
      console.log('❌ Super Admin login failed, trying next...');
    }

    // Try Manufacturer login
    try {
      console.log('🔍 Trying Manufacturer login...');
      const response = await manufacturerApi.login({ email, password });

      if (response.status === 'success' && response.user) {
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
        localStorage.setItem('user_role', 'manufacturer');
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
        console.log('✅ Manufacturer login successful');
        return true;
      }
    } catch (error) {
      console.log('❌ Manufacturer login failed, trying next...');
    }

    // Try Distributor login
    try {
      console.log('🔍 Trying Distributor login...');
      const response = await distributorApi.login({ email, password });

      if (response.status === 'success' && response.user) {
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name || response.user.fullname || 'Distributor User',
          role: 'distributor',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Distributor'
        };

        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('user_role', 'distributor');
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
        console.log('✅ Distributor login successful');
        return true;
      }
    } catch (error) {
      console.log('❌ Distributor login failed, trying next...');
    }

    // Try RFC login
    try {
      console.log('🔍 Trying RFC login...');
      const response = await rfcApi.login({ email, password });

      if (response.status === 'success' && response.user) {
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name || response.user.fullname || 'RFC User',
          role: 'rfc',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RFC'
        };

        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('user_role', 'rfc');
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
        console.log('✅ RFC login successful');
        return true;
      }
    } catch (error) {
      console.log('❌ RFC login failed');
    }

    console.error('❌ All login attempts failed');
    return false;
  };

  const logout = () => {
    const userRole = localStorage.getItem('user_role');

    // Clear tokens based on role
    switch (userRole) {
      case 'super-admin':
        superAdminApi.logout();
        break;
      case 'manufacturer':
        manufacturerApi.logout();
        break;
      case 'distributor':
        distributorApi.logout();
        break;
      case 'rfc':
        rfcApi.logout();
        break;
    }

    localStorage.removeItem('auth_user');
    localStorage.removeItem('user_role');
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