package com.payment.dto;

import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * DTO for transaction response
 */
@Serdeable
public class TransactionResponse {

    private Long txnId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private Instant timestamp;
    private String cardType;
    private String cardLast4;
    private String acquirer;
    private String issuer;
    private List<TransactionDetailResponse> details;

    // Constructors
    public TransactionResponse() {
    }

    // Getters and Setters
    public Long getTxnId() {
        return txnId;
    }

    public void setTxnId(Long txnId) {
        this.txnId = txnId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getCardType() {
        return cardType;
    }

    public void setCardType(String cardType) {
        this.cardType = cardType;
    }

    public String getCardLast4() {
        return cardLast4;
    }

    public void setCardLast4(String cardLast4) {
        this.cardLast4 = cardLast4;
    }

    public String getAcquirer() {
        return acquirer;
    }

    public void setAcquirer(String acquirer) {
        this.acquirer = acquirer;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    public List<TransactionDetailResponse> getDetails() {
        return details;
    }

    public void setDetails(List<TransactionDetailResponse> details) {
        this.details = details;
    }
}

