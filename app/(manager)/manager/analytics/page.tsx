"use client";

import { use, useEffect, useState } from "react";
import { analyticsService, CostAnalytics, EventAnalytics, ParticipantAnalytics, SeriesOverview, SeriesTrend, TaskAnalytics, TopEvent, UserAnalytics } from "@/lib/analytics-service";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";

// Import shadcn components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { 
  CalendarIcon, 
  UsersIcon, 
  TicketIcon, 
  CheckCircleIcon, 
  DollarSignIcon, 
  TrendingUpIcon, 
  AlertCircleIcon,
  InfoIcon,
  BarChart3Icon,
  PieChartIcon,
  LineChartIcon,
  FilterIcon,
  RefreshCwIcon
} from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28FFF', '#FF6699', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
const STATUS_COLORS = {
  'COMPLETED': '#22c55e',
  'PENDING': '#f59e0b',
  'IN_PROGRESS': '#3b82f6',
  'CANCELLED': '#ef4444',
  'DRAFT': '#6b7280'
};


// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Card className="p-3 bg-background border shadow-lg">
        <p className="font-medium text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </Card>
    );
  }
  return null;
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format percentage
const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

// Loading components
const MetricSkeleton = () => (
  <Card>
    <CardHeader className="pb-2">
      <Skeleton className="h-4 w-24" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-16" />
    </CardContent>
  </Card>
);

const ChartSkeleton = () => (
  <div className="h-80 rounded-lg border bg-muted/20 animate-pulse" />
);

