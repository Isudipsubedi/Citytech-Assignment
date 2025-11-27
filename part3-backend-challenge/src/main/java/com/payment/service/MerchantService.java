package com.payment.service;

import com.payment.dto.MerchantRequest;
import com.payment.dto.MerchantResponse;
import com.payment.dto.PaginatedResponse;

/**
 * Service interface for merchant operations
 */
public interface MerchantService {

    /**
     * Get paginated list of merchants with optional search, filter, and sorting
     */
    PaginatedResponse<MerchantResponse> getMerchants(
        int page,
        int size,
        String search,
        String status,
        String sortField,
        String sortDirection
    );

    /**
     * Get merchant by ID
     */
    MerchantResponse getMerchantById(String id);

    /**
     * Create a new merchant
     */
    MerchantResponse createMerchant(MerchantRequest request);

    /**
     * Update an existing merchant
     */
    MerchantResponse updateMerchant(String id, MerchantRequest request);

    /**
     * Delete a merchant
     */
    void deleteMerchant(String id);
}

