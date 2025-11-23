package com.payment.dto;

import io.micronaut.serde.annotation.Serdeable;

import java.util.List;

/**
 * Generic paginated response wrapper
 */
@Serdeable
public class PaginatedResponse<T> {

    private List<T> data;
    private long totalCount;
    private int totalPages;
    private int currentPage;
    private int pageSize;

    // Constructors
    public PaginatedResponse() {
    }

    public PaginatedResponse(List<T> data, long totalCount, int totalPages, int currentPage, int pageSize) {
        this.data = data;
        this.totalCount = totalCount;
        this.totalPages = totalPages;
        this.currentPage = currentPage;
        this.pageSize = pageSize;
    }

    // Getters and Setters
    public List<T> getData() {
        return data;
    }

    public void setData(List<T> data) {
        this.data = data;
    }

    public long getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }
}