export default function AnalyticsDashboard() {
  const [seriesOverview, setSeriesOverview] = useState<SeriesOverview[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [seriesTrend, setSeriesTrend] = useState<SeriesTrend | null>(null);
  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics | null>(null);
  const [taskAnalytics, setTaskAnalytics] = useState<TaskAnalytics | null>(null);
  const [costAnalytics, setCostAnalytics] = useState<CostAnalytics | null>(null);
  const [participantAnalytics, setParticipantAnalytics] = useState<ParticipantAnalytics | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [events, setEvents] = useState<{ id: string; title: string; year: number }[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch available years and events
  const fetchInitialData = async () => {
    try {
      const [yearsData, eventsData] = await Promise.all([
        analyticsService.getAvailableYears(),
        analyticsService.getEventsList()
      ]);
      
      setAvailableYears(yearsData.years);
      setEvents(eventsData);
      
      // Set to most recent year if available
      if (yearsData.years.length > 0) {
        setSelectedYear(yearsData.years[yearsData.years.length - 1].toString());
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setError("Failed to load initial configuration data.");
    }
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      const yearParam = selectedYear === "all" ? undefined : Number(selectedYear);
      const eventParam = selectedEvent === "all" ? undefined : selectedEvent;

      // Validate selected year
      if (yearParam && !availableYears.includes(yearParam)) {
        setError(`No data available for year ${yearParam}. Showing data for all years instead.`);
        setSelectedYear("all");
        return;
      }

      const results = await Promise.allSettled([
        analyticsService.getSeriesOverview(yearParam, eventParam),
        analyticsService.getGlobalTopEvents(yearParam, eventParam),
        analyticsService.getUserAnalytics(yearParam, eventParam),
        analyticsService.getTaskAnalytics(yearParam, eventParam),
        analyticsService.getCostAnalytics(yearParam, eventParam),
        analyticsService.getParticipantAnalytics(yearParam, eventParam),
        analyticsService.getEventAnalytics(yearParam, eventParam)
      ]);

      const [
        seriesData, topEventsData, userData, taskData, costData, participantData, eventData
      ] = results;

      // Update state with results
      if (seriesData.status === 'fulfilled') setSeriesOverview(seriesData.value);
      if (topEventsData.status === 'fulfilled') setTopEvents(topEventsData.value);
      if (userData.status === 'fulfilled') setUserAnalytics(userData.value);
      if (taskData.status === 'fulfilled') setTaskAnalytics(taskData.value);
      if (costData.status === 'fulfilled') setCostAnalytics(costData.value);
      if (participantData.status === 'fulfilled') setParticipantAnalytics(participantData.value);
      if (eventData.status === 'fulfilled') setEventAnalytics(eventData.value);

      // Handle errors
      const errors = results.filter(result => result.status === 'rejected');
      if (errors.length > 0) {
        console.error('Failed to load some data:', errors);
        setError(prev => `${prev ? prev + ' ' : ''}${errors.length} data sources failed to load.`);
      }

    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      await fetchInitialData();
      await fetchAnalyticsData();
    };
    loadData();
  }, []);

  // Refresh when filters change
  useEffect(() => {
    if (!isLoading) {
      fetchAnalyticsData();
    }
  }, [selectedYear, selectedEvent]);

  // Check if we have any data
  const hasData = () => {
    return (userAnalytics?.totalUsers || 0) > 0 || 
           (eventAnalytics?.totalEvents || 0) > 0 || 
           (taskAnalytics?.totalTasks || 0) > 0 ||
           seriesOverview.length > 0;
  };

  // Filter series based on search term
  const filteredSeries = seriesOverview.filter(series =>
    series.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter top events based on search term
  const filteredTopEvents = topEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.series || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 space-y-8 bg-muted/10">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <MetricSkeleton key={i} />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }


  const tasksStatusData = taskAnalytics.tasksByStatus.map(item => ({
  status: item.status,
  count: Number(item.count),
}));



  const userRolesData = userAnalytics?.usersByRole.map(item => ({
  role: item.role,
  count: Number(item.count),
}));
 console.log(taskAnalytics);
  return (
    <div className="min-h-screen p-6 space-y-8 bg-muted/10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3Icon className="h-8 w-8" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your event performance and metrics
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full sm:w-40">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-full sm:w-48">
              <TicketIcon className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map(event => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title} ({event.year})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={fetchAnalyticsData} 
            variant="outline" 
            className="w-full sm:w-auto"
            disabled={isRefreshing}
          >
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* No data message */}
      {!hasData() && !isLoading && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>
            {selectedYear === "all" && selectedEvent === "all" 
              ? "No analytics data available. Please check if you have events and users in the system."
              : `No data available for ${selectedYear !== "all" ? `year ${selectedYear}` : ""}${selectedYear !== "all" && selectedEvent !== "all" ? " and " : ""}${selectedEvent !== "all" ? "the selected event" : ""}. Try selecting a different year or event.`
            }
          </AlertDescription>
        </Alert>
      )}

      {hasData() && (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-800">{userAnalytics?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TicketIcon className="h-4 w-4" />
                  Total Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800">{eventAnalytics?.totalEvents || 0}</div>
                <p className="text-xs text-muted-foreground">Events created</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4" />
                  Total Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-800">{taskAnalytics?.totalTasks || 0}</div>
                <p className="text-xs text-muted-foreground">Tasks assigned</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSignIcon className="h-4 w-4" />
                  Total Costs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-800">{formatCurrency(costAnalytics?.totalCosts || 0)}</div>
                <p className="text-xs text-muted-foreground">Total expenditure</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:w-auto bg-muted/50">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3Icon className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <TicketIcon className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="series" className="flex items-center gap-2">
                <TrendingUpIcon className="h-4 w-4" />
                Series
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="costs" className="flex items-center gap-2">
                <DollarSignIcon className="h-4 w-4" />
                Costs
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Users by Role */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Users by Role
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userAnalytics?.usersByRole?.length ? (
                   <ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={userRolesData}
      dataKey="count"
      nameKey="role"
      cx="50%"
      cy="50%"
      outerRadius={100}
      label={({ payload }) => `${payload.role}: ${payload.count}`}
    >
      {userRolesData.map((_, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
</ResponsiveContainer>
                    ) : (
                      <div className="h-300 flex items-center justify-center text-muted-foreground">
                        No user role data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Events by Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3Icon className="h-5 w-5" />
                      Events by Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {eventAnalytics?.eventsByStatus?.length ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={eventAnalytics.eventsByStatus}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="status" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="count" 
                            fill="#8884d8" 
                            radius={[4, 4, 0, 0]}
                            fillOpacity={0.8}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-300 flex items-center justify-center text-muted-foreground">
                        No event status data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Additional Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tasks by Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Tasks by Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {taskAnalytics?.tasksByStatus?.length ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                       <Pie
  data={tasksStatusData}
  dataKey="count"
  nameKey="status"
  cx="50%"
  cy="50%"
  outerRadius={100}
  label={({ payload }) => `${payload.status}: ${payload.count}`}
>
  {tasksStatusData.map((_, index) => (
    <Cell
      key={`cell-${index}`}
      fill={
        STATUS_COLORS[tasksStatusData[index].status as keyof typeof STATUS_COLORS] ||
        COLORS[index % COLORS.length]
      }
    />
  ))}
</Pie>

                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-300 flex items-center justify-center text-muted-foreground">
                        No task status data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Costs by Category */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSignIcon className="h-5 w-5" />
                      Costs by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {costAnalytics?.costsByLabel?.length ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={costAnalytics.costsByLabel}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="label" />
                          <YAxis />
                          <Tooltip 
                            content={<CustomTooltip />} 
                            formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
                          />
                          <Bar 
                            dataKey="total" 
                            fill="#00C49F" 
                            radius={[4, 4, 0, 0]}
                            fillOpacity={0.8}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-300 flex items-center justify-center text-muted-foreground">
                        No cost data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Top Participants */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UsersIcon className="h-5 w-5" />
                      Top Participants
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {userAnalytics?.topParticipants?.length ? (
                      userAnalytics.topParticipants.slice(0, 5).map((p, index) => (
                        <div key={p.userId} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium">{p.userName}</span>
                          </div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {p.participationCount} events
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm text-center py-4">No participation data</p>
                    )}
                  </CardContent>
                </Card>

                {/* Top Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TicketIcon className="h-5 w-5" />
                      Top Rated Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topEvents.slice(0, 5).map((event, index) => (
                      <div key={event.eventId} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium line-clamp-1">{event.title}</span>
                        </div>
                        <Badge variant={event.score > 90 ? "default" : event.score > 70 ? "secondary" : "outline"}>
                          {event.score}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUpIcon className="h-5 w-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg. Task Completion</span>
                      <Badge variant="outline">
                        {taskAnalytics?.averageCompletionTime ? `${taskAnalytics.averageCompletionTime}h` : 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg. Participants</span>
                      <Badge variant="outline">
                        {eventAnalytics?.averageParticipants || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg. Budget</span>
                      <Badge variant="outline">
                        {formatCurrency(eventAnalytics?.averageBudget || 0)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Unique Participants</span>
                      <Badge variant="outline">
                        {participantAnalytics?.totalUniqueParticipants || 0}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Analytics</CardTitle>
                  <CardDescription>Detailed event performance metrics and statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Event Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{eventAnalytics?.totalEvents || 0}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Avg Participants</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{eventAnalytics?.averageParticipants || 0}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Avg Budget</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(eventAnalytics?.averageBudget || 0)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Avg Fill Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{eventAnalytics?.averageFillRate || 0}%</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Events by Category */}
                  {eventAnalytics?.eventsByCategory?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Events by Category</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie 
                              data={eventAnalytics.eventsByCategory} 
                              dataKey="count" 
                              nameKey="category" 
                              cx="50%" 
                              cy="50%" 
                              outerRadius={100}
                              label={({ category, count }) => `${category}: ${count}`}
                            >
                              {eventAnalytics.eventsByCategory.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Top Events Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Rated Events</CardTitle>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Search events..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="max-w-sm"
                        />
                        <FilterIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead>Series</TableHead>
                            <TableHead className="text-right">Participants</TableHead>
                            <TableHead className="text-right">Budget</TableHead>
                            <TableHead className="text-right">Utilization</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTopEvents.map((event) => (
                            <TableRow key={event.eventId}>
                              <TableCell className="font-medium">{event.title}</TableCell>
                              <TableCell>{event.series || "-"}</TableCell>
                              <TableCell className="text-right">{event.participantsCount}</TableCell>
                              <TableCell className="text-right">{formatCurrency(event.budget)}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant={event.budgetUtilization > 90 ? "destructive" : event.budgetUtilization > 70 ? "secondary" : "outline"}>
                                  {event.budgetUtilization}%
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant={event.score > 90 ? "default" : event.score > 70 ? "secondary" : "outline"}>
                                  {event.score}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Series Tab */}
            <TabsContent value="series" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Series Overview</CardTitle>
                  <CardDescription>Performance metrics across all event series</CardDescription>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search series..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Series Name</TableHead>
                        <TableHead className="text-right">Events</TableHead>
                        <TableHead className="text-right">Participants</TableHead>
                        <TableHead className="text-right">Total Budget</TableHead>
                        <TableHead className="text-right">Budget Utilization</TableHead>
                        <TableHead className="text-right">Task Completion</TableHead>
                        <TableHead className="text-right">YoY Growth</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSeries.map((series) => (
                        <TableRow key={series.seriesId}>
                          <TableCell className="font-medium">{series.name}</TableCell>
                          <TableCell className="text-right">{series.totalEvents}</TableCell>
                          <TableCell className="text-right">{series.totalParticipants}</TableCell>
                          <TableCell className="text-right">{formatCurrency(series.totalBudget)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={series.budgetUtilization > 90 ? "destructive" : series.budgetUtilization > 70 ? "secondary" : "outline"}>
                              {series.budgetUtilization}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={series.taskCompletionRate > 90 ? "default" : series.taskCompletionRate > 70 ? "secondary" : "outline"}>
                              {series.taskCompletionRate}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={series.averageYoYGrowth > 0 ? "default" : "destructive"}>
                              {series.averageYoYGrowth > 0 ? '+' : ''}{series.averageYoYGrowth}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => setSelectedSeriesId(series.seriesId)}
                              variant="outline"
                              size="sm"
                            >
                              View Trend
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Series Trend */}
              {selectedSeriesId && seriesTrend && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Trend Analysis: {seriesOverview.find(s => s.seriesId === selectedSeriesId)?.name}
                    </CardTitle>
                    <CardDescription>
                      Historical performance and metrics over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={seriesTrend.trend}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="year" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="participantsCount" 
                          name="Participants" 
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                        <Area 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="budget" 
                          name="Budget" 
                          stroke="#16a34a" 
                          fill="#16a34a" 
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="taskCompletion" 
                          name="Task Completion %" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Top Participants</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Participant</TableHead>
                                <TableHead className="text-right">Events</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {seriesTrend.topParticipants.map((p) => (
                                <TableRow key={p.userId}>
                                  <TableCell className="font-medium">{p.userName}</TableCell>
                                  <TableCell className="text-right">{p.eventsParticipated}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Engagement Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Repeat Participants</span>
                            <Badge variant="default">{seriesTrend.repeatParticipantCount}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Total Events in Series</span>
                            <Badge variant="outline">{seriesTrend.trend.length}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Average Participation</span>
                            <Badge variant="outline">
                              {Math.round(seriesTrend.trend.reduce((sum, item) => sum + item.participantsCount, 0) / seriesTrend.trend.length)}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Task Analytics</CardTitle>
                  <CardDescription>Task management and completion metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Task Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{taskAnalytics?.totalTasks || 0}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{taskAnalytics?.overdueTasks || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          {taskAnalytics?.totalTasks ? 
                            `${Math.round((taskAnalytics.overdueTasks / taskAnalytics.totalTasks) * 100)}% of total` : 
                            '0% of total'
                          }
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{taskAnalytics?.averageCompletionTime || 0}h</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tasks by Status Chart */}
                  {taskAnalytics?.tasksByStatus?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Tasks by Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={taskAnalytics.tasksByStatus}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="status" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar 
                              dataKey="count" 
                              fill="#82ca9d" 
                              radius={[4, 4, 0, 0]}
                              fillOpacity={0.8}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Top Performers */}
                  {taskAnalytics?.topUsersByCompletedTasks?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Task Performers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead className="text-right">Completed Tasks</TableHead>
                              <TableHead className="text-right">Completion Rate</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {taskAnalytics.topUsersByCompletedTasks.map((user) => (
                              <TableRow key={user.userId}>
                                <TableCell className="font-medium">{user.userName}</TableCell>
                                <TableCell className="text-right">{user.completedCount}</TableCell>
                                <TableCell className="text-right">
                                  <Badge variant={user.completedCount > 50 ? "default" : "secondary"}>
                                    {Math.round((user.completedCount / (taskAnalytics.totalTasks || 1)) * 100)}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Costs Tab */}
            <TabsContent value="costs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cost Analytics</CardTitle>
                  <CardDescription>Financial metrics and expenditure analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Cost Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(costAnalytics?.totalCosts || 0)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Avg Cost per Event</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(costAnalytics?.averageCostPerEvent || 0)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {eventAnalytics?.averageBudget && costAnalytics?.averageCostPerEvent ? 
                            `${Math.round((costAnalytics.averageCostPerEvent / eventAnalytics.averageBudget) * 100)}%` : 
                            '0%'
                          }
                        </div>
                        <p className="text-xs text-muted-foreground">Of average event budget</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Cost Distribution */}
                  {costAnalytics?.costsByLabel?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Cost Distribution by Category</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                          <PieChart>
                            <Pie 
                              data={costAnalytics.costsByLabel} 
                              dataKey="total" 
                              nameKey="label" 
                              cx="50%" 
                              cy="50%" 
                              outerRadius={120}
                              label={({ label, total }) => `${label}: ${formatCurrency(total)}`}
                            >
                              {costAnalytics.costsByLabel.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              content={<CustomTooltip />} 
                              formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Cost Breakdown Table */}
                  {costAnalytics?.costsByLabel?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Cost Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Category</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                              <TableHead className="text-right">Percentage</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {costAnalytics.costsByLabel.map((cost) => (
                              <TableRow key={cost.label}>
                                <TableCell className="font-medium">{cost.label}</TableCell>
                                <TableCell className="text-right">{formatCurrency(cost.total)}</TableCell>
                                <TableCell className="text-right">
                                  {((cost.total / (costAnalytics.totalCosts || 1)) * 100).toFixed(1)}%
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}