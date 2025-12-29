"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInstructorCourseReviews, replyToReview, Review } from "@/services/reviewService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUIStore } from "@/stores/uiStore";
import { 
  Star, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock,
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react";

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function InstructorReviewsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const [page, setPage] = useState(0);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["instructor-reviews", page],
    queryFn: () => getInstructorCourseReviews(page, 10),
  });

  const replyMutation = useMutation({
    mutationFn: ({ reviewId, reply }: { reviewId: number; reply: string }) =>
      replyToReview(reviewId, reply),
    onSuccess: () => {
      addToast({ type: 'success', description: "Đã gửi phản hồi thành công!" });
      queryClient.invalidateQueries({ queryKey: ["instructor-reviews"] });
      setReplyingTo(null);
      setReplyText("");
    },
    onError: (error: Error) => {
      addToast({ type: 'error', description: error.message || "Có lỗi xảy ra khi gửi phản hồi" });
    },
  });

  const handleReply = (reviewId: number) => {
    if (!replyText.trim()) {
      addToast({ type: 'error', description: "Vui lòng nhập nội dung phản hồi" });
      return;
    }
    replyMutation.mutate({ reviewId, reply: replyText.trim() });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card className="border-destructive">
          <CardContent className="py-6">
            <p className="text-destructive">Có lỗi xảy ra khi tải đánh giá</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reviews = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý đánh giá</h1>
        <p className="text-muted-foreground">
          Xem và phản hồi đánh giá từ học viên ({totalElements} đánh giá)
        </p>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Chưa có đánh giá nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: Review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {review.userAvatar ? (
                        <img
                          src={review.userAvatar}
                          alt={review.userFullName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">{review.userFullName}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-xs">
                          {formatDate(review.createdAt)}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.instructorReply ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Đã phản hồi
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-600">
                        <Clock className="h-3 w-3" />
                        Chờ phản hồi
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Course info */}
                <div className="text-sm">
                  <span className="text-muted-foreground">Khóa học: </span>
                  <span className="font-medium">{review.courseTitle}</span>
                </div>

                {/* Student's comment */}
                {review.comment && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm">{review.comment}</p>
                  </div>
                )}

                {/* Instructor's reply */}
                {review.instructorReply && (
                  <div className="bg-primary/5 border-l-4 border-primary p-3 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default" className="text-xs">Phản hồi của bạn</Badge>
                      {review.repliedAt && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.repliedAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{review.instructorReply}</p>
                  </div>
                )}

                {/* Reply form */}
                {!review.instructorReply && (
                  <div className="pt-2">
                    {replyingTo === review.id ? (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Nhập phản hồi của bạn..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                          className="resize-none"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReply(review.id)}
                            disabled={replyMutation.isPending}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            {replyMutation.isPending ? "Đang gửi..." : "Gửi phản hồi"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText("");
                            }}
                            disabled={replyMutation.isPending}
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReplyingTo(review.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Phản hồi
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

