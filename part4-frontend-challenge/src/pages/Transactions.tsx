import { useState } from 'react';
import { FilterState, DEFAULT_FILTERS } from '../types/transaction';
import { TransactionList } from '../components/common/TransactionList';
import { TransactionSummary } from '../components/common/TransactionSummary';
import { useTransactions } from '../hooks/useTransactions';

/**
 * Transactions Page Component
 * Displays transaction dashboard with summary and list
 */
export const Transactions = () => {
  const merchantId = import.meta.env.VITE_DEFAULT_MERCHANT_ID || 'MCH-00001';
  const [filters] = useState<FilterState>(DEFAULT_FILTERS);

  const { data, loading, error } = useTransactions(merchantId, filters);

  return (
    <main className="container">
      <h1>Transaction Dashboard</h1>
      <p className="subtitle">Merchant: {merchantId}</p>


      {error && (
        <div className="error-message" style={{ padding: '1rem', background: '#fee2e2', borderRadius: '8px', color: '#991b1b', margin: '1rem 0' }}>
          Error loading transactions: {error.message}
        </div>
      )}

      {loading && !data && (
        <div className="loading-message" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          Loading transactions...
        </div>
      )}

      {data && (
        <>
          <div className="summary-section">
            <TransactionSummary 
              transactions={data.transactions || []} 
              totalTransactions={data.totalTransactions || 0}
            />
          </div>

          <div className="transactions-section">
            <TransactionList 
              transactions={data.transactions || []} 
              loading={loading}
            />
          </div>

        </>
      )}
    </main>
  );
};
