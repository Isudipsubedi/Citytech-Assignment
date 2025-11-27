package com.payment.controller;

import com.payment.dto.MerchantRequest;
import com.payment.dto.MerchantResponse;
import com.payment.dto.PaginatedResponse;
import com.payment.service.MerchantService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import io.micronaut.validation.Validated;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import java.util.Optional;

/**
 * Controller for merchant management endpoints
 */
@Controller("/api/v1/merchants")
@Tag(name = "Merchants", description = "Merchant management API")
@Validated
public class MerchantController {

    private final MerchantService merchantService;

    public MerchantController(MerchantService merchantService) {
        this.merchantService = merchantService;
    }

    @Get
    @Operation(
        summary = "Get all merchants",
        description = "Retrieve a paginated list of merchants with optional search, filter, and sorting"
    )
    @ApiResponse(responseCode = "200", description = "Successfully retrieved merchants")
    public HttpResponse<PaginatedResponse<MerchantResponse>> getMerchants(
        @Parameter(description = "Page number (1-based)", example = "1") @QueryValue(defaultValue = "1") int page,
        @Parameter(description = "Page size", example = "20") @QueryValue(defaultValue = "20") int limit,
        @Parameter(description = "Search term (name, ID, or email)") @QueryValue Optional<String> search,
        @Parameter(description = "Filter by status (active/inactive)") @QueryValue Optional<String> status,
        @Parameter(description = "Sort field (name, email, status, createdAt, updatedAt)", example = "name") @QueryValue Optional<String> sortField,
        @Parameter(description = "Sort direction (asc, desc)", example = "asc") @QueryValue Optional<String> sortDirection
    ) {
        PaginatedResponse<MerchantResponse> response = merchantService.getMerchants(
            page, 
            limit, 
            search.orElse(null), 
            status.orElse(null),
            sortField.orElse("name"),
            sortDirection.orElse("asc")
        );
        return HttpResponse.ok(response);
    }

    @Get("/{id}")
    @Operation(
        summary = "Get merchant by ID",
        description = "Retrieve a single merchant by its ID"
    )
    @ApiResponse(responseCode = "200", description = "Merchant found")
    @ApiResponse(responseCode = "404", description = "Merchant not found")
    public HttpResponse<MerchantResponse> getMerchantById(
        @Parameter(description = "Merchant ID", example = "MCH-00001") String id
    ) {
        MerchantResponse merchant = merchantService.getMerchantById(id);
        return HttpResponse.ok(merchant);
    }

    @Post
    @Operation(
        summary = "Create a new merchant",
        description = "Create a new merchant with the provided details"
    )
    @ApiResponse(responseCode = "201", description = "Merchant created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    public HttpResponse<MerchantResponse> createMerchant(
        @Body @Valid MerchantRequest request
    ) {
        MerchantResponse merchant = merchantService.createMerchant(request);
        return HttpResponse.created(merchant);
    }

    @Put("/{id}")
    @Operation(
        summary = "Update a merchant",
        description = "Update an existing merchant's details"
    )
    @ApiResponse(responseCode = "200", description = "Merchant updated successfully")
    @ApiResponse(responseCode = "404", description = "Merchant not found")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    public HttpResponse<MerchantResponse> updateMerchant(
        @Parameter(description = "Merchant ID", example = "MCH-00001") String id,
        @Body @Valid MerchantRequest request
    ) {
        MerchantResponse merchant = merchantService.updateMerchant(id, request);
        return HttpResponse.ok(merchant);
    }

    @Delete("/{id}")
    @Operation(
        summary = "Delete a merchant",
        description = "Delete a merchant by its ID"
    )
    @ApiResponse(responseCode = "204", description = "Merchant deleted successfully")
    @ApiResponse(responseCode = "404", description = "Merchant not found")
    public HttpResponse<Void> deleteMerchant(
        @Parameter(description = "Merchant ID", example = "MCH-00001") String id
    ) {
        merchantService.deleteMerchant(id);
        return HttpResponse.noContent();
    }
}

