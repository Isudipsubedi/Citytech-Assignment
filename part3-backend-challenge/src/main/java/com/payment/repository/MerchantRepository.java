package com.payment.repository;

import com.payment.entity.Merchant;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.jdbc.annotation.JdbcRepository;
import io.micronaut.data.model.Page;
import io.micronaut.data.model.Pageable;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Merchant entities.
 */
@Repository
@JdbcRepository(dialect = Dialect.POSTGRES)
public interface MerchantRepository extends CrudRepository<Merchant, String> {

    /**
     * Find all merchants with pagination
     */
    Page<Merchant> findAll(Pageable pageable);

    /**
     * Find merchants by status with pagination
     */
    Page<Merchant> findByStatus(String status, Pageable pageable);

    /**
     * Find merchants by status
     */
    List<Merchant> findByStatus(String status);

    /**
     * Check if merchant exists by email
     */
    boolean existsByEmail(String email);
}

