package com.payment.dto;

import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.util.Map;

/**
 * DTO for transaction summary
 */
@Serdeable
public class TransactionSummary {

    private Long totalTransactions;
    private BigDecimal totalAmount;
    private String currency;
    private Map<String, Long> byStatus;

    // Constructors
    public TransactionSummary() {
    }

    public TransactionSummary(Long totalTransactions, BigDecimal totalAmount, String currency, Map<String, Long> byStatus) {
        this.totalTransactions = totalTransactions;
        this.totalAmount = totalAmount;
        this.currency = currency;
        this.byStatus = byStatus;
    }

    // Getters and Setters
    public Long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(Long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Map<String, Long> getByStatus() {
        return byStatus;
    }

    public void setByStatus(Map<String, Long> byStatus) {
        this.byStatus = byStatus;
    }
}

