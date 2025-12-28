'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText,
  Download,
  ExternalLink,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { getMyTransactions, type Transaction } from '@/services/paymentService';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

export default function TransactionsPage() {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [page, setPage] = React.useState(0);
  const pageSize = 10;

  // Fetch transactions
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['my-transactions', page],
    queryFn: () => getMyTransactions({ page, size: pageSize }),
    enabled: !!user?.id,
  });

  const transactions = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case 'SUCCESS':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Thành công
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Thất bại
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Đang xử lý
          </Badge>
        );
      case 'REFUNDED':
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
            <FileText className="h-3 w-3 mr-1" />
            Đã hoàn tiền
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  // Get payment gateway badge
  const getPaymentGatewayBadge = (gateway: string) => {
    switch (gateway?.toUpperCase()) {
      case 'VNPAY':
        return <Badge variant="outline">VNPay</Badge>;
      case 'MOMO':
        return <Badge variant="outline">MoMo</Badge>;
      case 'BANK_TRANSFER':
        return <Badge variant="outline">Chuyển khoản</Badge>;
      default:
        return <Badge variant="outline">{gateway || 'N/A'}</Badge>;
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Lỗi tải dữ liệu</h3>
              <p className="text-muted-foreground mb-4">
                Không thể tải lịch sử giao dịch. Vui lòng thử lại.
              </p>
              <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Link href={ROUTES.STUDENT.DASHBOARD}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại Dashboard
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Lịch sử giao dịch</h1>
            <p className="text-muted-foreground">
              Xem danh sách các lần thanh toán của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {!isLoading && transactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Tổng giao dịch</CardDescription>
              <CardTitle className="text-2xl">{totalElements}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Giao dịch thành công</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {transactions.filter(t => t.transactionStatus === 'SUCCESS').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Tổng tiền đã thanh toán</CardDescription>
              <CardTitle className="text-2xl text-primary">
                {formatAmount(
                  transactions
                    .filter(t => t.transactionStatus === 'SUCCESS')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách giao dịch</CardTitle>
          <CardDescription>
            {totalElements > 0 
              ? `Hiển thị ${transactions.length} trong tổng số ${totalElements} giao dịch`
              : 'Chưa có giao dịch nào'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-24 w-full" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có giao dịch</h3>
              <p className="text-muted-foreground mb-4">
                Bạn chưa thực hiện giao dịch nào. Hãy mua khóa học để bắt đầu học tập!
              </p>
              <Link href={ROUTES.COURSES}>
                <Button>Khám phá khóa học</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Left: Transaction Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">
                                {transaction.courseTitle || 'Khóa học'}
                              </h3>
                              {getStatusBadge(transaction.transactionStatus || transaction.status || 'PENDING')}
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                <span className="font-medium text-foreground">
                                  {formatAmount(transaction.amount)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                {getPaymentGatewayBadge(transaction.paymentGateway || transaction.paymentMethod || '')}
                              </div>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span>Mã giao dịch: <code className="font-mono text-xs">{transaction.transactionCode}</code></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(transaction.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col gap-2 md:items-end">
                        <Link href={ROUTES.COURSE_DETAIL(transaction.courseId.toString())}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Xem khóa học
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Trang {page + 1} / {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

