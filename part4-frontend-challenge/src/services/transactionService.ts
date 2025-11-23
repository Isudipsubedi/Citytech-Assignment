import { get } from './api';
import { Transaction, TransactionResponse, TransactionSummary, PaginationInfo } from '../types/transaction';

/**
 * Transaction Service
 * Handles all transaction-related API calls to the backend
 * 
 * Backend API Base URL: http://localhost:8080/api/v1
 * Configure via VITE_API_BASE_URL environment variable
 */

/**
 * Backend API response structure
 */
interface BackendTransactionResponse {
  merchantId: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  summary: {
    totalTransactions: number;
    totalAmount: number;
    currency: string;
    byStatus: {
      [key: string]: number;
    };
  };
  transactions: Array<{
    txnId: number;
    amount: number;
    currency: string;
    status: string;
    timestamp: string;
    cardType?: string;
    cardLast4?: string;
    acquirer?: string;
    issuer?: string;
    details?: Array<{
      detailId: number;
      type: string;
      amount: number;
      description?: string;
    }>;
  }>;
  pagination: {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
  };
}

/**
 * Get transactions for a specific merchant
 * GET /api/v1/merchants/{merchantId}/transactions
 */
export interface GetTransactionsParams {
  page?: number;
  size?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export const getTransactions = async (
  merchantId: string,
  params?: GetTransactionsParams
): Promise<TransactionResponse> => {
  try {
    const page = params?.page ?? 0;
    const size = params?.size ?? 10;
    
    const queryParams: any = {
      page,
      size,
    };

    if (params?.startDate) {
      queryParams.startDate = params.startDate;
    }
    if (params?.endDate) {
      queryParams.endDate = params.endDate;
    }
    if (params?.status) {
      queryParams.status = params.status;
    }

    console.log(`[TransactionService] Fetching transactions for merchant: ${merchantId}`, queryParams);
    
    // Call backend API
    const response = await get<BackendTransactionResponse>(
      `/merchants/${merchantId}/transactions`,
      { params: queryParams }
    );
    
    // Map backend response to frontend format
    const mappedTransactions: Transaction[] = (response.transactions || []).map((txn) => ({
      id: txn.txnId?.toString(),
      txnId: txn.txnId,
      merchantId: merchantId,
      amount: parseFloat(txn.amount?.toString() || '0'),
      currency: txn.currency || 'USD',
      status: txn.status as 'completed' | 'pending' | 'failed' | 'reversed',
      timestamp: txn.timestamp,
      cardType: txn.cardType || 'Unknown',
      cardLast4: txn.cardLast4 || '0000',
      acquirer: txn.acquirer || 'Unknown',
      issuer: txn.issuer || 'Unknown',
      details: (txn.details || []).map((detail) => ({
        detailId: detail.detailId,
        type: detail.type as 'fee' | 'tax' | 'adjustment' | 'refund',
        amount: parseFloat(detail.amount?.toString() || '0'),
        description: detail.description || '',
      })),
    }));

    const summary: TransactionSummary = {
      totalTransactions: response.summary?.totalTransactions || 0,
      totalAmount: parseFloat(response.summary?.totalAmount?.toString() || '0'),
      currency: response.summary?.currency || 'USD',
      byStatus: {
        completed: response.summary?.byStatus?.completed || 0,
        pending: response.summary?.byStatus?.pending || 0,
        failed: response.summary?.byStatus?.failed || 0,
        reversed: response.summary?.byStatus?.reversed || 0,
      },
    };

    const pagination: PaginationInfo = {
      page: response.pagination?.page || page,
      size: response.pagination?.size || size,
      totalPages: response.pagination?.totalPages || 0,
      totalElements: response.pagination?.totalElements || 0,
    };

    return {
      merchantId: response.merchantId,
      dateRange: response.dateRange,
      summary,
      transactions: mappedTransactions,
      pagination,
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export default {
  getTransactions,
};
