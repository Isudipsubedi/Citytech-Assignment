package com.payment.service;

import com.payment.dto.*;
import com.payment.entity.Member;
import com.payment.entity.TransactionDetail;
import com.payment.entity.TransactionMaster;
import com.payment.exception.NotFoundException;
import com.payment.repository.MemberRepository;
import com.payment.repository.MerchantRepository;
import com.payment.repository.TransactionDetailRepository;
import com.payment.repository.TransactionRepository;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service implementation for transaction operations
 */
@Singleton
public class TransactionServiceImpl implements TransactionService {

    private static final Logger LOG = LoggerFactory.getLogger(TransactionServiceImpl.class);
    private final TransactionRepository transactionRepository;
    private final TransactionDetailRepository transactionDetailRepository;
    private final MerchantRepository merchantRepository;
    private final MemberRepository memberRepository;

    public TransactionServiceImpl(
        TransactionRepository transactionRepository,
        TransactionDetailRepository transactionDetailRepository,
        MerchantRepository merchantRepository,
        MemberRepository memberRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.transactionDetailRepository = transactionDetailRepository;
        this.merchantRepository = merchantRepository;
        this.memberRepository = memberRepository;
    }

    @Override
    public MerchantTransactionsResponse getMerchantTransactions(
        String merchantId,
        int page,
        int size,
        String startDate,
        String endDate,
        String status
    ) {
        LOG.debug("Getting transactions for merchant: {}, page: {}, size: {}, startDate: {}, endDate: {}, status: {}", 
            merchantId, page, size, startDate, endDate, status);

        // Validate input parameters
        if (merchantId == null || merchantId.trim().isEmpty()) {
            throw new IllegalArgumentException("Merchant ID cannot be null or empty");
        }
        
        if (page < 0) {
            throw new IllegalArgumentException("Page number must be >= 0");
        }
        
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("Page size must be between 1 and 100");
        }

        // Validate merchant exists
        if (!merchantRepository.existsById(merchantId)) {
            throw new NotFoundException("Merchant not found with ID: " + merchantId);
        }

        // Parse dates
        Instant startInstant = parseDate(startDate, true);
        Instant endInstant = parseDate(endDate, false);

        // Adjust page to 0-based for Micronaut Data
        int pageNumber = Math.max(0, page);
        io.micronaut.data.model.Pageable pageable = io.micronaut.data.model.Pageable.from(pageNumber, size);

        // Fetch transactions with filters
        io.micronaut.data.model.Page<TransactionMaster> transactionPage;
        
        if (startInstant != null && endInstant != null) {
            if (status != null && !status.trim().isEmpty()) {
                transactionPage = transactionRepository.findByMerchantIdAndStatusAndLocalTxnDateTimeBetween(
                    merchantId, status, startInstant, endInstant, pageable
                );
            } else {
                transactionPage = transactionRepository.findByMerchantIdAndLocalTxnDateTimeBetween(
                    merchantId, startInstant, endInstant, pageable
                );
            }
        } else if (status != null && !status.trim().isEmpty()) {
            transactionPage = transactionRepository.findByMerchantIdAndStatus(merchantId, status, pageable);
        } else {
            transactionPage = transactionRepository.findByMerchantId(merchantId, pageable);
        }

        List<TransactionMaster> transactions = transactionPage.getContent();

        // Fetch transaction IDs to get details
        List<Long> txnIds = transactions.stream()
            .map(TransactionMaster::getTxnId)
            .collect(Collectors.toList());

        // Fetch all details for these transactions
        Map<Long, List<TransactionDetail>> detailsMap = new HashMap<>();
        if (!txnIds.isEmpty()) {
            List<TransactionDetail> allDetails = transactionDetailRepository.findByMasterTxnIdInList(txnIds);
            allDetails.forEach(detail -> {
                detailsMap.computeIfAbsent(detail.getMasterTxnId(), k -> new ArrayList<>()).add(detail);
            });
        }

        // Fetch member names for acquirer and issuer
        Map<Long, String> memberNames = new HashMap<>();
        Set<Long> memberIds = new HashSet<>();
        transactions.forEach(txn -> {
            if (txn.getGpAcquirerId() != null) memberIds.add(txn.getGpAcquirerId());
            if (txn.getGpIssuerId() != null) memberIds.add(txn.getGpIssuerId());
        });
        
        if (!memberIds.isEmpty()) {
            memberIds.forEach(id -> {
                memberRepository.findById(id).ifPresent(member -> 
                    memberNames.put(id, member.getMemberName())
                );
            });
        }

        // Convert to response DTOs
        List<TransactionResponse> transactionResponses = transactions.stream()
            .map(txn -> toTransactionResponse(txn, detailsMap.get(txn.getTxnId()), memberNames))
            .collect(Collectors.toList());

        // Calculate summary
        TransactionSummary summary = calculateSummary(merchantId, startInstant, endInstant, status);

        // Build date range
        DateRange dateRange = new DateRange(startInstant, endInstant);

