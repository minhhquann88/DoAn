'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMeeting, joinMeeting, leaveMeeting, endMeeting, type Meeting } from '@/services/meetingService';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { ROUTES } from '@/lib/constants';
import JitsiMeet from '@/components/meeting/JitsiMeet';
// Helper function to format date
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export default function InstructorMeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();
  const meetingId = params.id as string;
  const [hasJoined, setHasJoined] = React.useState(false);

  // Fetch meeting
  const { data: meeting, isLoading } = useQuery<Meeting>({
    queryKey: ['meeting', meetingId],
    queryFn: () => getMeeting(Number(meetingId)),
    enabled: !!meetingId,
  });

  // Join meeting mutation
  const joinMutation = useMutation({
    mutationFn: () => joinMeeting(Number(meetingId)),
    onSuccess: () => {
      setHasJoined(true);
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        message: error.response?.data?.error || 'Không thể tham gia phòng họp',
      });
    },
  });

  // Leave meeting mutation
  const leaveMutation = useMutation({
    mutationFn: () => leaveMeeting(Number(meetingId)),
    onSuccess: () => {
      setHasJoined(false);
      router.push(ROUTES.INSTRUCTOR.MEETINGS);
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        message: error.response?.data?.error || 'Không thể rời phòng họp',
      });
    },
  });

  // End meeting mutation
  const endMutation = useMutation({
    mutationFn: () => endMeeting(Number(meetingId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
      router.push(ROUTES.INSTRUCTOR.MEETINGS);
      addToast({
        type: 'success',
        message: 'Đã kết thúc phòng họp!',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        message: error.response?.data?.error || 'Không thể kết thúc phòng họp',
      });
    },
  });

  // Auto join when meeting is ONGOING or SCHEDULED
  useEffect(() => {
    if (meeting && (meeting.status === 'ONGOING' || meeting.status === 'SCHEDULED') && !hasJoined && !joinMutation.isPending) {
      joinMutation.mutate();
    }
  }, [meeting, hasJoined]);

  const handleJoin = () => {
    if (meeting?.status !== 'ONGOING' && meeting?.status !== 'SCHEDULED') {
      addToast({
        type: 'error',
        message: 'Phòng họp không thể tham gia',
      });
      return;
    }
    joinMutation.mutate();
  };

  const handleLeave = () => {
    if (confirm('Bạn có chắc chắn muốn rời phòng họp?')) {
      leaveMutation.mutate();
    }
  };

  const handleEnd = () => {
    if (confirm('Bạn có chắc chắn muốn kết thúc phòng họp này? Tất cả người tham gia sẽ bị đưa ra khỏi phòng.')) {
      endMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy phòng họp</h2>
          <p className="text-muted-foreground mb-4">Phòng họp này không tồn tại hoặc đã bị xóa</p>
          <Button onClick={() => router.push(ROUTES.INSTRUCTOR.MEETINGS)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const canJoin = meeting.status === 'ONGOING' || meeting.status === 'SCHEDULED';
  const isOngoing = meeting.status === 'ONGOING';

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-background p-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(ROUTES.INSTRUCTOR.MEETINGS)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-xl font-bold">{meeting.title}</h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDateTime(meeting.startTime)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {meeting.durationMinutes} phút
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Tối đa {meeting.maxParticipants} người
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOngoing && (
              <Button variant="destructive" size="sm" onClick={handleEnd} disabled={endMutation.isPending}>
                Kết thúc phòng họp
              </Button>
            )}
            {hasJoined && (
              <Button variant="outline" size="sm" onClick={handleLeave} disabled={leaveMutation.isPending}>
                Rời phòng
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Meeting Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!hasJoined && !isOngoing && !joinMutation.isPending ? (
          <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Tham gia phòng họp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {meeting.description || 'Không có mô tả'}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {meeting.status === 'SCHEDULED' ? 'Đã lên lịch' : meeting.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Mã phòng: <code className="px-1 py-0.5 bg-muted rounded">{meeting.meetingCode}</code>
                    </span>
                  </div>
                </div>
                {canJoin ? (
                  <Button onClick={handleJoin} className="w-full" disabled={joinMutation.isPending}>
                    {joinMutation.isPending ? 'Đang tham gia...' : 'Tham gia phòng họp'}
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    Phòng họp chưa sẵn sàng
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex-1 relative overflow-hidden">
            <JitsiMeet
              roomName={meeting.meetingCode}
              displayName={user?.fullName || user?.username || 'Instructor'}
              config={{
                startWithAudioMuted: false,
                startWithVideoMuted: false,
                enableWelcomePage: false,
                enableClosePage: true,
              }}
              onLeave={handleLeave}
            />
          </div>
        )}
      </div>
    </div>
  );
}

