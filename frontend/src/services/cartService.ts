/**
 * Cart Service - Quản lý giỏ hàng
 */
import apiClient from '@/lib/api';

// =====================
// TYPES
// =====================

export interface CartItem {
  id: number;
  course: {
    id: number;
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    totalDurationInHours?: number;
    status: string;
    createdAt: string;
    enrollmentCount?: number;
    isFeatured?: boolean;
    isPublished?: boolean;
    isEnrolled?: boolean;
    category?: {
      id: number;
      name: string;
    };
    instructor?: {
      id: number;
      fullName: string;
      avatarUrl?: string;
    };
  };
  addedAt: string;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  courseId: number;
}

// =====================
// API FUNCTIONS
// =====================

/**
 * Lấy giỏ hàng của user hiện tại
 * GET /api/v1/cart
 */
export const getCart = async (): Promise<Cart> => {
  const response = await apiClient.get<Cart>('/v1/cart');
  return response.data;
};

/**
 * Thêm khóa học vào giỏ hàng
 * POST /api/v1/cart/add
 */
export const addToCart = async (courseId: number): Promise<Cart> => {
  const response = await apiClient.post<Cart>('/v1/cart/add', { courseId });
  return response.data;
};

/**
 * Xóa item khỏi giỏ hàng
 * DELETE /api/v1/cart/items/{itemId}
 */
export const removeFromCart = async (itemId: number): Promise<Cart> => {
  const response = await apiClient.delete<Cart>(`/v1/cart/items/${itemId}`);
  return response.data;
};

/**
 * Xóa tất cả items khỏi giỏ hàng
 * DELETE /api/v1/cart/clear
 */
export const clearCart = async (): Promise<void> => {
  await apiClient.delete('/v1/cart/clear');
};

/**
 * Checkout từ giỏ hàng - Tạo payment URL
 * POST /api/v1/cart/checkout
 */
export const checkout = async (): Promise<{
  paymentUrl: string;
  transactionCode: string;
  amount: string;
  cartId: string;
}> => {
  const response = await apiClient.post<{
    paymentUrl: string;
    transactionCode: string;
    amount: string;
    cartId: string;
  }>('/v1/cart/checkout');
  return response.data;
};

export default {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  checkout,
};

