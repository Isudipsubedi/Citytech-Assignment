import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { transactionService } from '../services/transactionService';
import { Transaction } from '../types/transaction';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface TransactionListProps {
  merchantId: string;
  refreshInterval?: number;
}

export const OptimizedTransactionList: React.FC<TransactionListProps> = ({
  merchantId,
  refreshInterval = 5000,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create formatter once and reuse (useMemo)
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }),
    []
  );

  const formatAmount = useCallback(
    (amount: number) => currencyFormatter.format(amount),
    [currencyFormatter]
  );

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await transactionService.getTransactions({
        merchantId,
        page: 1,
        size: 100,
      });
      setTransactions(data.content);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    setLoading(true);
    fetchData();

    const interval = setInterval(fetchData, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [merchantId, refreshInterval, fetchData]);

  // Derive filtered transactions instead of storing in state
  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;

    const lowerSearch = searchTerm.toLowerCase();
    return transactions.filter((txn) =>
      txn.merchantName.toLowerCase().includes(lowerSearch) ||
      txn.transactionId.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm, transactions]);

  if (loading && transactions.length === 0) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">Error: {error}</p>
        <button onClick={() => fetchData()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <div className="search-bar">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search transactions..."
          className="search-input"
        />
        {loading && <span className="loading-indicator">Refreshing...</span>}
      </div>

      {filteredTransactions.length === 0 ? (
        <p className="no-results">No transactions found</p>
      ) : (
        <table className="transaction-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Merchant</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((txn) => (
              <tr key={txn.transactionId}>
                <td>{txn.transactionId}</td>
                <td>{txn.merchantName}</td>
                <td>{formatAmount(txn.totalAmount)}</td>
                <td>
                  <span className={`status status-${txn.status.toLowerCase()}`}>
                    {txn.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OptimizedTransactionList;

// ---------------------------------------------------------------------------
// Testing / Verification notes (place into test files or run manually):
// - Interval cleanup test: mount component, advance timers, unmount, advance
//   timers again and assert no additional calls (use jest.useFakeTimers()).
// - Formatter creation test: spy on Intl.NumberFormat and assert it's called
//   exactly once across renders.
// - Dependency change test: change `refreshInterval` via rerender and assert
//   the fetch cadence changes accordingly.
// ---------------------------------------------------------------------------
