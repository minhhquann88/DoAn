// Module 9: Payment & Certificate Service
// API Base: 
// - Transactions: /api/v1/transactions
// - Certificates: /api/v1/certificates
import apiClient from '@/lib/api';

// API prefixes
const TRANSACTION_PREFIX = '/v1/transactions';
const CERTIFICATE_PREFIX = '/v1/certificates';

// =====================
// PAYMENT TYPES
// =====================

export interface Transaction {
  id: number;
  userId: number;
  courseId: number;
  courseName?: string;
  amount: number;
  currency: string;
  paymentMethod: 'VNPAY' | 'MOMO' | 'BANK_TRANSFER' | 'CREDIT_CARD';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  transactionCode?: string;
  description?: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
}

export interface PaymentResponse {
  paymentUrl: string;
  transactionId: number;
  transactionCode: string;
  amount: number;
  expiryTime: string;
}

export interface TransactionCreateRequest {
  courseId: number;
  paymentMethod: 'VNPAY' | 'MOMO' | 'BANK_TRANSFER' | 'CREDIT_CARD';
  returnUrl: string;
  cancelUrl?: string;
}

export interface PaymentCallback {
  transactionId: number;
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  paymentData: Record<string, any>;
}

// =====================
// CERTIFICATE TYPES
// =====================

export interface Certificate {
  id: number;
  userId: number;
  userName?: string;
  courseId: number;
  courseName?: string;
  certificateCode: string;
  issueDate: string;
  expiryDate?: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  pdfUrl?: string;
  verificationUrl?: string;
  score?: number;
  completionDate: string;
}

export interface CertificateRequest {
  userId: number;
  courseId: number;
  enrollmentId: number;
}

export interface CertificateVerification {
  isValid: boolean;
  certificate?: Certificate;
  message: string;
}

// =====================
// PAYMENT FUNCTIONS
// =====================

/**
 * Create payment transaction for course enrollment
 */
export const createTransaction = async (
  data: TransactionCreateRequest
): Promise<PaymentResponse> => {
  const response = await apiClient.post(TRANSACTION_PREFIX, data);
  return response.data;
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (transactionId: number): Promise<Transaction> => {
  const response = await apiClient.get(`${TRANSACTION_PREFIX}/${transactionId}`);
  return response.data;
};

/**
 * Get user's transactions
 */
export const getMyTransactions = async (
  userId: number,
  params?: {
    status?: Transaction['status'];
    page?: number;
    size?: number;
    startDate?: string;
    endDate?: string;
  }
): Promise<{
  content: Transaction[];
  totalElements: number;
  totalPages: number;
}> => {
  // Backend uses /v1/transactions/user/{userId}
  const response = await apiClient.get(`${TRANSACTION_PREFIX}/user/${userId}`, { params });
  return response.data;
};

/**
 * Get all transactions (Admin)
 */
export const getAllTransactions = async (params?: {
  status?: Transaction['status'];
  paymentMethod?: Transaction['paymentMethod'];
  userId?: number;
  courseId?: number;
  page?: number;
  size?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'amount' | 'status';
  sortDir?: 'asc' | 'desc';
}): Promise<{
  content: Transaction[];
  totalElements: number;
  totalPages: number;
}> => {
  const response = await apiClient.get(TRANSACTION_PREFIX, { params });
  return response.data;
};

/**
 * Handle payment callback (from payment gateway)
 */
export const handlePaymentCallback = async (
  params: Record<string, string>
): Promise<Transaction> => {
  // Backend uses GET /v1/transactions/payment/callback with query params
  const response = await apiClient.get(`${TRANSACTION_PREFIX}/payment/callback`, { params });
  return response.data;
};

/**
 * Verify transaction status
 */
export const verifyTransaction = async (transactionId: number): Promise<Transaction> => {
  // Verify by getting transaction details
  const response = await apiClient.get(`${TRANSACTION_PREFIX}/${transactionId}`);
  return response.data;
};

/**
 * Refund transaction (Admin)
 */
export const refundTransaction = async (
  transactionId: number,
  reason?: string
): Promise<Transaction> => {
  // TODO: Backend should implement POST /v1/transactions/{id}/refund
  const response = await apiClient.post(`${TRANSACTION_PREFIX}/${transactionId}/refund`, { reason });
  return response.data;
};

/**
 * Cancel transaction
 */
export const cancelTransaction = async (
  transactionId: number,
  reason?: string
): Promise<Transaction> => {
  // TODO: Backend should implement POST /v1/transactions/{id}/cancel
  const response = await apiClient.post(`${TRANSACTION_PREFIX}/${transactionId}/cancel`, { reason });
  return response.data;
};

/**
 * Get transaction statistics (Admin)
 */
export const getTransactionStatistics = async (params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}) => {
  // Backend uses GET /v1/transactions/revenue with date params
  const response = await apiClient.get(`${TRANSACTION_PREFIX}/revenue`, { params });
  return response.data;
};

// =====================
// VNPAY SPECIFIC
// =====================

/**
 * Create VNPay payment URL
 */
export const createVNPayPayment = async (data: {
  courseId: number;
  userId: number;
  returnUrl: string;
  locale?: 'vn' | 'en';
}): Promise<PaymentResponse> => {
  // Use main transaction endpoint with VNPAY as payment method
  const response = await apiClient.post(TRANSACTION_PREFIX, {
    courseId: data.courseId,
    userId: data.userId,
    paymentGateway: 'VNPAY',
    returnUrl: data.returnUrl,
  });
  return response.data;
};

/**
 * Handle VNPay IPN (Instant Payment Notification)
 */
