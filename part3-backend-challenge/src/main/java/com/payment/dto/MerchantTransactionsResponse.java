package com.payment.dto;

import io.micronaut.serde.annotation.Serdeable;

import java.util.List;

/**
 * DTO for merchant transactions response
 */
@Serdeable
public class MerchantTransactionsResponse {

    private String merchantId;
    private DateRange dateRange;
    private TransactionSummary summary;
    private List<TransactionResponse> transactions;
    private PaginationInfo pagination;

    // Constructors
    public MerchantTransactionsResponse() {
    }

    // Getters and Setters
    public String getMerchantId() {
        return merchantId;
    }

    public void setMerchantId(String merchantId) {
        this.merchantId = merchantId;
    }

    public DateRange getDateRange() {
        return dateRange;
    }

    public void setDateRange(DateRange dateRange) {
        this.dateRange = dateRange;
    }

    public TransactionSummary getSummary() {
        return summary;
    }

    public void setSummary(TransactionSummary summary) {
        this.summary = summary;
    }

    public List<TransactionResponse> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<TransactionResponse> transactions) {
        this.transactions = transactions;
    }

    public PaginationInfo getPagination() {
        return pagination;
    }

    public void setPagination(PaginationInfo pagination) {
        this.pagination = pagination;
    }
}

