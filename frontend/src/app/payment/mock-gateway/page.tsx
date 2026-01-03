'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { mockProcessPayment } from '@/services/paymentService';
import { ROUTES } from '@/lib/constants';
import { useUIStore } from '@/stores/uiStore';
import { useCartStore } from '@/stores/cartStore';

function MockGatewayPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useUIStore();
  const { refreshCart } = useCartStore();
  
  const txnCode = searchParams.get('txnCode');
  const amount = searchParams.get('amount');
  const cartId = searchParams.get('cartId'); // Cart ID if checkout from cart
  const courseId = searchParams.get('courseId'); // Optional: for redirect back to course
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  // Validate required params
  useEffect(() => {
    if (!txnCode || !amount) {
      addToast({
        type: 'error',
        description: 'Thiếu thông tin giao dịch. Vui lòng thử lại.',
      });
      router.push(ROUTES.COURSES);
    }
  }, [txnCode, amount, router, addToast]);

  const handleSuccess = async () => {
    if (!txnCode) return;
    
    console.log('=== Payment Success Handler ===');
    console.log('txnCode:', txnCode);
    console.log('cartId:', cartId);
    console.log('All search params:', Object.fromEntries(searchParams.entries()));
    
    try {
      setIsProcessing(true);
      const response = await mockProcessPayment(txnCode, 'SUCCESS', cartId || undefined);
      console.log('Payment response:', response);
      
      // Refresh cart to remove purchased courses from cart
      console.log('Refreshing cart...');
      await refreshCart();
      console.log('Cart refreshed');
      
      setStatus('success');
      addToast({
        type: 'success',
        description: 'Thanh toán thành công! Đang chuyển hướng...',
      });
      
      // Redirect to My Courses after 1.5 seconds
      setTimeout(() => {
        router.push(ROUTES.STUDENT.MY_COURSES);
      }, 1500);
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      addToast({
        type: 'error',
        description: error.response?.data?.error || 'Không thể xử lý thanh toán. Vui lòng thử lại.',
      });
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!txnCode) return;
    
    try {
      setIsProcessing(true);
      await mockProcessPayment(txnCode, 'FAILED');
      
      setStatus('failed');
      addToast({
        type: 'info',
        description: 'Giao dịch đã bị hủy.',
      });
      
      // Redirect back to course detail or courses list
      setTimeout(() => {
        if (courseId) {
          router.push(ROUTES.COURSE_DETAIL(courseId));
        } else {
          router.push(ROUTES.COURSES);
        }
      }, 1500);
    } catch (error: any) {
      console.error('Payment cancellation failed:', error);
      addToast({
        type: 'error',
        description: 'Không thể hủy giao dịch. Vui lòng thử lại.',
      });
      setIsProcessing(false);
    }
  };

  if (!txnCode || !amount) {
    return null; // Will redirect in useEffect
  }

  const formattedAmount = parseFloat(amount).toLocaleString('vi-VN');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Mô phỏng VNPay Gateway
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Trang thanh toán mô phỏng cho mục đích demo
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Transaction Info */}
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Mã giao dịch:</span>
              <span className="font-mono text-sm font-semibold">{txnCode}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Số tiền:</span>
              <span className="text-lg font-bold text-primary">
                {formattedAmount}đ
              </span>
            </div>
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Thanh toán thành công!</span>
            </div>
          )}

          {status === 'failed' && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Giao dịch đã bị hủy</span>
            </div>
          )}

          {/* Action Buttons */}
          {status === 'idle' && (
            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={handleSuccess}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Thanh toán thành công
                  </>
                )}
              </Button>
              
              <Button
                variant="destructive"
                className="w-full"
                size="lg"
                onClick={handleCancel}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Hủy giao dịch
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Info Note */}
          <div className="text-xs text-center text-muted-foreground pt-4 border-t">
            <p>Đây là trang thanh toán mô phỏng.</p>
            <p>Trong môi trường thực tế, bạn sẽ được chuyển đến cổng thanh toán VNPay.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MockGatewayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <MockGatewayPageContent />
    </Suspense>
  );
}

