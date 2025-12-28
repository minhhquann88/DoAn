'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, ArrowLeft, CreditCard, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { checkout } from '@/services/cartService';
import { useUIStore } from '@/stores/uiStore';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { cart, isLoading, fetchCart, removeFromCart, refreshCart } = useCartStore();
  const { addToast } = useUIStore();
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleRemoveItem = async (itemId: number) => {
    await removeFromCart(itemId);
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      addToast({
        type: 'error',
        description: 'Giỏ hàng trống',
      });
      return;
    }

    try {
      setIsCheckingOut(true);
      const response = await checkout();
      
      // Redirect to payment gateway
      window.location.href = response.paymentUrl;
    } catch (error: any) {
      console.error('Checkout failed:', error);
      addToast({
        type: 'error',
        description: error.response?.data?.error || 'Không thể tạo thanh toán. Vui lòng thử lại.',
      });
      setIsCheckingOut(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Vui lòng đăng nhập</CardTitle>
            <CardDescription>
              Bạn cần đăng nhập để xem giỏ hàng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={ROUTES.LOGIN}>Đăng nhập</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href={ROUTES.COURSES}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold font-poppins mb-2">
                Giỏ hàng của tôi
              </h1>
              <p className="text-muted-foreground">
                Quản lý các khóa học bạn muốn mua
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Giỏ hàng trống</h2>
            <p className="text-muted-foreground mb-6">
              Bạn chưa thêm khóa học nào vào giỏ hàng
            </p>
            <Button asChild>
              <Link href={ROUTES.COURSES}>
                <BookOpen className="h-4 w-4 mr-2" />
                Khám phá khóa học
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Course Image */}
                      <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        {item.course.imageUrl ? (
                          <Image
                            src={item.course.imageUrl}
                            alt={item.course.title}
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                              {item.course.title}
                            </h3>
                            {item.course.instructor && (
                              <p className="text-sm text-muted-foreground mb-2">
                                Giảng viên: {item.course.instructor.fullName}
                              </p>
                            )}
                            {item.course.category && (
                              <Badge variant="outline" className="mb-2">
                                {item.course.category.name}
                              </Badge>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-2xl font-bold text-primary">
                                {item.course.price.toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="h-5 w-5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Tóm tắt đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Số lượng khóa học
                      </span>
                      <span className="font-medium">{cart.itemCount}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Tổng tiền</span>
                      <span className="text-primary">
                        {cart.totalAmount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckout}
                    disabled={cart.items.length === 0 || isCheckingOut}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    {isCheckingOut ? 'Đang xử lý...' : 'Thanh toán'}
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    asChild
                  >
                    <Link href={ROUTES.COURSES}>
                      Tiếp tục mua sắm
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

