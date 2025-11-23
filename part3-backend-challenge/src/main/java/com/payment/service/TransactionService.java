package com.payment.service;

import com.payment.dto.MerchantTransactionsResponse;

/**
 * Service interface for transaction operations
 */
public interface TransactionService {

    /**
     * Get transactions for a merchant with pagination and filtering
     */
    MerchantTransactionsResponse getMerchantTransactions(
        String merchantId,
        int page,
        int size,
        String startDate,
        String endDate,
        String status
    );
}

