package com.payment.dto;

import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;

/**
 * DTO for transaction detail response
 */
@Serdeable
public class TransactionDetailResponse {

    private Long detailId;
    private String type;
    private BigDecimal amount;
    private String currency;
    private String description;

    // Constructors
    public TransactionDetailResponse() {
    }

    public TransactionDetailResponse(Long detailId, String type, BigDecimal amount, String currency, String description) {
        this.detailId = detailId;
        this.type = type;
        this.amount = amount;
        this.currency = currency;
        this.description = description;
    }

    // Getters and Setters
    public Long getDetailId() {
        return detailId;
    }

    public void setDetailId(Long detailId) {
        this.detailId = detailId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}