        // Build pagination info
        long totalCount = transactionPage.getTotalSize();
        int totalPages = (int) Math.ceil((double) totalCount / size);
        PaginationInfo pagination = new PaginationInfo(page, size, totalPages, totalCount);

        // Build response
        MerchantTransactionsResponse response = new MerchantTransactionsResponse();
        response.setMerchantId(merchantId);
        response.setDateRange(dateRange);
        response.setSummary(summary);
        response.setTransactions(transactionResponses);
        response.setPagination(pagination);

        return response;
    }

    /**
     * Convert TransactionMaster to TransactionResponse DTO
     */
    private TransactionResponse toTransactionResponse(
        TransactionMaster txn, 
        List<TransactionDetail> details,
        Map<Long, String> memberNames
    ) {
        TransactionResponse response = new TransactionResponse();
        response.setTxnId(txn.getTxnId());
        response.setAmount(txn.getAmount());
        response.setCurrency(txn.getCurrency());
        response.setStatus(txn.getStatus());
        response.setTimestamp(txn.getLocalTxnDateTime());
        response.setCardType(txn.getCardType());
        response.setCardLast4(txn.getCardLast4());
        
        // Set acquirer and issuer names
        if (txn.getGpAcquirerId() != null) {
            response.setAcquirer(memberNames.getOrDefault(txn.getGpAcquirerId(), "Unknown"));
        }
        if (txn.getGpIssuerId() != null) {
            response.setIssuer(memberNames.getOrDefault(txn.getGpIssuerId(), "Unknown"));
        }

        // Convert details
        if (details != null && !details.isEmpty()) {
            List<TransactionDetailResponse> detailResponses = details.stream()
                .map(this::toTransactionDetailResponse)
                .collect(Collectors.toList());
            response.setDetails(detailResponses);
        } else {
            response.setDetails(Collections.emptyList());
        }

        return response;
    }

    /**
     * Convert TransactionDetail to TransactionDetailResponse DTO
     */
    private TransactionDetailResponse toTransactionDetailResponse(TransactionDetail detail) {
        TransactionDetailResponse response = new TransactionDetailResponse();
        response.setDetailId(detail.getTxnDetailId());
        response.setType(detail.getDetailType());
        response.setAmount(detail.getAmount());
        response.setCurrency(detail.getCurrency());
        response.setDescription(detail.getDescription());
        return response;
    }

    /**
     * Calculate transaction summary
     */
    private TransactionSummary calculateSummary(String merchantId, Instant startDate, Instant endDate, String status) {
        List<TransactionMaster> allTransactions;
        
        if (startDate != null && endDate != null) {
            if (status != null && !status.trim().isEmpty()) {
                allTransactions = transactionRepository.findByMerchantIdAndStatusAndLocalTxnDateTimeBetween(
                    merchantId, status, startDate, endDate, 
                    io.micronaut.data.model.Pageable.unpaged()
                ).getContent();
            } else {
                allTransactions = transactionRepository.findByMerchantIdAndLocalTxnDateTimeBetween(
                    merchantId, startDate, endDate, 
                    io.micronaut.data.model.Pageable.unpaged()
                ).getContent();
            }
        } else if (status != null && !status.trim().isEmpty()) {
            allTransactions = transactionRepository.findByMerchantIdAndStatus(
                merchantId, status, 
                io.micronaut.data.model.Pageable.unpaged()
            ).getContent();
        } else {
            allTransactions = transactionRepository.findByMerchantId(merchantId);
        }

        // Calculate totals
        long totalCount = allTransactions.size();
        BigDecimal totalAmount = allTransactions.stream()
            .map(TransactionMaster::getAmount)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        String currency = allTransactions.stream()
            .map(TransactionMaster::getCurrency)
            .filter(Objects::nonNull)
            .findFirst()
            .orElse("USD");

        // Count by status
        Map<String, Long> byStatus = allTransactions.stream()
            .collect(Collectors.groupingBy(
                txn -> txn.getStatus() != null ? txn.getStatus() : "unknown",
                Collectors.counting()
            ));

        return new TransactionSummary(totalCount, totalAmount, currency, byStatus);
    }

    /**
     * Parse date string to Instant
     */
    private Instant parseDate(String dateStr, boolean isStart) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return null;
        }

        try {
            // Try ISO format first
            if (dateStr.contains("T")) {
                return Instant.parse(dateStr);
            }
            
            // Try date only format (YYYY-MM-DD)
            LocalDate localDate = LocalDate.parse(dateStr, DateTimeFormatter.ISO_DATE);
            if (isStart) {
                return localDate.atStartOfDay().toInstant(ZoneOffset.UTC);
            } else {
                return localDate.atTime(23, 59, 59).toInstant(ZoneOffset.UTC);
            }
        } catch (DateTimeParseException e) {
            LOG.warn("Invalid date format: {}, error: {}", dateStr, e.getMessage());
            return null;
        }
    }
}

