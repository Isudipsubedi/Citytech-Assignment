package com.payment.controller;

import com.payment.dto.MerchantTransactionsResponse;
import com.payment.service.TransactionService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import io.micronaut.validation.Validated;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

import java.util.Optional;

/**
 * Transaction Controller for merchant transactions
 */
@Controller("/api/v1/merchants")
@Tag(name = "Transactions", description = "Merchant transaction management API")
@Validated
public class TransactionController {

    private final TransactionService transactionService;
    
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @Get("/{merchantId}/transactions")
    @Operation(
        summary = "Get merchant transactions",
        description = "Returns paginated list of transactions for a merchant with optional filtering by date range and status"
    )
    @ApiResponse(responseCode = "200", description = "Successfully retrieved transactions")
    @ApiResponse(responseCode = "400", description = "Invalid input parameters")
    @ApiResponse(responseCode = "404", description = "Merchant not found")
    public HttpResponse<MerchantTransactionsResponse> getTransactions(
        @Parameter(description = "Merchant ID", example = "MCH-00001") 
        @PathVariable String merchantId,
        
        @Parameter(description = "Page number (0-based)", example = "0") 
        @QueryValue(defaultValue = "0") 
        @Min(0) 
        int page,
        
        @Parameter(description = "Page size", example = "20") 
        @QueryValue(defaultValue = "20") 
        @Min(1) 
        int size,
        
        @Parameter(description = "Start date (ISO format or YYYY-MM-DD)", example = "2025-11-01") 
        @QueryValue 
        Optional<String> startDate,
        
        @Parameter(description = "End date (ISO format or YYYY-MM-DD)", example = "2025-11-18") 
        @QueryValue 
        Optional<String> endDate,
        
        @Parameter(description = "Filter by status (pending, completed, failed, reversed)") 
        @QueryValue 
        Optional<String> status
    ) {
        // Validate date range if both dates are provided
        if (startDate.isPresent() && endDate.isPresent()) {
            String start = startDate.get();
            String end = endDate.get();
            // Basic validation - in production, parse and compare actual dates
            if (start.compareTo(end) > 0) {
                throw new IllegalArgumentException("Start date must be before or equal to end date");
            }
        }
        
        // Validate status if provided
        if (status.isPresent()) {
            String statusValue = status.get();
            if (!statusValue.matches("^(pending|completed|failed|reversed)$")) {
                throw new IllegalArgumentException("Status must be one of: pending, completed, failed, reversed");
            }
        }
        
        MerchantTransactionsResponse response = transactionService.getMerchantTransactions(
            merchantId,
            page,
            size,
            startDate.orElse(null),
            endDate.orElse(null),
            status.orElse(null)
        );
        return HttpResponse.ok(response);
    }
}
