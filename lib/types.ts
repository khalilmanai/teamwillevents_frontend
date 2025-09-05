import type { Role } from "./roles";
import { EventStatus } from "./event-status";

// User-related types
export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  avatarUrl?: string;
  avatarPublicId?: string;
  phone?: string;
  address?: string;
  department?: string;
  job?: string;
  joinedAt?: string;
}

// Event-related types
export interface CostItem {
  id: string;
  label: string;
  price: number;
  quantity: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxCapacity: number;
  currentParticipants: number;
  imageUrl?: string;
  createdBy: string;
  category?: string;
  status: EventStatus;
  tags: string[];
  isRegistered?: boolean;
  participants: User[];
  organizers: User[];
  budget?: number;
  costItems?: CostItem[];
  EventSeriesId?: string;
}

export interface EventDetails {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  managers: {
    name: string;
    avatarUrl?: string;
  }[];
  participants: Participant[];
  status: string;
  category?: string;
}

// Participant type
export interface Participant {
  id: string;
  name: string;
  job?: string;
  avatarUrl?: string;
}

// Voice & AI content
export interface VoiceTranscription {
  text: string;
  confidence: number;
  isProcessing: boolean;
}

export interface AIGeneratedContent {
  title: string;
  description: string;
  tags: string[];
}

// Profile & Authentication
export interface UpdateProfileData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  location?: string;
  avatarUrl?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Generic paginated response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

// Messaging types
export interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'file';
  eventId: string;
  sender: {
    id: string;
    name?: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt?: string;
  edited?: boolean;
  pending?: boolean;
  reactions?: Array<{
    emoji: string;
    userId: string;
    createdAt?: string;
  }>;
  replyTo?: {
    id: string;
    content: string;
    sender: { id: string; username: string };
    type?: 'text' | 'image' | 'video' | 'file';
  };
  mediaUrl?: string;
}

// Task types
export type TaskStatus = 'ACCEPTED' | 'PENDING' | 'REJECTED' | 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  event?: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    imageUrl?: string;
  };
  assignedTo?: { id: string; name: string; avatarUrl?: string };
  assignedBy?: { id: string; name: string; avatarUrl?: string };
}

export interface CreateTaskDto {
  title: string;
  description: string;
  status?: TaskStatus;
  assignedToId?: string;
}

export interface AssignTaskDto {
  taskId: string;
  employeeId: string;
}// types/analytics.ts

export interface ParticipationTrend {
  period: string
  participants: number
  events: number
}

export interface BudgetItem {
  name: string
  value: number
}

export interface CostItem {
  id: string
  label: string
  price: number
  quantity: number
  category?: string
  createdAt?: string
  updatedAt?: string
}

export interface EventSeries {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  eventsCount?: number
}

// Notifications
export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  link?: string | null;
  metadata?: any;
  eventId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface SendNotificationDto {
  userId: number;
  title: string;
  message: string;
  type: Notification;
  link?: string;
  metadata?: Record<string, any>;
}
