export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  // Manufacturer specific fields
  gst?: string;
  pan?: string;
  fullname_user?: string;
  phone?: string;
  address?: string;
  pincode?: string;
  district?: string;
  state?: string;
  status?: string;
  gst_doc?: string | null;
  balance_sheet_doc?: string | null;
  address_proof_doc?: string | null;
  pan_doc?: string | null;
  user_pan_doc?: string | null;
  user_address_proof_doc?: string | null;
  createdAt?: string;
}

export type UserRole = 'super-admin' | 'manufacturer' | 'distributor' | 'rfc';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}