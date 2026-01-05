// Meeting Service
// API Base: /api/meetings
import apiClient from '@/lib/api';

const MEETING_PREFIX = '/meetings';

// =====================
// TYPES
// =====================

export interface Meeting {
  id: number;
  title: string;
  description?: string;
  courseId?: number;
  courseTitle?: string;
  instructorId: number;
  instructorName?: string;
  meetingCode: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  maxParticipants: number;
  status: 'SCHEDULED' | 'ONGOING' | 'ENDED' | 'CANCELLED';
  isRecordingEnabled: boolean;
  recordingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingRequest {
  title: string;
  description?: string;
  courseId?: number;
  startTime?: string; // Optional - if not provided or startImmediately=true, starts now
  durationMinutes?: number;
  maxParticipants?: number;
  isRecordingEnabled?: boolean;
  startImmediately?: boolean; // If true, meeting starts immediately
}

export interface MeetingParticipant {
  id: number;
  userId: number;
  userName?: string;
  userFullName?: string;
  meetingId: number;
  joinedAt: string;
  leftAt?: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isActive: boolean;
}

// =====================
// API FUNCTIONS
// =====================

/**
 * Get all meetings (with optional filters)
 */
export const getMeetings = async (params?: {
  courseId?: number;
  status?: string;
  instructorId?: number;
}): Promise<Meeting[]> => {
  const response = await apiClient.get(MEETING_PREFIX, { params });
  return response.data;
};

/**
 * Get meeting by ID
 */
export const getMeeting = async (id: number): Promise<Meeting> => {
  const response = await apiClient.get(`${MEETING_PREFIX}/${id}`);
  return response.data;
};

/**
 * Get meeting by code
 */
export const getMeetingByCode = async (code: string): Promise<Meeting> => {
  const response = await apiClient.get(`${MEETING_PREFIX}/code/${code}`);
  return response.data;
};

/**
 * Create meeting (instructor only)
 */
export const createMeeting = async (data: MeetingRequest): Promise<Meeting> => {
  const response = await apiClient.post(MEETING_PREFIX, data);
  return response.data;
};

/**
 * Update meeting (instructor only)
 */
export const updateMeeting = async (
  id: number,
  data: Partial<MeetingRequest>
): Promise<Meeting> => {
  const response = await apiClient.put(`${MEETING_PREFIX}/${id}`, data);
  return response.data;
};

/**
 * Delete meeting (instructor only)
 */
export const deleteMeeting = async (id: number): Promise<void> => {
  await apiClient.delete(`${MEETING_PREFIX}/${id}`);
};

/**
 * Start meeting (instructor only)
 */
export const startMeeting = async (id: number): Promise<Meeting> => {
  const response = await apiClient.post(`${MEETING_PREFIX}/${id}/start`);
  return response.data;
};

/**
 * End meeting (instructor only)
 */
export const endMeeting = async (id: number): Promise<Meeting> => {
  const response = await apiClient.post(`${MEETING_PREFIX}/${id}/end`);
  return response.data;
};

/**
 * Join meeting
 */
export const joinMeeting = async (id: number): Promise<MeetingParticipant> => {
  const response = await apiClient.post(`${MEETING_PREFIX}/${id}/join`);
  return response.data;
};

/**
 * Join meeting by code
 */
export const joinMeetingByCode = async (code: string): Promise<{
  meeting: Meeting;
  participant: MeetingParticipant;
}> => {
  const response = await apiClient.post(`${MEETING_PREFIX}/code/${code}/join`);
  return response.data;
};

/**
 * Leave meeting
 */
export const leaveMeeting = async (id: number): Promise<void> => {
  await apiClient.post(`${MEETING_PREFIX}/${id}/leave`);
};

/**
 * Get meeting participants
 */
export const getMeetingParticipants = async (
  id: number
): Promise<MeetingParticipant[]> => {
  const response = await apiClient.get(`${MEETING_PREFIX}/${id}/participants`);
  return response.data;
};

/**
 * Get active participants
 */
export const getActiveParticipants = async (
  id: number
): Promise<MeetingParticipant[]> => {
  const response = await apiClient.get(
    `${MEETING_PREFIX}/${id}/participants/active`
  );
  return response.data;
};

