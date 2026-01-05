'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Video,
  Calendar,
  Clock,
  Users,
  Play,
  Square,
  Search,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { getMeetings, joinMeetingByCode, type Meeting } from '@/services/meetingService';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { ROUTES } from '@/lib/constants';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function StudentMeetingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [joinCodeDialogOpen, setJoinCodeDialogOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  // Fetch meetings (only ONGOING and SCHEDULED)
  const { data: meetings = [], isLoading } = useQuery<Meeting[]>({
    queryKey: ['student-meetings'],
    queryFn: () => getMeetings({ status: 'ONGOING' }),
  });

  // Join by code mutation
  const joinByCodeMutation = useMutation({
    mutationFn: joinMeetingByCode,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student-meetings'] });
      setJoinCodeDialogOpen(false);
      setJoinCode('');
      router.push(ROUTES.STUDENT.MEETING(data.meeting.id.toString()));
      addToast({
        type: 'success',
        message: 'Đã tham gia phòng họp thành công!',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        message: error.response?.data?.error || 'Không thể tham gia phòng họp. Vui lòng kiểm tra lại mã phòng.',
      });
    },
  });

  const handleJoinByCode = () => {
    if (!joinCode.trim()) {
      addToast({
        type: 'error',
        message: 'Vui lòng nhập mã phòng họp',
      });
      return;
    }
    joinByCodeMutation.mutate(joinCode.trim());
  };

  const handleJoin = (meeting: Meeting) => {
    if (meeting.status !== 'ONGOING' && meeting.status !== 'SCHEDULED') {
      addToast({
        type: 'error',
        message: 'Phòng họp không thể tham gia',
      });
      return;
    }
    router.push(ROUTES.STUDENT.MEETING(meeting.id.toString()));
  };

  const filteredMeetings = meetings.filter((meeting) =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.meetingCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: Meeting['status']) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="h-3 w-3 mr-1" />
            Đã lên lịch
          </Badge>
        );
      case 'ONGOING':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Play className="h-3 w-3 mr-1" />
            Đang diễn ra
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full space-y-6 p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Phòng họp</h1>
          <p className="text-muted-foreground mt-1">
            Tham gia các buổi học trực tuyến với giảng viên
          </p>
        </div>
        <Button onClick={() => setJoinCodeDialogOpen(true)}>
          <Video className="h-4 w-4 mr-2" />
          Tham gia bằng mã
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm phòng họp..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredMeetings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'Không tìm thấy phòng họp' : 'Chưa có phòng họp nào đang diễn ra'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery
                ? 'Thử tìm kiếm với từ khóa khác hoặc tham gia bằng mã phòng họp'
                : 'Các phòng họp đang diễn ra sẽ hiển thị ở đây. Bạn cũng có thể tham gia bằng mã phòng họp.'}
            </p>
            <Button onClick={() => setJoinCodeDialogOpen(true)}>
              <Video className="h-4 w-4 mr-2" />
              Tham gia bằng mã
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredMeetings.map((meeting) => (
            <Card key={meeting.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      {meeting.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {meeting.description || 'Không có mô tả'}
                    </CardDescription>
                  </div>
                  {getStatusBadge(meeting.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Thời gian:</span>
                      <span className="font-medium">
                        {formatDateTime(meeting.startTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Thời lượng:</span>
                      <span className="font-medium">{meeting.durationMinutes} phút</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Tối đa:</span>
                      <span className="font-medium">{meeting.maxParticipants} người</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Mã phòng:</span>
                      <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                        {meeting.meetingCode}
                      </code>
                    </div>
                  </div>

                  {meeting.courseTitle && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Khóa học: </span>
                      <span className="font-medium">{meeting.courseTitle}</span>
                    </div>
                  )}

                  {meeting.instructorName && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Giảng viên: </span>
                      <span className="font-medium">{meeting.instructorName}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t">
                    {meeting.status === 'ONGOING' ? (
                      <Button onClick={() => handleJoin(meeting)} className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Tham gia ngay
                      </Button>
                    ) : meeting.status === 'SCHEDULED' ? (
                      <Button
                        onClick={() => handleJoin(meeting)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Tham gia (sắp bắt đầu)
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Join by Code Dialog */}
      <Dialog open={joinCodeDialogOpen} onOpenChange={setJoinCodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tham gia bằng mã phòng họp</DialogTitle>
            <DialogDescription>
              Nhập mã phòng họp mà giảng viên đã cung cấp để tham gia
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="join-code" className="text-sm font-medium">
                Mã phòng họp
              </label>
              <Input
                id="join-code"
                placeholder="Ví dụ: ABC-1234"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleJoinByCode();
                  }
                }}
                className="font-mono text-center text-lg tracking-wider"
              />
              <p className="text-xs text-muted-foreground">
                Mã phòng họp thường có định dạng: XXX-####
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJoinCodeDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleJoinByCode}
              disabled={joinByCodeMutation.isPending || !joinCode.trim()}
            >
              {joinByCodeMutation.isPending ? 'Đang tham gia...' : 'Tham gia'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

