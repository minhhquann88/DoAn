'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, User, ThumbsUp, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/ui/star-rating';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import {
  getCourseReviews,
  getCourseRating,
  getMyReview,
  createOrUpdateReview,
  canReview,
  type Review,
  type CourseRating,
} from '@/services/reviewService';

interface ReviewSectionProps {
  courseId: number;
  showWriteReview?: boolean;
}

export function ReviewSection({ courseId, showWriteReview = true }: ReviewSectionProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();

  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);

  // Fetch course rating summary
  const { data: ratingData, isLoading: isLoadingRating } = useQuery({
    queryKey: ['course-rating', courseId],
    queryFn: () => getCourseRating(courseId),
  });

  // Fetch reviews
  const { data: reviewsData, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['course-reviews', courseId],
    queryFn: () => getCourseReviews(courseId, 0, 10),
  });

  // Fetch my review (if authenticated)
  const { data: myReview, isLoading: isLoadingMyReview } = useQuery({
    queryKey: ['my-review', courseId],
    queryFn: () => getMyReview(courseId),
    enabled: isAuthenticated,
  });

  // Check if user can review
  const { data: canReviewData } = useQuery({
    queryKey: ['can-review', courseId],
    queryFn: () => canReview(courseId),
    enabled: isAuthenticated,
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: (data: { rating: number; comment: string }) =>
      createOrUpdateReview(courseId, data),
    onSuccess: () => {
      addToast({
        type: 'success',
        description: myReview ? 'Đã cập nhật đánh giá của bạn!' : 'Đã gửi đánh giá thành công!',
      });
      queryClient.invalidateQueries({ queryKey: ['course-rating', courseId] });
      queryClient.invalidateQueries({ queryKey: ['course-reviews', courseId] });
      queryClient.invalidateQueries({ queryKey: ['my-review', courseId] });
      queryClient.invalidateQueries({ queryKey: ['can-review', courseId] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        description: error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá',
      });
    },
  });

  // Initialize form with existing review
  React.useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment || '');
    }
  }, [myReview]);

  const handleSubmitReview = () => {
    if (rating === 0) {
      addToast({
        type: 'error',
        description: 'Vui lòng chọn số sao đánh giá',
      });
      return;
    }
    submitReviewMutation.mutate({ rating, comment });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const reviews = reviewsData?.content || [];
  const totalReviews = ratingData?.totalReviews || 0;
  const averageRating = ratingData?.averageRating || 0;
  const distribution = ratingData?.ratingDistribution || {};

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            Đánh giá khóa học
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRating ? (
            <div className="flex gap-8">
              <Skeleton className="h-24 w-32" />
              <Skeleton className="h-24 flex-1" />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8">
              {/* Average Rating */}
              <div className="text-center">
                <div className="text-5xl font-bold text-primary">
                  {averageRating.toFixed(1)}
                </div>
                <StarRating rating={averageRating} size="lg" className="justify-center mt-2" />
                <p className="text-sm text-muted-foreground mt-1">
                  {totalReviews} đánh giá
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = distribution[star] || 0;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm">{star}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Write Review Form */}
      {showWriteReview && isAuthenticated && canReviewData?.canReview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {myReview ? 'Đánh giá của bạn' : 'Viết đánh giá'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myReview && !isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <StarRating rating={myReview.rating} size="lg" />
                  <span className="text-sm text-muted-foreground">
                    {formatDate(myReview.createdAt)}
                  </span>
                </div>
                {myReview.comment && (
                  <p className="text-muted-foreground">{myReview.comment}</p>
                )}
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Chỉnh sửa đánh giá
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Đánh giá của bạn
                  </label>
                  <StarRating
                    rating={rating}
                    size="lg"
                    interactive
                    onChange={setRating}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Nhận xét (tùy chọn)
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn với khóa học này..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitReviewMutation.isPending || rating === 0}
                  >
                    {submitReviewMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang gửi...
                      </>
                    ) : myReview ? (
                      'Cập nhật đánh giá'
                    ) : (
                      'Gửi đánh giá'
                    )}
                  </Button>
                  {isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Hủy
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Not enrolled message */}
      {showWriteReview && isAuthenticated && canReviewData && !canReviewData.canReview && (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Bạn cần đăng ký khóa học để có thể đánh giá</p>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Tất cả đánh giá ({totalReviews})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingReviews ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có đánh giá nào cho khóa học này</p>
              {isAuthenticated && canReviewData?.canReview && (
                <p className="text-sm mt-2">Hãy là người đầu tiên đánh giá!</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="space-y-3">
                  {/* Student Review */}
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={review.userAvatar} />
                      <AvatarFallback>
                        {review.userFullName?.charAt(0) || review.userName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {review.userFullName || review.userName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          • {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <StarRating rating={review.rating} size="sm" className="mb-2" />
                      {review.comment && (
                        <p className="text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Instructor Reply */}
                  {review.instructorReply && (
                    <div className="ml-14 bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.instructorAvatar} />
                          <AvatarFallback className="text-xs">
                            {review.instructorName?.charAt(0) || 'GV'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {review.instructorName || 'Giảng viên'}
                          </span>
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                            Giảng viên
                          </span>
                          {review.repliedAt && (
                            <span className="text-xs text-muted-foreground">
                              • {formatDate(review.repliedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.instructorReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

