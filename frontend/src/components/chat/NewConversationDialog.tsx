'use client';

import React, { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import * as chatService from '@/services/chatService';
import { Loader2 } from 'lucide-react';
import type { InstructorInfo } from '@/services/chatService';
import { ROUTES } from '@/lib/constants';

interface NewConversationDialogProps {
  onConversationCreated?: (conversation: chatService.Conversation) => void;
  courseId?: number; // Optional: để tự động filter theo khóa học
}

export function NewConversationDialog({ onConversationCreated, courseId }: NewConversationDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const router = useRouter();

  // Fetch users (students for instructors, instructors for students)
  const { data: users, isLoading } = useQuery({
    queryKey: ['chat-users', user?.role],
    queryFn: async () => {
      try {
        if (user?.role === 'ROLE_STUDENT') {
          // Get instructors from enrolled courses
          const instructors = await chatService.getEnrolledInstructors();
          return instructors.map(inst => ({
            id: inst.id,
            fullName: inst.fullName,
            username: inst.username,
            email: inst.email,
            avatarUrl: inst.avatarUrl,
            role: 'ROLE_LECTURER',
            courseId: inst.courseId,
            courseTitle: inst.courseTitle,
          }));
        } else {
          // For instructors: Get students from their courses
          // TODO: Create endpoint /v1/chat/users/students for instructors
          return [];
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    },
    enabled: open && !!user,
  });

  const filteredUsers = users?.filter((u) => {
    // Filter by courseId if provided
    if (courseId && u.courseId !== courseId) {
      return false;
    }
    
    // Filter by search query
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(query) ||
      u.username?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.courseTitle?.toLowerCase().includes(query)
    );
  }) || [];

  const handleCreateConversation = async (targetUser: any) => {
    try {
      const conversation = await chatService.createConversation({ 
        userId: targetUser.id,
        courseId: targetUser.courseId || courseId, // Include courseId for validation
      });
      addToast({
        type: 'success',
        description: 'Đã tạo cuộc trò chuyện mới',
      });
      setOpen(false);
      setSearchQuery('');
      
      // Navigate to messages page with conversation selected
      const messagesPath = user?.role === 'ROLE_STUDENT' 
        ? ROUTES.STUDENT.MESSAGES
        : ROUTES.INSTRUCTOR.MESSAGES;
      router.push(`${messagesPath}?conversation=${conversation.id}`);
      
      onConversationCreated?.(conversation);
    } catch (error: any) {
      addToast({
        type: 'error',
        description: error.response?.data?.message || 'Không thể tạo cuộc trò chuyện',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <UserPlus className="h-4 w-4 mr-2" />
          Cuộc trò chuyện mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bắt đầu cuộc trò chuyện mới</DialogTitle>
          <DialogDescription>
            Tìm kiếm {user?.role === 'ROLE_STUDENT' ? 'giảng viên' : 'học viên'} để trò chuyện
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <p className="mb-2">Chức năng này đang được phát triển</p>
                <p className="text-xs">Bạn có thể bắt đầu trò chuyện từ danh sách cuộc trò chuyện hiện có</p>
              </div>
            ) : (
              filteredUsers.map((targetUser) => (
                <div
                  key={`${targetUser.id}-${targetUser.courseId || ''}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => handleCreateConversation(targetUser)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={targetUser.avatarUrl || undefined} />
                    <AvatarFallback>{targetUser.fullName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm truncate">{targetUser.fullName}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {targetUser.role === 'ROLE_LECTURER' ? 'Giảng viên' : 'Học viên'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {targetUser.courseTitle ? `${targetUser.courseTitle}` : targetUser.email}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

