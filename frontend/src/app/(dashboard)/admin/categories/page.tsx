'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, type AdminCategory } from '@/services/adminService';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useForm } from 'react-hook-form';

interface CategoryFormData {
  name: string;
  description?: string;
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<AdminCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = React.useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>();

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminService.getCategories(),
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => adminService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setIsCreateDialogOpen(false);
      reset();
      addToast({
        type: 'success',
        description: 'Tạo danh mục thành công',
      });
    },
    onError: (error: any) => {
      let errorMessage = 'Có lỗi xảy ra khi tạo danh mục';
      
      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = error.response.data?.message || 'Tên danh mục đã tồn tại';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Dữ liệu không hợp lệ';
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      }
      
      addToast({
        type: 'error',
        description: errorMessage,
      });
    },
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryFormData }) =>
      adminService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setEditingCategory(null);
      reset();
      addToast({
        type: 'success',
        description: 'Cập nhật danh mục thành công',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        description: error.response?.data?.message || 'Có lỗi xảy ra',
      });
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setDeletingCategory(null);
      addToast({
        type: 'success',
        description: 'Xóa danh mục thành công',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        description: error.response?.data?.message || 'Có lỗi xảy ra',
      });
      setDeletingCategory(null);
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (category: AdminCategory) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      description: category.description || '',
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      setDeletingCategory(id);
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Danh mục</h1>
          <p className="text-muted-foreground">Thêm, sửa, xóa danh mục khóa học</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => reset()}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Thêm danh mục mới</DialogTitle>
                <DialogDescription>
                  Tạo danh mục mới để giảng viên có thể chọn khi tạo khóa học
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên danh mục *</Label>
                  <Input
                    id="name"
                    {...register('name', { required: 'Tên danh mục là bắt buộc' })}
                    placeholder="Ví dụ: Lập trình, Kinh tế..."
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Mô tả về danh mục..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    reset();
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Tạo
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Sửa danh mục</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin danh mục
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tên danh mục *</Label>
                <Input
                  id="edit-name"
                  {...register('name', { required: 'Tên danh mục là bắt buộc' })}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Mô tả</Label>
                <Textarea
                  id="edit-description"
                  {...register('description')}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingCategory(null);
                  reset();
                }}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Cập nhật
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tên danh mục</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : categories?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Chưa có danh mục nào
                </TableCell>
              </TableRow>
            ) : (
              categories?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.description || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        disabled={deletingCategory === category.id}
                      >
                        {deletingCategory === category.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Xóa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

