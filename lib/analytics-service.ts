import { apiService } from './api'; // Your API client

// Interfaces for all KPIs
export interface UserAnalytics {
  totalUsers: number;
  usersByRole: { role: string; count: number }[];
  usersByDepartment: { department: string; count: number }[];
  usersByLocation: { location: string; count: number }[];
  topParticipants: { userId: string; userName: string; participationCount: number }[];
  topManagers: { managerId: string; managerName: string; managedEvents: number }[];
  averageTasksAssigned: number;
}

export interface EventAnalytics {
  totalEvents: number;
  eventsByStatus: { status: string; count: number }[];
  eventsByCategory: { category: string; count: number }[];
  averageParticipants: number;
  averageBudget: number;
  totalBudget?: number;
  topEventsByParticipants: { eventId: string; title: string; count: number }[];
  averageFillRate: number;
}

export interface SeriesOverview {
  seriesId: string;
  name: string;
  description?: string;
  totalEvents: number;
  totalBudget: number;
  taskCompletionRate: number;
}

export interface SeriesTrendItem {
  eventId: string;
  eventTitle: string;
  year: number;
  participantsCount: number;
  budget: number;
}

export interface SeriesTrend {
  trend: SeriesTrendItem[];
  topParticipants: { userId: string; userName: string; eventsParticipated: number }[];
  repeatParticipantCount: number;
}

export interface TopEvent {
  eventId: string;
  title: string;
  series?: string | null;
  participantsCount: number;
  taskCompletionRate: number;
  budget: number;
  score: number;
}

export interface TaskAnalytics {
  totalTasks: number;
  tasksByStatus: { status: string; count: number }[];
  overdueTasks: number;
  averageCompletionTime: number;
  topUsersByCompletedTasks: { userId: string; userName: string; completedCount: number }[];
}

export interface CostAnalytics {
  totalCosts: number;
  costsByLabel: { label: string; total: number }[];
  averageCostPerEvent: number;
}

export interface ParticipantAnalytics {
  totalUniqueParticipants: number;
  averageParticipationPerUser: number;
}

class AnalyticsService {
  async getUserAnalytics(): Promise<UserAnalytics> {
    return apiService.request('/analytics/users', { method: 'GET' }, false, 30000);
  }

  async getEventAnalytics(year?: number): Promise<EventAnalytics> {
    const params = year ? `?year=${year}` : '';
    return apiService.request(`/analytics/events${params}`, { method: 'GET' }, false, 30000);
  }

  async getSeriesOverview(): Promise<SeriesOverview[]> {
    return apiService.request('/analytics/series', { method: 'GET' }, false, 30000);
  }

  async getSeriesTrend(seriesId: string): Promise<SeriesTrend> {
    return apiService.request(`/analytics/series/${seriesId}/trend`, { method: 'GET' }, false, 30000);
  }

  async getGlobalTopEvents(limit = 10): Promise<TopEvent[]> {
    return apiService.request(`/analytics/events/top?limit=${limit}`, { method: 'GET' }, false, 30000);
  }

  async getTaskAnalytics(): Promise<TaskAnalytics> {
    return apiService.request('/analytics/tasks', { method: 'GET' }, false, 30000);
  }

  async getCostAnalytics(): Promise<CostAnalytics> {
    return apiService.request('/analytics/costs', { method: 'GET' }, false, 30000);
  }

  async getParticipantAnalytics(): Promise<ParticipantAnalytics> {
    return apiService.request('/analytics/participants', { method: 'GET' }, false, 30000);
  }

  async getAvailableYears(): Promise<{ years: number[] }> {
    return apiService.request('/analytics/years', { method: 'GET' }, false, 30000);
  }

  async getEventsList(): Promise<{ id: string; title: string; year: number }[]> {
    return apiService.request('/analytics/events/list', { method: 'GET' }, false, 30000);
  }
}

export const analyticsService = new AnalyticsService();
