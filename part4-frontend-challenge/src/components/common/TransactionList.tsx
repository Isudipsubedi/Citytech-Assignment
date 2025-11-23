import './TransactionList.css';

interface Transaction {
  txnId: number;
  merchantId: string;
  amount: number;
  currency: string;
  status: string;
  cardType: string;
  cardLast4: string;
  authCode: string;
  txnDate: string;
  createdAt: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
}

export const TransactionList = ({ transactions, loading }: TransactionListProps) => {
  if (loading) {
    return <div className="loading">Loading transactions...</div>;
  }

  if (!transactions || transactions.length === 0) {
    return <div className="no-data">No transactions found</div>;
  }

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return '';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="transaction-list">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Amount</th>
            <th>Card</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn.txnId}>
              <td className="txn-id">#{txn.txnId}</td>
              <td className="amount">{formatAmount(txn.amount, txn.currency)}</td>
              <td>
                <span className="card-info">
                  {txn.cardType} •••• {txn.cardLast4}
                </span>
              </td>
              <td>
                <span className={`status-badge ${getStatusClass(txn.status)}`}>
                  {txn.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
