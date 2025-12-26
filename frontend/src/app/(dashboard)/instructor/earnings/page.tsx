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

// Mock data - sẽ thay thế bằng API call sau
const monthlyRevenue = [
  { month: 'Tháng 1', revenue: 5000000, students: 25 },
  { month: 'Tháng 2', revenue: 7500000, students: 35 },
  { month: 'Tháng 3', revenue: 6200000, students: 28 },
  { month: 'Tháng 4', revenue: 8800000, students: 42 },
  { month: 'Tháng 5', revenue: 9500000, students: 48 },
  { month: 'Tháng 6', revenue: 12000000, students: 60 },
];

const recentTransactions = [
  {
    id: 1,
    course: 'React.js từ cơ bản đến nâng cao',
    student: 'Nguyễn Văn A',
    amount: 600000,
    date: '2024-12-20',
    status: 'completed',
  },
  {
    id: 2,
    course: 'Node.js và Express',
    student: 'Trần Thị B',
    amount: 550000,
    date: '2024-12-19',
    status: 'completed',
  },
  {
    id: 3,
    course: 'Python cho Data Science',
    student: 'Lê Văn C',
    amount: 700000,
    date: '2024-12-18',
    status: 'pending',
  },
  {
    id: 4,
    course: 'React.js từ cơ bản đến nâng cao',
    student: 'Phạm Thị D',
    amount: 600000,
    date: '2024-12-17',
    status: 'completed',
  },
  {
    id: 5,
    course: 'Node.js và Express',
    student: 'Hoàng Văn E',
    amount: 550000,
    date: '2024-12-16',
    status: 'completed',
  },
];

export default function InstructorEarningsPage() {
  const [isLoading] = React.useState(false);
  
  const totalRevenue = monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0);
  const pendingBalance = recentTransactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);
  const availableBalance = totalRevenue - pendingBalance;
  const monthlyGrowth = ((monthlyRevenue[5].revenue - monthlyRevenue[0].revenue) / monthlyRevenue[0].revenue * 100).toFixed(1);

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
              <div className="text-2xl font-bold">{totalRevenue.toLocaleString('vi-VN')} đ</div>
              <p className="text-xs text-muted-foreground mt-1">
                Tất cả thời gian
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Có thể rút</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableBalance.toLocaleString('vi-VN')} đ</div>
              <p className="text-xs text-muted-foreground mt-1">
                Sẵn sàng để rút
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đang chờ</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBalance.toLocaleString('vi-VN')} đ</div>
              <p className="text-xs text-muted-foreground mt-1">
                Chờ thanh toán
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tăng trưởng</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+{monthlyGrowth}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                So với tháng đầu
              </p>
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
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => `${value.toLocaleString('vi-VN')} đ`}
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
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
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
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
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
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <p className="font-medium">{transaction.course}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{transaction.student}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold">{transaction.amount.toLocaleString('vi-VN')} đ</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString('vi-VN')}
                          </p>
                        </td>
                        <td className="p-4">
                          {transaction.status === 'completed' ? (
                            <Badge variant="default">Đã thanh toán</Badge>
                          ) : (
                            <Badge variant="secondary">Đang chờ</Badge>
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

