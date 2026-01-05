'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Video,
  Calendar,
  Clock,
  Users,
  Edit,
  Trash2,
  Play,
  Square,
  Copy,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  startMeeting,
  endMeeting,
  type Meeting,
  type MeetingRequest,
} from '@/services/meetingService';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
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

export default function InstructorMeetingsPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch meetings
  const { data: meetings = [], isLoading } = useQuery<Meeting[]>({
    queryKey: ['instructor-meetings'],
    queryFn: () => getMeetings({ instructorId: user?.id }),
  });

  // Create meeting mutation
  const createMutation = useMutation({
    mutationFn: createMeeting,
    onSuccess: (meeting) => {
      queryClient.invalidateQueries({ queryKey: ['instructor-meetings'] });
      setIsCreateDialogOpen(false);
      addToast({
        type: 'success',
        description: 'Tạo phòng họp thành công!',
      });
      // If meeting is ONGOING, redirect to meeting room
      if (meeting.status === 'ONGOING') {
        router.push(ROUTES.INSTRUCTOR.MEETING(meeting.id.toString()));
      }
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        description: error.response?.data?.error || 'Không thể tạo phòng họp',
      });
    },
  });

  // Update meeting mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MeetingRequest> }) =>
      updateMeeting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-meetings'] });
      setIsEditDialogOpen(false);
      setSelectedMeeting(null);
      addToast({
        type: 'success',
        description: 'Cập nhật phòng họp thành công!',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        description: error.response?.data?.error || 'Không thể cập nhật phòng họp',
      });
    },
  });

  // Delete meeting mutation
  const deleteMutation = useMutation({
    mutationFn: deleteMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-meetings'] });
      addToast({
        type: 'success',
        description: 'Xóa phòng họp thành công!',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        description: error.response?.data?.error || 'Không thể xóa phòng họp',
      });
    },
  });

  // Start meeting mutation
  const startMutation = useMutation({
    mutationFn: startMeeting,
    onSuccess: (meeting) => {
      queryClient.invalidateQueries({ queryKey: ['instructor-meetings'] });
      router.push(ROUTES.INSTRUCTOR.MEETING(meeting.id.toString()));
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        description: error.response?.data?.error || 'Không thể bắt đầu phòng họp',
      });
    },
  });

  // End meeting mutation
  const endMutation = useMutation({
    mutationFn: endMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-meetings'] });
      addToast({
        type: 'success',
        description: 'Đã kết thúc phòng họp!',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        description: error.response?.data?.error || 'Không thể kết thúc phòng họp',
      });
    },
  });

  const handleCreate = (data: MeetingRequest) => {
    createMutation.mutate(data);
  };

  const handleEdit = (data: Partial<MeetingRequest>) => {
    if (selectedMeeting) {
      updateMutation.mutate({ id: selectedMeeting.id, data });
    }
  };

  const handleDelete = (meeting: Meeting) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa phòng họp "${meeting.title}"?`)) {
      return;
    }
    deleteMutation.mutate(meeting.id);
  };

  const handleStart = (meeting: Meeting) => {
    startMutation.mutate(meeting.id);
  };

  const handleEnd = (meeting: Meeting) => {
    if (!confirm('Bạn có chắc chắn muốn kết thúc phòng họp này?')) {
      return;
    }
    endMutation.mutate(meeting.id);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    addToast({
      type: 'success',
      description: 'Đã sao chép mã phòng họp!',
    });
  };

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
      case 'ENDED':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <Square className="h-3 w-3 mr-1" />
            Đã kết thúc
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Đã hủy
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
            Tạo và quản lý các buổi học trực tuyến
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo phòng họp
        </Button>
      </div>

      {meetings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có phòng họp nào</h3>
            <p className="text-muted-foreground text-center mb-4">
              Tạo phòng họp đầu tiên để bắt đầu buổi học trực tuyến
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo phòng họp
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id}>
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
                      <div className="flex items-center gap-1">
                        <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                          {meeting.meetingCode}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopyCode(meeting.meetingCode)}
                        >
                          {copiedCode === meeting.meetingCode ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {meeting.courseTitle && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Khóa học: </span>
                      <span className="font-medium">{meeting.courseTitle}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t">
                    {meeting.status === 'SCHEDULED' && (
                      <Button
                        size="sm"
                        onClick={() => handleStart(meeting)}
                        disabled={startMutation.isPending}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Bắt đầu
                      </Button>
                    )}
                    {meeting.status === 'ONGOING' && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => router.push(ROUTES.INSTRUCTOR.MEETING(meeting.id.toString()))}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Vào phòng họp
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleEnd(meeting)}
                          disabled={endMutation.isPending}
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Kết thúc
                        </Button>
                      </>
                    )}
                    {meeting.status === 'ENDED' && (
                      <Button size="sm" variant="outline" disabled>
                        <Square className="h-4 w-4 mr-2" />
                        Đã kết thúc
                      </Button>
                    )}
                    {meeting.status !== 'ONGOING' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedMeeting(meeting);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(meeting)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Meeting Dialog */}
      <CreateMeetingDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />

      {/* Edit Meeting Dialog */}
      {selectedMeeting && (
        <EditMeetingDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          meeting={selectedMeeting}
          onSubmit={handleEdit}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}

// Create Meeting Dialog Component
function CreateMeetingDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MeetingRequest) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<MeetingRequest>({
    title: '',
    description: '',
    startTime: new Date().toISOString().slice(0, 16),
    durationMinutes: 60,
    maxParticipants: 50,
    isRecordingEnabled: false,
    startImmediately: false,
  });
  const [meetingType, setMeetingType] = useState<'immediate' | 'scheduled'>('scheduled');

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        title: '',
        description: '',
        startTime: new Date().toISOString().slice(0, 16),
        durationMinutes: 60,
        maxParticipants: 50,
        isRecordingEnabled: false,
        startImmediately: false,
      });
      setMeetingType('scheduled');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isImmediate = meetingType === 'immediate';
    const submitData: MeetingRequest = {
      ...formData,
      startImmediately: isImmediate,
      // If starting immediately, don't send startTime
      startTime: isImmediate ? undefined : formData.startTime,
    };
    onSubmit(submitData);
    setFormData({
      title: '',
      description: '',
      startTime: new Date().toISOString().slice(0, 16),
      durationMinutes: 60,
      maxParticipants: 50,
      isRecordingEnabled: false,
      startImmediately: false,
    });
    setMeetingType('scheduled');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo phòng họp mới</DialogTitle>
          <DialogDescription>
            Tạo phòng họp để tổ chức buổi học trực tuyến với học viên
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Ví dụ: Buổi học tuần 1 - HTML/CSS"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả về buổi học..."
                rows={3}
              />
            </div>
            {/* Meeting Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="meetingType">Loại cuộc họp *</Label>
              <Select
                value={meetingType}
                onValueChange={(value: 'immediate' | 'scheduled') => setMeetingType(value)}
              >
                <SelectTrigger id="meetingType" className="w-full">
                  <SelectValue placeholder="Chọn loại cuộc họp" />
                </SelectTrigger>
                <SelectContent className="z-[10000]" position="popper">
                  <SelectItem value="immediate">Cuộc họp ngay</SelectItem>
                  <SelectItem value="scheduled">Cuộc họp hẹn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={`grid gap-4 ${meetingType === 'scheduled' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {meetingType === 'scheduled' && (
                <div className="space-y-2">
                  <Label htmlFor="startTime">Thời gian bắt đầu *</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required={meetingType === 'scheduled'}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="duration">Thời lượng (phút) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="480"
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Số người tối đa</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="2"
                  max="100"
                  value={formData.maxParticipants}
                  onChange={(e) =>
                    setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang tạo...' : 'Tạo phòng họp'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Meeting Dialog Component
function EditMeetingDialog({
  open,
  onOpenChange,
  meeting,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: Meeting;
  onSubmit: (data: Partial<MeetingRequest>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<MeetingRequest>>({
    title: meeting.title,
    description: meeting.description || '',
    startTime: new Date(meeting.startTime).toISOString().slice(0, 16),
    durationMinutes: meeting.durationMinutes,
    maxParticipants: meeting.maxParticipants,
    isRecordingEnabled: meeting.isRecordingEnabled,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa phòng họp</DialogTitle>
          <DialogDescription>Cập nhật thông tin phòng họp</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Tiêu đề *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startTime">Thời gian bắt đầu *</Label>
                <Input
                  id="edit-startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Thời lượng (phút) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="15"
                  max="480"
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-maxParticipants">Số người tối đa</Label>
              <Input
                id="edit-maxParticipants"
                type="number"
                min="2"
                max="100"
                value={formData.maxParticipants}
                onChange={(e) =>
                  setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

