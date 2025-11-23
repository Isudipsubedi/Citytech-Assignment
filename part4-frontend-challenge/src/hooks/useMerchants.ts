import { useState, useCallback } from 'react';
import { Merchant, MerchantFormData } from '../types/merchant';
import { 
  getMerchants, 
  getMerchantById, 
  createMerchant, 
  updateMerchant, 
  deleteMerchant 
} from '../services/merchantService';

interface UseMerchantsOptions {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

/**
 * Custom hook for managing merchant state and operations
 * Centralizes merchant-related state management and API calls
 */
export const useMerchants = (options?: UseMerchantsOptions) => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  /**
   * Fetch merchants with pagination
   */
  const fetchMerchants = useCallback(async (page: number = 1, limit: number = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMerchants({ page, limit });
      setMerchants(response.merchants);
      
      // Update total count - if we got less than pageSize, we know the exact count
      if (response.merchants.length < limit) {
        setTotalCount((page - 1) * limit + response.merchants.length);
      } else {
        setTotalCount(response.totalCount);
      }
      
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load merchants';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  /**
   * Fetch a single merchant by ID
   */
  const fetchMerchantById = useCallback(async (id: string): Promise<Merchant> => {
    setLoading(true);
    setError(null);
    try {
      const merchant = await getMerchantById(id);
      return merchant;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load merchant details';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  /**
   * Create a new merchant
   */
  const addMerchant = useCallback(async (merchantData: MerchantFormData): Promise<Merchant> => {
    setLoading(true);
    setError(null);
    try {
      const newMerchant = await createMerchant(merchantData);
      options?.onSuccess?.('Merchant created successfully!');
      return newMerchant;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create merchant';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  /**
   * Update an existing merchant
   */
  const updateMerchantById = useCallback(async (
    id: string, 
    merchantData: Partial<MerchantFormData>
  ): Promise<Merchant> => {
    setLoading(true);
    setError(null);
    try {
      const updatedMerchant = await updateMerchant(id, merchantData);
      options?.onSuccess?.('Merchant updated successfully!');
      return updatedMerchant;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update merchant';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  /**
   * Delete a merchant
   */
  const removeMerchant = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await deleteMerchant(id);
      options?.onSuccess?.('Merchant deleted successfully!');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete merchant';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    merchants,
    loading,
    error,
    totalCount,
    fetchMerchants,
    fetchMerchantById,
    addMerchant,
    updateMerchantById,
    removeMerchant,
    setError,
  };
};