export const handleVNPayIPN = async (data: Record<string, any>) => {
  // Handled by payment callback
  const response = await apiClient.get(`${TRANSACTION_PREFIX}/payment/callback`, { params: data });
  return response.data;
};

/**
 * Query VNPay transaction
 */
export const queryVNPayTransaction = async (transactionId: number) => {
  const response = await apiClient.get(`${TRANSACTION_PREFIX}/${transactionId}`);
  return response.data;
};

// =====================
// CERTIFICATE FUNCTIONS
// =====================

/**
 * Issue certificate (Auto-triggered after course completion)
 */
export const issueCertificate = async (data: CertificateRequest): Promise<Certificate> => {
  const response = await apiClient.post(CERTIFICATE_PREFIX, data);
  return response.data;
};

/**
 * Get certificate by ID
 */
export const getCertificateById = async (certificateId: number): Promise<Certificate> => {
  const response = await apiClient.get(`${CERTIFICATE_PREFIX}/${certificateId}`);
  return response.data;
};

/**
 * Get certificate by code
 */
export const getCertificateByCode = async (code: string): Promise<Certificate> => {
  const response = await apiClient.get(`${CERTIFICATE_PREFIX}/code/${code}`);
  return response.data;
};

/**
 * Get user's certificates
 */
export const getMyCertificates = async (
  userId: number,
  params?: {
    status?: Certificate['status'];
    page?: number;
    size?: number;
  }
): Promise<{
  content: Certificate[];
  totalElements: number;
  totalPages: number;
}> => {
  // Backend uses /v1/certificates/user/{userId}
  const response = await apiClient.get(`${CERTIFICATE_PREFIX}/user/${userId}`, { params });
  return response.data;
};

/**
 * Get certificates for a course (Instructor/Admin)
 */
export const getCourseCertificates = async (
  courseId: number,
  params?: {
    status?: Certificate['status'];
    page?: number;
    size?: number;
  }
) => {
  const response = await apiClient.get(`${CERTIFICATE_PREFIX}/course/${courseId}`, { params });
  return response.data;
};

/**
 * Get all certificates (Admin)
 */
export const getAllCertificates = async (params?: {
  status?: Certificate['status'];
  userId?: number;
  courseId?: number;
  page?: number;
  size?: number;
  startDate?: string;
  endDate?: string;
}): Promise<{
  content: Certificate[];
  totalElements: number;
  totalPages: number;
}> => {
  const response = await apiClient.get(CERTIFICATE_PREFIX, { params });
  return response.data;
};

/**
 * Download certificate PDF
 */
export const downloadCertificate = async (certificateId: number): Promise<Blob> => {
  // TODO: Backend should implement GET /v1/certificates/{id}/download
  const response = await apiClient.get(`${CERTIFICATE_PREFIX}/${certificateId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Download certificate PDF by code
 */
export const downloadCertificateByCode = async (code: string): Promise<Blob> => {
  // TODO: Backend should implement GET /v1/certificates/code/{code}/download
  const response = await apiClient.get(`${CERTIFICATE_PREFIX}/code/${code}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Verify certificate
 */
export const verifyCertificate = async (code: string): Promise<CertificateVerification> => {
  const response = await apiClient.get(`${CERTIFICATE_PREFIX}/verify/${code}`);
  return response.data;
};

/**
 * Revoke certificate (Admin)
 */
export const revokeCertificate = async (
  certificateId: number
): Promise<void> => {
  // Backend uses DELETE /v1/certificates/{id}
  await apiClient.delete(`${CERTIFICATE_PREFIX}/${certificateId}`);
};

/**
 * Regenerate certificate PDF (Admin)
 */
export const regenerateCertificate = async (certificateId: number): Promise<Certificate> => {
  // TODO: Backend should implement POST /v1/certificates/{id}/regenerate
  const response = await apiClient.post(`${CERTIFICATE_PREFIX}/${certificateId}/regenerate`);
  return response.data;
};

/**
 * Get certificate statistics (Admin)
 */
export const getCertificateStatistics = async (params?: {
  startDate?: string;
  endDate?: string;
  courseId?: number;
}) => {
  const response = await apiClient.get(`${CERTIFICATE_PREFIX}/stats`, { params });
  return response.data;
};

/**
 * Bulk issue certificates (Admin)
 */
export const bulkIssueCertificates = async (data: {
  courseId: number;
  userIds: number[];
}): Promise<{ success: number; failed: number; certificates: Certificate[] }> => {
  // TODO: Backend should implement POST /v1/certificates/bulk-issue
  const response = await apiClient.post(`${CERTIFICATE_PREFIX}/bulk-issue`, data);
  return response.data;
};

// =====================
// HELPER FUNCTIONS
// =====================

/**
 * Download blob as file
 */
export const downloadFile = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Format transaction amount
 */
export const formatAmount = (amount: number, currency: string = 'VND'): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export default {
  // Payment
  createTransaction,
  getTransactionById,
  getMyTransactions,
  getAllTransactions,
  handlePaymentCallback,
  verifyTransaction,
  refundTransaction,
  cancelTransaction,
  getTransactionStatistics,
  
  // VNPay
  createVNPayPayment,
  handleVNPayIPN,
  queryVNPayTransaction,
  
  // Certificate
  issueCertificate,
  getCertificateById,
  getCertificateByCode,
  getMyCertificates,
  getCourseCertificates,
  getAllCertificates,
  downloadCertificate,
  downloadCertificateByCode,
  verifyCertificate,
  revokeCertificate,
  regenerateCertificate,
  getCertificateStatistics,
  bulkIssueCertificates,
  
  // Helpers
  downloadFile,
  formatAmount,
};



