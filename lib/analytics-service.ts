import { apiService } from "./api"

export interface SeriesOverview {
  seriesId: string
  seriesName: string
  participants: number
  utilization: number | null
}

export interface CategoryDistribution {
  category: string
  count: number
}

export interface AnalyticsOverview {
  seriesData: SeriesOverview[]
  totalSeries: number
  totalParticipants: number
  averageUtilization: number
}

export interface RepeatParticipant {
  userId: string
  userName: string
  participationCount: number
  events: string[]
}

export interface TopEvent {
  eventId: string
  eventName: string
  participants: number
  fillRate: number
}

export interface StatusBreakdown {
  status: string
  count: number
}

export interface LocationDistribution {
  location: string
  count: number
}

export interface OrganizerPerformance {
  organizerId: string
  organizerName: string
  totalEvents: number
  averageParticipants: number
}

export interface LeadTimeStat {
  eventId: string
  leadTimeDays: number
}

export interface BudgetStat {
  eventId: string
  budget: number
}

class AnalyticsService {
  // === Existing ===
  async getOverview(year: number): Promise<AnalyticsOverview> {
    return apiService.request(`/analytics/overview?year=${year}`, { method: "GET" }, false, 30000)
  }

  async getCategoryDistribution(year: number): Promise<CategoryDistribution[]> {
    return apiService.request(`/analytics/category-distribution?year=${year}`, { method: "GET" }, false, 30000)
  }

  async getRepeatParticipants(seriesId: string, year?: number): Promise<RepeatParticipant[]> {
    const params = new URLSearchParams({ seriesId })
    if (year) params.append("year", year.toString())
    return apiService.request(`/analytics/repeat-participants?${params.toString()}`, { method: "GET" }, false, 30000)
  }

  async getParticipationTrends(
    year: number, // <- required
    seriesId?: string,
    timeframe: "month" | "quarter" | "year" = "month",
  ) {
    if (!year || Number.isNaN(year)) throw new Error("Year is required")

    const params = new URLSearchParams({ year: year.toString(), timeframe })
    if (seriesId) params.append("seriesId", seriesId)

    return apiService.request(`/analytics/participation-trends?${params.toString()}`, { method: "GET" }, false, 30000)
  }

  async getUtilizationMetrics(year: number) {
    return apiService.request(`/analytics/utilization-metrics?year=${year}`, { method: "GET" }, false, 30000)
  }

  // === Re-added old endpoints ===
  async getTopEvents(year: number, by: "participants" | "fillRate" = "participants", limit = 5): Promise<TopEvent[]> {
    const params = new URLSearchParams({ year: year.toString(), by, limit: limit.toString() })
    return apiService.request(`/analytics/top-events?${params.toString()}`, { method: "GET" }, false, 30000)
  }

  async getStatusBreakdown(year: number): Promise<StatusBreakdown[]> {
    return apiService.request(`/analytics/status-breakdown?year=${year}`, { method: "GET" }, false, 30000)
  }

  async getLocationDistribution(year: number): Promise<LocationDistribution[]> {
    return apiService.request(`/analytics/location-distribution?year=${year}`, { method: "GET" }, false, 30000)
  }

  async getOrganizerPerformance(year: number): Promise<OrganizerPerformance[]> {
    return apiService.request(`/analytics/organizer-performance?year=${year}`, { method: "GET" }, false, 30000)
  }

  async getLeadTimeStats(year: number): Promise<LeadTimeStat[]> {
    return apiService.request(`/analytics/lead-time?year=${year}`, { method: "GET" }, false, 30000)
  }

  async getBudgetStats(year: number): Promise<BudgetStat[]> {
    return apiService.request(`/analytics/budget?year=${year}`, { method: "GET" }, false, 30000)
  }

  async getSeriesYearlyStats(seriesId: string): Promise<any> {
    return apiService.request(`/analytics/series/${seriesId}/yearly-stats`, { method: "GET" }, false, 30000)
  }

  async getSeriesOverview(year: number): Promise<SeriesOverview[]> {
    return apiService.request(`/analytics/series-overview?year=${year}`, { method: "GET" }, false, 30000)
  }
}

export const analyticsService = new AnalyticsService()
