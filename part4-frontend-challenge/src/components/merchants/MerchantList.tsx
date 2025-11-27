import React, { useState, useEffect, useRef } from 'react';
import { Table } from '../common/Table';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { getMerchants } from '../../services/merchantService';
import { Merchant } from '../../types/merchant';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../utils/constants';
import './MerchantList.css';

type SortField = 'name' | 'email' | 'status' | 'createdAt' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

interface MerchantListProps {
  refreshTrigger?: number;
  onEdit?: (merchant: Merchant) => void;
  onView?: (merchant: Merchant) => void;
  onDelete?: (merchant: Merchant) => void;
  onCreateClick?: () => void;
}

export const MerchantList: React.FC<MerchantListProps> = ({ refreshTrigger = 0, onEdit, onView, onDelete, onCreateClick }) => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Search and filter state
  // Use separate state for input value (immediate) and debounced search query (for API)
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Debounce search input - update searchQuery after user stops typing
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout to update searchQuery after 500ms of no typing
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1); // Reset to page 1 when search changes
    }, 500);

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput]);

  // Reset to page 1 and clear filters when refreshTrigger changes (after create/update/delete)
  // This ensures new/updated merchants appear in the list immediately
  useEffect(() => {
    if (refreshTrigger > 0) {
      // Clear search and filters so the new/updated merchant is visible
      setSearchInput('');
      setSearchQuery('');
      setStatusFilter('');
      setCurrentPage(1);
    }
  }, [refreshTrigger]);

  // Fetch merchants with pagination and sorting (backend handles sorting)
  useEffect(() => {
    const fetchMerchants = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`[MerchantList] Fetching page ${currentPage} with pageSize ${pageSize}, search: "${searchQuery}", status: "${statusFilter}", sortField: "${sortField}", sortDirection: "${sortDirection}"`);
        const response = await getMerchants({
          page: currentPage,
          limit: pageSize,
          search: searchQuery || undefined,
          status: statusFilter || undefined,
          sortField: sortField,
          sortDirection: sortDirection,
        });
        setMerchants(response.merchants);
        // Update total count - if we got less than pageSize, we know the exact count
        if (response.merchants.length < pageSize) {
          // This is the last page, so we know the exact total
          setTotalCount((currentPage - 1) * pageSize + response.merchants.length);
        } else {
          // We got a full page, update minimum estimate
          setTotalCount(response.totalCount);
        }
      } catch (err) {
        setError('Failed to load merchants. Please try again.');
        console.error('Error fetching merchants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchants();
  }, [refreshTrigger, currentPage, pageSize, searchQuery, statusFilter, sortField, sortDirection]);

  // Backend handles sorting, so we use merchants directly
  const paginatedMerchants = merchants;
  
  // Calculate total pages from server total count
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page on sort
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="merchant-list-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="merchant-list-container">
        <div className="merchant-list-error">
          <p>{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="merchant-list-container">
      {/* Search and Filter Section with Create Button */}
      <div className="merchant-list-filters">
        <div className="filters-left">
          <div className="filter-group">
            <Input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
              }}
              style={{ minWidth: '250px' }}
            />
          </div>
          
          <div className="filter-group">
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ minWidth: '150px' }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="filter-group">
            <Button variant="outline" size="small" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          </div>
        </div>

        {onCreateClick && (
          <div className="filters-right">
            <Button
              variant="primary"
              size="large"
              onClick={onCreateClick}
            >
              ➕ Add New Merchant
            </Button>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="merchant-list-table">
        <Table>
          <thead>
            <tr>
              <th>
                <button
                  className="sortable-header"
                  onClick={() => handleSort('name')}
                >
                  Name
                  {sortField === 'name' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </button>
              </th>
              <th>
                <button
                  className="sortable-header"
                  onClick={() => handleSort('email')}
                >
                  Email
                  {sortField === 'email' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </button>
              </th>
              <th>Phone</th>
              <th>Business Name</th>
              <th>
                <button
                  className="sortable-header"
                  onClick={() => handleSort('status')}
                >
                  Status
                  {sortField === 'status' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </button>
              </th>
              <th>
                <button
                  className="sortable-header"
                  onClick={() => handleSort('createdAt')}
                >
                  Created
                  {sortField === 'createdAt' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </button>
              </th>
              <th>
                <button
                  className="sortable-header"
                  onClick={() => handleSort('updatedAt')}
                >
                  Updated
                  {sortField === 'updatedAt' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMerchants.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-state">
                  No merchants found
                </td>
              </tr>
            ) : (
              paginatedMerchants.map((merchant) => (
                <tr key={merchant.id}>
                  <td>
                    <div className="merchant-name-cell">
                      <strong>{merchant.name}</strong>
                      {merchant.id && (
                        <span className="merchant-id">ID: {merchant.id}</span>
                      )}
                    </div>
                  </td>
                  <td>{merchant.email}</td>
                  <td>{merchant.phone}</td>
                  <td>{merchant.businessName || '-'}</td>
                  <td>
                    <span className={`status-badge status-${merchant.status}`}>
                      {merchant.status}
                    </span>
                  </td>
                  <td>
                    {merchant.createdAt
                      ? new Date(merchant.createdAt).toLocaleDateString()
                      : '-'}
                  </td>
                  <td>
                    {merchant.updatedAt
                      ? new Date(merchant.updatedAt).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      {onView && (
                        <button
                          className="action-button view-button"
                          onClick={() => onView(merchant)}
                          title="View merchant details"
                          aria-label="View merchant details"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                      )}
                      {onEdit && (
                        <button
                          className="action-button edit-button"
                          onClick={() => onEdit(merchant)}
                          title="Edit merchant"
                          aria-label="Edit merchant"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          className="action-button delete-button"
                          onClick={() => onDelete(merchant)}
                          title="Delete merchant"
                          aria-label="Delete merchant"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination Section */}
      {paginatedMerchants.length > 0 && (
        <div className="merchant-list-pagination">
          <div className="pagination-info">
            <span>
              Showing {paginatedMerchants.length} of {totalCount} merchants
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </span>
            {/* <select
              className="input"
              value={pageSize}
              onChange={handlePageSizeChange}
              style={{ marginLeft: '1rem', width: 'auto' }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select> */}
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <Button
                variant="outline"
                size="small"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="small"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="pagination-page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'primary' : 'outline'}
                      size="small"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </span>
              <Button
                variant="outline"
                size="small"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="small"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

