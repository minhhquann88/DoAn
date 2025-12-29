'use client';

import React from 'react';
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface InstructorEarnings {
  totalRevenue: number;
  availableBalance: number;
  pendingBalance: number;
  growthRate: number;
  recentTransactions: Array<{
    id: number;
    courseTitle: string;
    studentName: string;
    amount: number;
    date: string;
    status: string;
  }>;
}

interface ChartData {
  earnings: Array<{ month: string; value: number }>;
  enrollments: Array<{ month: string; value: number }>;
}

export default function InstructorEarningsPage() {
  // Fetch earnings data
  const { data: earnings, isLoading: isLoadingEarnings } = useQuery<InstructorEarnings>({
    queryKey: ['instructor-earnings'],
    queryFn: async () => {
      const response = await apiClient.get<InstructorEarnings>('/instructor/earnings');
      return response.data;
    },
  });

  // Fetch chart data
  const { data: chartData, isLoading: isLoadingCharts } = useQuery<ChartData>({
    queryKey: ['instructor-dashboard-charts'],
    queryFn: async () => {
      const response = await apiClient.get<ChartData>('/instructor/dashboard/charts');
      return response.data;
    },
  });

  // Prepare chart data
  const monthlyRevenue = chartData?.earnings?.map(item => ({
    month: item.month,
    revenue: item.value,
    students: chartData.enrollments?.find(e => e.month === item.month)?.value || 0,
  })) || [];

  const isLoading = isLoadingEarnings || isLoadingCharts;

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-poppins">Doanh thu</h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi thu nhập và thanh toán của bạn
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{(earnings?.totalRevenue || 0).toLocaleString('vi-VN')} đ</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tất cả thời gian
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Có thể rút</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{(earnings?.availableBalance || 0).toLocaleString('vi-VN')} đ</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sẵn sàng để rút
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đang chờ</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{(earnings?.pendingBalance || 0).toLocaleString('vi-VN')} đ</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Chờ thanh toán
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tăng trưởng</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className={`text-2xl font-bold ${(earnings?.growthRate || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(earnings?.growthRate || 0) >= 0 ? '+' : ''}{(earnings?.growthRate || 0).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    So với tháng đầu
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Doanh thu theo tháng</CardTitle>
              <CardDescription>Biểu đồ doanh thu 6 tháng gần nhất</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCharts ? (
                <Skeleton className="h-[300px] w-full" />
              ) : monthlyRevenue.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Chưa có dữ liệu doanh thu
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => `${Number(value).toLocaleString('vi-VN')} đ`}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Xu hướng học viên</CardTitle>
              <CardDescription>Số lượng học viên đăng ký theo tháng</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCharts ? (
                <Skeleton className="h-[300px] w-full" />
              ) : monthlyRevenue.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Chưa có dữ liệu đăng ký
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="students" 
                      stroke="#82ca9d" 
                      name="Số học viên"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Giao dịch gần đây</CardTitle>
              <CardDescription>Lịch sử thanh toán và rút tiền</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingEarnings ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !earnings?.recentTransactions || earnings.recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có giao dịch nào
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold">Khóa học</th>
                      <th className="text-left p-4 font-semibold">Học viên</th>
                      <th className="text-left p-4 font-semibold">Số tiền</th>
                      <th className="text-left p-4 font-semibold">Ngày</th>
                      <th className="text-left p-4 font-semibold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <p className="font-medium">{transaction.courseTitle}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{transaction.studentName}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold">{transaction.amount.toLocaleString('vi-VN')} đ</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-muted-foreground">
                            {transaction.date}
                          </p>
                        </td>
                        <td className="p-4">
                          {transaction.status === 'completed' ? (
                            <Badge variant="default">Đã thanh toán</Badge>
                          ) : transaction.status === 'pending' ? (
                            <Badge variant="secondary">Đang chờ</Badge>
                          ) : (
                            <Badge variant="destructive">Thất bại</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}

