import { get, post, put, del } from './api';
import { Merchant, MerchantFormData } from '../types/merchant';

/**
 * Merchant Service
 * Handles all merchant-related API calls to the backend
 * 
 * Backend API Base URL: http://localhost:8080/api/v1
 * Configure via VITE_API_BASE_URL environment variable
 */

const MERCHANTS_ENDPOINT = '/merchants';

/**
 * Backend API response structure
 */
interface BackendPaginatedResponse {
  data: Merchant[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/**
 * Get merchants with pagination
 * GET /api/v1/merchants?page=1&limit=20
 */
export interface GetMerchantsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface GetMerchantsResponse {
  merchants: Merchant[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export const getMerchants = async (params?: GetMerchantsParams): Promise<GetMerchantsResponse> => {
  try {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const search = params?.search;
    const status = params?.status;
    
    const queryParams: any = {
      page: page,
      size: limit, // Backend uses 'size' instead of 'limit'
    };

    // Add optional search and status filters
    if (search) {
      queryParams.search = search;
    }
    if (status) {
      queryParams.status = status;
    }

    console.log(`[MerchantService] Fetching merchants - page: ${page}, size: ${limit}, search: ${search}, status: ${status}`);
    
    // Backend returns PaginatedResponse with data, totalCount, totalPages, etc.
    const response = await get<BackendPaginatedResponse>(MERCHANTS_ENDPOINT, { params: queryParams });
    
    // Map backend response to frontend format
    return {
      merchants: response.data || [],
      totalCount: response.totalCount || 0,
      totalPages: response.totalPages || 1,
      currentPage: response.currentPage || page,
      pageSize: response.pageSize || limit,
    };
  } catch (error) {
    console.error('Error fetching merchants:', error);
    throw error;
  }
};

/**
 * Get all merchants (for backward compatibility or when you need all)
 * GET /api/v1/merchants
 */
export const getAllMerchants = async (): Promise<Merchant[]> => {
  try {
    // Fetch all pages
    let allMerchants: Merchant[] = [];
    let currentPage = 1;
    let hasMore = true;
    const pageSize = 100;

    while (hasMore) {
      const response = await get<BackendPaginatedResponse>(MERCHANTS_ENDPOINT, {
        params: { page: currentPage, size: pageSize },
      });

      if (response.data && response.data.length > 0) {
        allMerchants = [...allMerchants, ...response.data];
        if (response.data.length < pageSize || currentPage >= (response.totalPages || 1)) {
          hasMore = false;
        } else {
          currentPage++;
        }
      } else {
        hasMore = false;
      }
    }

    return allMerchants;
  } catch (error) {
    console.error('Error fetching all merchants:', error);
    throw error;
  }
};

/**
 * Get a single merchant by ID
 * GET /api/v1/merchants/:id
 */
export const getMerchantById = async (id: string): Promise<Merchant> => {
  try {
    const response = await get<Merchant>(`${MERCHANTS_ENDPOINT}/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching merchant:', error);
    throw error;
  }
};

/**
 * Create a new merchant
 * POST /api/v1/merchants
 */
export const createMerchant = async (merchantData: MerchantFormData): Promise<Merchant> => {
  try {
    const response = await post<Merchant>(MERCHANTS_ENDPOINT, merchantData);
    return response;
  } catch (error) {
    console.error('Error creating merchant:', error);
    throw error;
  }
};

/**
 * Update an existing merchant
 * PUT /api/v1/merchants/:id
 */
export const updateMerchant = async (id: string, merchantData: Partial<MerchantFormData>): Promise<Merchant> => {
  try {
    console.log(`[MerchantService] PUT ${MERCHANTS_ENDPOINT}/${id}`, merchantData);
    const response = await put<Merchant>(`${MERCHANTS_ENDPOINT}/${id}`, merchantData);
    console.log('[MerchantService] Update response:', response);
    return response;
  } catch (error: any) {
    console.error('Error updating merchant:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

/**
 * Delete a merchant
 * DELETE /api/v1/merchants/:id
 */
export const deleteMerchant = async (id: string): Promise<void> => {
  try {
    await del(`${MERCHANTS_ENDPOINT}/${id}`);
  } catch (error) {
    console.error('Error deleting merchant:', error);
    throw error;
  }
};

export default {
  getMerchants,
  getMerchantById,
  createMerchant,
  updateMerchant,
  deleteMerchant,
};

