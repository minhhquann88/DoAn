'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, type AdminUser } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Lock, Unlock, Loader2 } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const [page, setPage] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [lockingUser, setLockingUser] = React.useState<AdminUser | null>(null);
  const [lockReason, setLockReason] = React.useState('');

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['admin-users', page, debouncedSearch],
    queryFn: () => adminService.getUsers({
      page,
      size: 10,
      sortBy: 'createdAt',
      sortDir: 'DESC',
      search: debouncedSearch || undefined,
    }),
    retry: 1,
  });

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isEnabled, lockReason }: { id: number; isEnabled: boolean; lockReason?: string }) =>
      adminService.updateUserStatus(id, isEnabled, lockReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setLockingUser(null);
      setLockReason('');
      addToast({
        type: 'success',
        description: 'Cập nhật trạng thái thành công',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        description: error.response?.data?.message || 'Có lỗi xảy ra',
      });
    },
  });

  const handleToggleStatus = (user: AdminUser) => {
    if (user.isEnabled) {
      // Nếu đang mở khóa, hiển thị dialog để nhập lý do khóa
      setLockingUser(user);
      setLockReason('');
    } else {
      // Nếu đang khóa, mở khóa ngay (không cần lý do)
      toggleStatusMutation.mutate({
        id: user.id,
        isEnabled: true,
      });
    }
  };

  const handleConfirmLock = () => {
    if (lockingUser) {
      toggleStatusMutation.mutate({
        id: lockingUser.id,
        isEnabled: false,
        lockReason: lockReason.trim() || undefined,
      });
    }
  };

  const getRoleLabel = (roles: Array<{ name: string }>) => {
    if (roles.some(r => r.name === 'ROLE_ADMIN')) return 'Admin';
    if (roles.some(r => r.name === 'ROLE_LECTURER')) return 'Giảng viên';
    return 'Học viên';
  };

  const getRoleBadgeVariant = (roles: Array<{ name: string }>) => {
    if (roles.some(r => r.name === 'ROLE_ADMIN')) return 'destructive';
    if (roles.some(r => r.name === 'ROLE_LECTURER')) return 'default';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý Người dùng</h1>
        <p className="text-muted-foreground">Xem và quản lý tài khoản người dùng</p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo email hoặc tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-destructive">
                  Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
                </TableCell>
              </TableRow>
            ) : !usersData || !usersData.content || usersData.content.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy người dùng nào
                </TableCell>
              </TableRow>
            ) : (
              usersData.content.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback>
                          {user.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.roles)}>
                      {getRoleLabel(user.roles)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isEnabled ? 'default' : 'secondary'}>
                      {user.isEnabled ? 'Active' : 'Locked'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(user)}
                      disabled={toggleStatusMutation.isPending}
                    >
                      {user.isEnabled ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Khóa
                        </>
                      ) : (
                        <>
                          <Unlock className="h-4 w-4 mr-2" />
                          Mở khóa
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {usersData && usersData.totalPages && usersData.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Trang {page + 1} / {usersData.totalPages} ({usersData.totalElements || 0} người dùng)
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
                onClick={() => setPage(p => Math.min((usersData.totalPages || 1) - 1, p + 1))}
                disabled={page >= (usersData.totalPages || 1) - 1}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Lock User Dialog */}
      <Dialog open={!!lockingUser} onOpenChange={(open) => !open && setLockingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Khóa tài khoản</DialogTitle>
            <DialogDescription>
              Nhập lý do khóa tài khoản của {lockingUser?.fullName} ({lockingUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lockReason">Lý do khóa tài khoản *</Label>
              <Textarea
                id="lockReason"
                placeholder="Ví dụ: Vi phạm quy định cộng đồng, spam, hành vi không phù hợp..."
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Lý do này sẽ được hiển thị cho người dùng khi họ cố gắng đăng nhập.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setLockingUser(null);
                setLockReason('');
              }}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmLock}
              disabled={!lockReason.trim() || toggleStatusMutation.isPending}
            >
              {toggleStatusMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Xác nhận khóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

