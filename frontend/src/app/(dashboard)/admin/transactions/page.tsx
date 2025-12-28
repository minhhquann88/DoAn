'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService, type AdminTransaction } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function AdminTransactionsPage() {
  const [page, setPage] = React.useState(0);

  // Fetch transactions
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['admin-transactions', page],
    queryFn: () => adminService.getTransactions({
      page,
      size: 10,
      sortBy: 'createdAt',
      sortDir: 'DESC',
    }),
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PENDING: { label: 'Chờ xử lý', variant: 'outline' },
      SUCCESS: { label: 'Thành công', variant: 'default' },
      FAILED: { label: 'Thất bại', variant: 'destructive' },
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getPaymentGatewayLabel = (gateway: string) => {
    const gatewayMap: Record<string, string> = {
      VNPAY: 'VNPay',
      MOMO: 'MoMo',
    };
    return gatewayMap[gateway] || gateway;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý Giao dịch</h1>
        <p className="text-muted-foreground">Xem lịch sử giao dịch toàn hệ thống</p>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã GD</TableHead>
              <TableHead>Người mua</TableHead>
              <TableHead>Khóa học</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Cổng thanh toán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày giờ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : transactionsData?.content.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Chưa có giao dịch nào
                </TableCell>
              </TableRow>
            ) : (
              transactionsData?.content.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-sm">
                    {transaction.transactionCode}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{transaction.userFullName}</p>
                      <p className="text-sm text-muted-foreground">ID: {transaction.userId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{transaction.courseTitle}</p>
                      <p className="text-sm text-muted-foreground">ID: {transaction.courseId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getPaymentGatewayLabel(transaction.paymentGateway)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(transaction.transactionStatus)}</TableCell>
                  <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {transactionsData && transactionsData.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Trang {page + 1} / {transactionsData.totalPages} ({transactionsData.totalElements} giao dịch)
            </p>
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
                onClick={() => setPage(p => Math.min(transactionsData.totalPages - 1, p + 1))}
                disabled={page >= transactionsData.totalPages - 1}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

