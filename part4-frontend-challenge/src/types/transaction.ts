// Transaction-related types and interfaces

export interface Transaction {
  id?: string; // MockAPI ID
  txnId: number;
  merchantId: string; // Associate with merchant
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'reversed';
  timestamp: string;
  cardType: string;
  cardLast4: string;
  acquirer: string;
  issuer: string;
  details?: TransactionDetail[];
  createdAt?: string;
}

export interface TransactionDetail {
  detailId: number;
  type: 'fee' | 'tax' | 'adjustment' | 'refund';
  amount: number;
  description: string;
}

export interface TransactionSummary {
  totalTransactions: number;
  totalAmount: number;
  currency: string;
  byStatus: {
    completed?: number;
    pending?: number;
    failed?: number;
    reversed?: number;
    [key: string]: number | undefined;
  };
}

export interface TransactionResponse {
  merchantId: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  summary: TransactionSummary;
  transactions: Transaction[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

export interface FilterState {
  page: number;
  size: number;
  startDate: string;
  endDate: string;
  status?: string;
  searchQuery?: string;
}

export const DEFAULT_FILTERS: FilterState = {
  page: 0,
  size: 20,
  startDate: '2025-11-16',
  endDate: '2025-11-18',
  status: undefined,
  searchQuery: undefined,
};
