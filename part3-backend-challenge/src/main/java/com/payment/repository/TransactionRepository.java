package com.payment.repository;

import com.payment.entity.TransactionMaster;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.jdbc.annotation.JdbcRepository;
import io.micronaut.data.model.Page;
import io.micronaut.data.model.Pageable;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.repository.CrudRepository;

import java.time.Instant;
import java.util.List;

/**
 * Repository for TransactionMaster entities.
 */
@Repository
@JdbcRepository(dialect = Dialect.POSTGRES)
public interface TransactionRepository extends CrudRepository<TransactionMaster, Long> {

    /**
     * Find transactions by merchant ID
     */
    List<TransactionMaster> findByMerchantId(String merchantId);

    /**
     * Find transactions by merchant ID with pagination
     */
    Page<TransactionMaster> findByMerchantId(String merchantId, Pageable pageable);

    /**
     * Find transactions by merchant ID and status with pagination
     */
    Page<TransactionMaster> findByMerchantIdAndStatus(String merchantId, String status, Pageable pageable);

    /**
     * Find transactions by merchant ID and date range with pagination
     */
    Page<TransactionMaster> findByMerchantIdAndLocalTxnDateTimeBetween(
        String merchantId, 
        Instant startDate, 
        Instant endDate, 
        Pageable pageable
    );

    /**
     * Find transactions by merchant ID, status, and date range with pagination
     */
    Page<TransactionMaster> findByMerchantIdAndStatusAndLocalTxnDateTimeBetween(
        String merchantId, 
        String status, 
        Instant startDate, 
        Instant endDate, 
        Pageable pageable
    );

    /**
     * Count transactions by merchant ID
     */
    long countByMerchantId(String merchantId);

    /**
     * Count transactions by merchant ID and status
     */
    long countByMerchantIdAndStatus(String merchantId, String status);

    /**
     * Count transactions by merchant ID and date range
     */
    long countByMerchantIdAndLocalTxnDateTimeBetween(String merchantId, Instant startDate, Instant endDate);
}
