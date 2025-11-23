// Merchant-related types and interfaces

export interface Merchant {
  id?: string;
  name: string;
  email: string;
  phone: string;
  businessName?: string;
  registrationNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface MerchantFormData {
  name: string;
  email: string;
  phone: string;
  businessName?: string;
  registrationNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  status: 'active' | 'inactive';
}

export interface MerchantResponse {
  data: Merchant[];
  total?: number;
}

