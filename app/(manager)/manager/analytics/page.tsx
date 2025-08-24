"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
  analyticsService,
  type AnalyticsOverview,
  type CategoryDistribution,
  type TopEvent,
  type StatusBreakdown,
  type LocationDistribution,
  type OrganizerPerformance,

} from "@/lib/analytics-service"
import { EventSeries } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  MapPin,
  Target,
  Download,
  Filter,
  BarChart3,
  PieChartIcon,
  Activity,
  AlertCircle,
} from "lucide-react"
import { apiService } from "@/lib/api"

const chartConfig = {
  primary: {
    label: "Primary",
    color: "hsl(var(--chart-1))",
  },
  secondary: {
    label: "Secondary",
    color: "hsl(var(--chart-2))",
  },
  tertiary: {
    label: "Tertiary",
    color: "hsl(var(--chart-3))",
  },
  quaternary: {
    label: "Quaternary",
    color: "hsl(var(--chart-4))",
  },
  quinary: {
    label: "Quinary",
    color: "hsl(var(--chart-5))",
  },
}

const getChartColor = (index: number) => {
  const colors = Object.values(chartConfig)
  const colorConfig = colors[index % colors.length]
  return colorConfig?.color || "hsl(var(--chart-1))"
}

export default function AnalyticsDashboard() {
  const currentYear = new Date().getFullYear()

  // Filters
  const [year, setYear] = useState(currentYear)
  const [seriesName, setSeriesName] = useState<string>("All series") // Removed undefined type and set default
  const [activeTab, setActiveTab] = useState("overview")

  // Data states
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [categories, setCategories] = useState<CategoryDistribution[]>([])
  const [topEvents, setTopEvents] = useState<TopEvent[]>([])
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown[]>([])
  const [locations, setLocations] = useState<LocationDistribution[]>([])
  const [organizers, setOrganizers] = useState<OrganizerPerformance[]>([])
  const [participationTrends, setParticipationTrends] = useState<any[]>([])
  const [utilizationMetrics, setUtilizationMetrics] = useState<any[]>([])
  const [leadTimes, setLeadTimes] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [eventSeries, setEventSeries] = useState<EventSeries[]>([]) // Added eventSeries state

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEventSeries = async () => {
      try {
        const seriesData = await apiService.getEventSeries()
        setEventSeries(seriesData)
      } catch (err) {
        console.error("Failed to fetch event series:", err)
      }
    }
    fetchEventSeries()
  }, [])
  useEffect(() => {
  console.group('📊 Analytics Dashboard State');

  console.log('Overview:', overview);
  console.table(categories);
  console.table(topEvents);
  console.table(statusBreakdown);
  console.table(locations);
  console.table(organizers);
  console.table(participationTrends);
  console.table(utilizationMetrics);
  console.table(leadTimes);
  console.table(budgets);
  console.table(eventSeries);

  console.groupEnd();
}, [
  overview,
  categories,
  topEvents,
  statusBreakdown,
  locations,
  organizers,
  participationTrends,
  utilizationMetrics,
  leadTimes,
  budgets,
  eventSeries,
]);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [
          overviewData,
          categoriesData,
          topEventsData,
          statusData,
          locationsData,
          organizersData,
          trendsData,
          utilizationData,
          leadTimeData,
          budgetData,
        ] = await Promise.all([
          analyticsService.getOverview(year),
          analyticsService.getCategoryDistribution(year),
          analyticsService.getTopEvents(year),
          analyticsService.getStatusBreakdown(year),
          analyticsService.getLocationDistribution(year),
          analyticsService.getOrganizerPerformance(year),
          analyticsService.getParticipationTrends(year, seriesName !== "All series" ? seriesName : undefined), // Fixed to pass year first
          analyticsService.getUtilizationMetrics(year),
          analyticsService.getLeadTimeStats(year),
          analyticsService.getBudgetStats(year),
        ])

        setOverview(overviewData)
        setCategories(categoriesData)
        setTopEvents(topEventsData)
        setStatusBreakdown(statusData)
        setLocations(locationsData)
        setOrganizers(organizersData)
        setParticipationTrends(trendsData as any[])
        setUtilizationMetrics(utilizationData as any[])
        setLeadTimes(leadTimeData)
        setBudgets(budgetData)
      } catch (err) {
        console.error("Failed to fetch analytics data:", err)
        setError("Failed to load analytics data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [year, seriesName]) // Changed dependency from seriesId to seriesName

  const generateReport = () => {
    const reportData = {
      overview,
      categories,
      topEvents,
      statusBreakdown,
      locations,
      organizers,
      participationTrends,
      utilizationMetrics,
      leadTimes,
      budgets,
      filters: { year, seriesName }, // Changed from seriesId to seriesName
      generatedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-report-${year}${seriesName ? `-${seriesName.replace(/\s+/g, "-")}` : ""}.json` // Updated filename generation
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive mb-4">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">Error Loading Dashboard</span>
            </div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Comprehensive insights and performance metrics for {year}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={generateReport} className="gap-2 shadow-sm">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Card className="mb-8 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Filter className="h-5 w-5 text-primary" />
              Filters & Controls
            </CardTitle>
            <CardDescription>Customize your analytics view with these filters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="space-y-2">
                <Label htmlFor="year-select" className="text-sm font-medium">
                  Year
                </Label>
                <Select value={year.toString()} onValueChange={(value) => setYear(Number(value))}>
                  <SelectTrigger id="year-select" className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2021, 2022, 2023, 2024, 2025].map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="series-select" className="text-sm font-medium">
                  Event Series (Optional)
                </Label>
                <Select value={seriesName} onValueChange={(value) => setSeriesName(value || "All series")}>
                  <SelectTrigger id="series-select" className="w-full sm:w-48">
                    <SelectValue placeholder="All series" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All series">All series</SelectItem>
                    {eventSeries?.map((series) => (
                      <SelectItem key={series.id} value={series.name || ""}>
                        {series.name || "Unknown Series"} ({series.eventsCount || 0} events)
                      </SelectItem>
                    )) || []}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1">
            <TabsTrigger value="overview" className="gap-2 py-2.5">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2 py-2.5">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="distribution" className="gap-2 py-2.5">
              <PieChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Distribution</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-2 py-2.5">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trends</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {overview && (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  title="Total Series"
                  value={overview?.totalSeries || 0} // Added null check
                  icon={<Calendar className="h-5 w-5" />}
                  trend={12}
                />
                <MetricCard
                  title="Total Participants"
                  value={overview?.totalParticipants?.toLocaleString() || "0"} // Added null checks
                  icon={<Users className="h-5 w-5" />}
                  trend={8}
                />
                <MetricCard
                  title="Average Utilization"
                  value={`${overview?.averageUtilization || 0}%`} // Added null check
                  icon={<Target className="h-5 w-5" />}
                  trend={-3}
                />
                <MetricCard
                  title="Active Locations"
                  value={locations?.length || 0} // Added null check
                  icon={<MapPin className="h-5 w-5" />}
                  trend={5}
                />
              </div>
            )}

            {statusBreakdown.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Event Status Distribution</CardTitle>
                  <CardDescription>Current status breakdown across all events</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px] sm:h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusBreakdown}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={40}
                          paddingAngle={2}
                        >
                          {statusBreakdown.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`} // Added proper key
                              fill={getChartColor(index)} // Used safe color getter
                            />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {topEvents.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-foreground">Top Performing Events</CardTitle>
                    <CardDescription>Events with highest participation and fill rates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={topEvents} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="eventName" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Bar
                            yAxisId="left"
                            dataKey="participants"
                            fill={chartConfig.primary.color}
                            name="Participants"
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="fillRate"
                            stroke={chartConfig.secondary.color}
                            name="Fill Rate %"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}

              {organizers.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-foreground">Organizer Performance</CardTitle>
                    <CardDescription>Event count and average participation by organizer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={organizers} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="organizerName" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Bar dataKey="totalEvents" fill={chartConfig.tertiary.color} name="Total Events" />
                          <Bar
                            dataKey="averageParticipants"
                            fill={chartConfig.quaternary.color}
                            name="Avg Participants"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {utilizationMetrics.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Utilization Metrics Overview</CardTitle>
                  <CardDescription>Comprehensive view of capacity utilization across series</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={utilizationMetrics.slice(0, 6)}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="seriesName" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Average Utilization"
                          dataKey="averageUtilization"
                          stroke={chartConfig.primary.color}
                          fill={chartConfig.primary.color}
                          fillOpacity={0.3}
                        />
                        <Radar
                          name="Peak Utilization"
                          dataKey="peakUtilization"
                          stroke={chartConfig.secondary.color}
                          fill={chartConfig.secondary.color}
                          fillOpacity={0.3}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {categories.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-foreground">Category Distribution</CardTitle>
                    <CardDescription>Event categories by participation volume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categories}
                            dataKey="count"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            innerRadius={60}
                            paddingAngle={5}
                            label={({ category, percent }) =>
                              `${category || "Unknown"} ${((percent || 0) * 100).toFixed(0)}%`
                            } // Added null checks
                          >
                            {categories.map((entry, index) => (
                              <Cell
                                key={`category-${index}`} // Added proper key
                                fill={getChartColor(index)} // Used safe color getter
                              />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}

              {locations.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-foreground">Location Distribution</CardTitle>
                    <CardDescription>Event distribution across different locations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={locations}
                          layout="horizontal"
                          margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="location" type="category" width={80} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill={chartConfig.primary.color} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            {participationTrends.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Participation Trends Over Time</CardTitle>
                  <CardDescription>Historical view of participant engagement and event frequency</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={participationTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Area
                          type="monotone"
                          dataKey="participants"
                          stackId="1"
                          stroke={chartConfig.primary.color}
                          fill={chartConfig.primary.color}
                          fillOpacity={0.6}
                          name="Participants"
                        />
                        <Area
                          type="monotone"
                          dataKey="events"
                          stackId="2"
                          stroke={chartConfig.secondary.color}
                          fill={chartConfig.secondary.color}
                          fillOpacity={0.6}
                          name="Events"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              {leadTimes.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-foreground">Lead Time Analysis</CardTitle>
                    <CardDescription>Event planning lead times in days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={leadTimes} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="eventId" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="leadTimeDays"
                            stroke={chartConfig.tertiary.color}
                            strokeWidth={3}
                            dot={{ fill: chartConfig.tertiary.color, strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}

              {budgets.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-foreground">Budget Analysis</CardTitle>
                    <CardDescription>Event budget distribution and trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={budgets} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="eventId" />
                          <YAxis />
                          <ChartTooltip
                            content={<ChartTooltipContent />}
                            formatter={(value) => [`$${Number(value).toLocaleString()}`, "Budget"]}
                          />
                          <Bar dataKey="budget" fill={chartConfig.quaternary.color} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: number
}) {
  const formatValue = (val: string | number) => {
    if (typeof val === "number") {
      return isNaN(val) ? "0" : val.toLocaleString()
    }
    return val || "0"
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="text-primary">{icon}</div>
            <span className="text-sm font-medium">{title}</span>
          </div>
          {trend !== undefined &&
            !isNaN(trend) && ( // Added NaN check
              <Badge
                variant={trend > 0 ? "default" : "secondary"}
                className={`gap-1 ${trend > 0 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}
              >
                {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(trend)}%
              </Badge>
            )}
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-foreground">
            {formatValue(value)} {/* Used safe formatting function */}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Card className="mb-8">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-48" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
