package com.payment.service;

import com.payment.dto.MerchantRequest;
import com.payment.dto.MerchantResponse;
import com.payment.dto.PaginatedResponse;
import com.payment.entity.Merchant;
import com.payment.exception.NotFoundException;
import com.payment.repository.MerchantRepository;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service implementation for merchant operations
 */
@Singleton
public class MerchantServiceImpl implements MerchantService {

    private static final Logger LOG = LoggerFactory.getLogger(MerchantServiceImpl.class);
    private final MerchantRepository merchantRepository;

    public MerchantServiceImpl(MerchantRepository merchantRepository) {
        this.merchantRepository = merchantRepository;
    }

    @Override
    public PaginatedResponse<MerchantResponse> getMerchants(
        int page,
        int size,
        String search,
        String status
    ) {
        LOG.debug("Getting merchants - page: {}, size: {}, search: {}, status: {}", page, size, search, status);

        // Adjust page to 0-based for Micronaut Data
        int pageNumber = Math.max(0, page - 1);
        io.micronaut.data.model.Pageable pageable = io.micronaut.data.model.Pageable.from(pageNumber, size);

        io.micronaut.data.model.Page<Merchant> merchantPage;

        // Apply filters
        if (status != null && !status.trim().isEmpty()) {
            merchantPage = merchantRepository.findByStatus(status, pageable);
        } else {
            merchantPage = merchantRepository.findAll(pageable);
        }

        // Apply search filter if provided
        List<Merchant> merchants = merchantPage.getContent();
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            merchants = merchants.stream()
                .filter(m -> 
                    (m.getName() != null && m.getName().toLowerCase().contains(searchLower)) ||
                    (m.getId() != null && m.getId().toLowerCase().contains(searchLower)) ||
                    (m.getEmail() != null && m.getEmail().toLowerCase().contains(searchLower))
                )
                .collect(Collectors.toList());
        }

        // Convert to response DTOs
        List<MerchantResponse> responses = merchants.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());

        // Calculate pagination info
        long totalCount = merchantPage.getTotalSize();
        int totalPages = (int) Math.ceil((double) totalCount / size);

        return new PaginatedResponse<>(
            responses,
            totalCount,
            totalPages,
            page,
            size
        );
    }

    @Override
    public MerchantResponse getMerchantById(String id) {
        LOG.debug("Getting merchant by ID: {}", id);
        Merchant merchant = merchantRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Merchant not found with ID: " + id));
        return toResponse(merchant);
    }

    @Override
    public MerchantResponse createMerchant(MerchantRequest request) {
        LOG.debug("Creating merchant: {}", request.getName());

        // Generate merchant ID
        String merchantId = generateMerchantId();

        // Check if email already exists
        if (merchantRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Merchant with email " + request.getEmail() + " already exists");
        }

        Merchant merchant = new Merchant();
        merchant.setId(merchantId);
        merchant.setName(request.getName());
        merchant.setEmail(request.getEmail());
        merchant.setPhone(request.getPhone());
        merchant.setBusinessName(request.getBusinessName());
        merchant.setRegistrationNumber(request.getRegistrationNumber());
        merchant.setAddress(request.getAddress());
        merchant.setCity(request.getCity());
        merchant.setCountry(request.getCountry());
        merchant.setStatus(request.getStatus());
        merchant.setCreatedAt(Instant.now());
        merchant.setUpdatedAt(Instant.now());

        Merchant saved = merchantRepository.save(merchant);
        LOG.info("Created merchant with ID: {}", saved.getId());
        return toResponse(saved);
    }

    @Override
    public MerchantResponse updateMerchant(String id, MerchantRequest request) {
        LOG.debug("Updating merchant with ID: {}", id);

        Merchant merchant = merchantRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Merchant not found with ID: " + id));

        // Check if email is being changed and if new email already exists
        if (!merchant.getEmail().equals(request.getEmail()) && 
            merchantRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Merchant with email " + request.getEmail() + " already exists");
        }

        // Update fields
        merchant.setName(request.getName());
        merchant.setEmail(request.getEmail());
        merchant.setPhone(request.getPhone());
        merchant.setBusinessName(request.getBusinessName());
        merchant.setRegistrationNumber(request.getRegistrationNumber());
        merchant.setAddress(request.getAddress());
        merchant.setCity(request.getCity());
        merchant.setCountry(request.getCountry());
        merchant.setStatus(request.getStatus());
        merchant.setUpdatedAt(Instant.now());

        Merchant updated = merchantRepository.update(merchant);
        LOG.info("Updated merchant with ID: {}", updated.getId());
        return toResponse(updated);
    }

    @Override
    public void deleteMerchant(String id) {
        LOG.debug("Deleting merchant with ID: {}", id);

        Merchant merchant = merchantRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Merchant not found with ID: " + id));

        merchantRepository.delete(merchant);
        LOG.info("Deleted merchant with ID: {}", id);
    }

    /**
     * Convert Merchant entity to MerchantResponse DTO
     */
    private MerchantResponse toResponse(Merchant merchant) {
        MerchantResponse response = new MerchantResponse();
        response.setId(merchant.getId());
        response.setName(merchant.getName());
        response.setEmail(merchant.getEmail());
        response.setPhone(merchant.getPhone());
        response.setBusinessName(merchant.getBusinessName());
        response.setRegistrationNumber(merchant.getRegistrationNumber());
        response.setAddress(merchant.getAddress());
        response.setCity(merchant.getCity());
        response.setCountry(merchant.getCountry());
        response.setStatus(merchant.getStatus());
        response.setCreatedAt(merchant.getCreatedAt());
        response.setUpdatedAt(merchant.getUpdatedAt());
        return response;
    }

    /**
     * Generate a new merchant ID in format MCH-XXXXX
     */
    private String generateMerchantId() {
        // Get the highest existing merchant number
        long maxNumber = merchantRepository.findAll()
            .stream()
            .mapToLong(m -> {
                try {
                    if (m.getId() != null && m.getId().startsWith("MCH-")) {
                        String numStr = m.getId().substring(4);
                        return Long.parseLong(numStr);
                    }
                } catch (NumberFormatException e) {
                    // Ignore invalid IDs
                }
                return 0;
            })
            .max()
            .orElse(0);

        // Generate next ID
        long nextNumber = maxNumber + 1;
        return String.format("MCH-%05d", nextNumber);
    }
}

