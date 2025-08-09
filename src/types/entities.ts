export interface Manufacturer {
  id: string;
  entityName: string;
  code: string;
  district: string;
  pinCode: string;
  status: 'active' | 'inactive';
  email: string;
  phone: string;
  address: string;
  remainingPoints?: number;
  kycDocuments?: string[];
  // Additional fields for new manufacturer creation
  firstName?: string;
  lastName?: string;
  businessEmail?: string;
  businessMobile?: string;
  gstNo?: string;
  panNo?: string;
  area?: string;
  state?: string;
  country?: string;
}

export interface Distributor {
  id: string;
  entityName: string;
  code: string;
  district: string;
  pinCode: string;
  email: string;
  phone: string;
  address: string;
  assignedManufacturers: string[];
}

export interface RFC {
  id: string;
  name: string;
  code: string;
  district: string;
  pinCode: string;
  email: string;
  phone: string;
  address: string;
  linkedVehicles: string[];
}

export interface Device {
  id: string;
  serialNo: string;
  imei: string;
  modelCode: string;
  status: 'active' | 'inactive' | 'expired' | 'pending';
  assignedTo: string;
  assignedToType: 'manufacturer' | 'distributor' | 'rfc';
  activationDate?: string;
  expiryDate?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface DashboardMetrics {
  activeDevices: number;
  inventoryUploaded: number;
  activations: number;
  devicesExpiring: number;
  expiredDevices: number;
  pendingApprovals: number;
}