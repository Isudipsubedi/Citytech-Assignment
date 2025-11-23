import React, { useState, useEffect } from 'react';
import { Merchant } from '../../types/merchant';
import { getMerchantById } from '../../services/merchantService';
import { getTransactions } from '../../services/transactionService';
import { Transaction, TransactionSummary } from '../../types/transaction';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Card } from '../common/Card';
import './MerchantDetails.css';

interface MerchantDetailsProps {
  merchant: Merchant;
  isOpen: boolean;
  onClose: () => void;
}

export const MerchantDetails: React.FC<MerchantDetailsProps> = ({
  merchant,
  isOpen,
  onClose,
}) => {
  const [merchantDetails, setMerchantDetails] = useState<Merchant | null>(merchant);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    if (isOpen && merchant.id) {
      fetchMerchantDetails();
      loadTransactions();
    } else {
      // Reset state when modal closes
      setTransactions([]);
      setSummary(null);
      setCurrentPage(0);
    }
  }, [isOpen, merchant.id, currentPage]);

  const fetchMerchantDetails = async () => {
    if (!merchant.id) return;

    setLoading(true);
    setError(null);
    try {
      console.log('Fetching merchant details for ID:', merchant.id);
      const details = await getMerchantById(merchant.id);
      console.log('Merchant details fetched:', details);
      setMerchantDetails(details);
    } catch (err) {
      console.error('Error fetching merchant details:', err);
      setError('Failed to load merchant details');
      // Use the passed merchant data as fallback
      setMerchantDetails(merchant);
    } finally {
      setLoading(false);
    }
  };

  // Note: Transaction data is now fetched from backend API via getTransactions()

  const loadTransactions = async () => {
    if (!merchant.id) return;
    
    setTransactionsLoading(true);
    setError(null);
    
    try {
      const merchantId = merchant.id;
      
      // Call backend API using transaction service
      const response = await getTransactions(merchantId, {
        page: currentPage,
        size: pageSize,
      });

      setTransactions(response.transactions);
      setTotalElements(response.pagination.totalElements);
      setTotalPages(response.pagination.totalPages);
      setSummary(response.summary);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load transactions';
      setError(errorMessage);
      setTransactions([]);
      setSummary(null);
    } finally {
      setTransactionsLoading(false);
    }
  };


  const handleExport = () => {
    if (!merchant.id) return;

    // Create CSV content
    const headers = ['Transaction ID', 'Amount', 'Currency', 'Status', 'Date', 'Card Type', 'Card Last 4'];
    const rows = transactions.map((txn) => [
      txn.txnId.toString(),
      txn.amount.toString(),
      txn.currency,
      txn.status,
      new Date(txn.timestamp).toLocaleDateString(),
      txn.cardType,
      txn.cardLast4,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `merchant-${merchant.id}-transactions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Generate activity timeline from merchant and transactions
  const getActivityTimeline = () => {
    const activities: Array<{ date: string; type: string; description: string }> = [];
    const merchantData = merchantDetails || merchant;

    if (merchantData.createdAt) {
      activities.push({
        date: merchantData.createdAt,
        type: 'created',
        description: 'Merchant account created',
      });
    }

    if (merchantData.updatedAt && merchantData.updatedAt !== merchantData.createdAt) {
      activities.push({
        date: merchantData.updatedAt,
        type: 'updated',
        description: 'Merchant information updated',
      });
    }

    // Add recent transaction activities
    transactions.slice(0, 5).forEach((txn) => {
      activities.push({
        date: txn.timestamp,
        type: 'transaction',
        description: `${txn.status} transaction: ${formatCurrency(txn.amount, txn.currency)}`,
      });
    });

    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  if (!isOpen) return null;

  const activityTimeline = getActivityTimeline();
  const displayMerchant = merchantDetails || merchant;

  return (
    <div className="merchant-details-overlay" onClick={onClose}>
      <div className="merchant-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="merchant-details-header">
          <h2>Merchant Details</h2>
          <button className="merchant-details-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="merchant-details-content">
          {loading && !merchantDetails ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <>
              {/* Merchant Profile Section */}
              <section className="merchant-details-section">
                <h3>Merchant Profile</h3>
                <Card>
                  <div className="merchant-profile-grid">
                    <div className="profile-item">
                      <label>Merchant Name</label>
                      <p>{displayMerchant.name}</p>
                    </div>
                    <div className="profile-item">
                      <label>Email</label>
                      <p>{displayMerchant.email}</p>
                    </div>
                    <div className="profile-item">
                      <label>Phone</label>
                      <p>{displayMerchant.phone}</p>
                    </div>
                    <div className="profile-item">
                      <label>Status</label>
                      <p>
                        <span className={`status-badge status-${displayMerchant.status}`}>
                          {displayMerchant.status}
                        </span>
                      </p>
                    </div>
                    {displayMerchant.businessName && (
                      <div className="profile-item">
                        <label>Business Name</label>
                        <p>{displayMerchant.businessName}</p>
                      </div>
                    )}
                    {displayMerchant.registrationNumber && (
                      <div className="profile-item">
                        <label>Registration Number</label>
                        <p>{displayMerchant.registrationNumber}</p>
                      </div>
                    )}
                    {displayMerchant.address && (
                      <div className="profile-item full-width">
                        <label>Address</label>
                        <p>
                          {displayMerchant.address}
                          {displayMerchant.city && `, ${displayMerchant.city}`}
                          {displayMerchant.country && `, ${displayMerchant.country}`}
                        </p>
                      </div>
                    )}
                    <div className="profile-item">
                      <label>Created</label>
                      <p>{displayMerchant.createdAt ? formatDate(displayMerchant.createdAt) : '-'}</p>
                    </div>
                    <div className="profile-item">
                      <label>Last Updated</label>
                      <p>{displayMerchant.updatedAt ? formatDate(displayMerchant.updatedAt) : '-'}</p>
                    </div>
                  </div>
                </Card>
              </section>
            </>
          )}

          {/* Transaction Statistics Section */}
          <section className="merchant-details-section">
            <h3>Transaction Statistics</h3>
            {transactionsLoading ? (
              <LoadingSpinner />
            ) : summary ? (
              <div className="statistics-grid">
                <Card>
                  <div className="stat-item">
                    <div className="stat-label">Total Transactions</div>
                    <div className="stat-value">{summary.totalTransactions}</div>
                  </div>
                </Card>
                <Card>
                  <div className="stat-item">
                    <div className="stat-label">Total Amount</div>
                    <div className="stat-value">
                      {formatCurrency(summary.totalAmount, summary.currency)}
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="stat-item">
                    <div className="stat-label">Completed</div>
                    <div className="stat-value completed">{summary.byStatus.completed}</div>
                  </div>
                </Card>
                <Card>
                  <div className="stat-item">
                    <div className="stat-label">Pending</div>
                    <div className="stat-value pending">{summary.byStatus.pending}</div>
                  </div>
                </Card>
                <Card>
                  <div className="stat-item">
                    <div className="stat-label">Failed</div>
                    <div className="stat-value failed">{summary.byStatus.failed}</div>
                  </div>
                </Card>
              </div>
            ) : (
              <p>No statistics available</p>
            )}
          </section>

          {/* Recent Transactions Section */}
          <section className="merchant-details-section">
            <div className="section-header">
              <h3>Recent Transactions</h3>
              {transactions.length > 0 && (
                <Button variant="outline" size="small" onClick={handleExport}>
                  Export CSV
                </Button>
              )}
            </div>
            {transactionsLoading ? (
              <LoadingSpinner />
            ) : transactions.length === 0 ? (
              <div className="no-transactions-message">
                <p>No transactions found for this merchant</p>
              </div>
            ) : (
              <>
                <div className="transactions-table-wrapper">
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Card</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn) => (
                        <tr key={txn.id || txn.txnId}>
                          <td>#{txn.txnId}</td>
                          <td>{formatCurrency(txn.amount, txn.currency)}</td>
                          <td>
                            <span className={`txn-status txn-status-${txn.status}`}>
                              {txn.status}
                            </span>
                          </td>
                          <td>{formatDate(txn.timestamp)}</td>
                          <td>
                            {txn.cardType} •••• {txn.cardLast4}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="transactions-pagination">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => setCurrentPage(0)}
                      disabled={currentPage === 0}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 0}
                    >
                      Previous
                    </Button>
                    <span className="pagination-info">
                      Page {currentPage + 1} of {totalPages} ({totalElements} total)
                    </span>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => setCurrentPage(totalPages - 1)}
                      disabled={currentPage >= totalPages - 1}
                    >
                      Last
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Activity Timeline Section */}
          <section className="merchant-details-section">
            <h3>Activity Timeline</h3>
            <div className="activity-timeline">
              {activityTimeline.length === 0 ? (
                <p>No activity recorded</p>
              ) : (
                activityTimeline.map((activity, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-date">{formatDate(activity.date)}</div>
                      <div className="timeline-description">{activity.description}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

