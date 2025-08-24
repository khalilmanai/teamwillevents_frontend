import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { SeriesOverview } from "@/lib/analytics-service"

interface UtilizationChartProps {
  data: SeriesOverview[]
  isLoading?: boolean
}

export function UtilizationChart({ data, isLoading }: UtilizationChartProps) {
  if (isLoading) {
    return (
      <Card className="shadow-lg rounded-2xl border border-gray-200">
        <CardHeader>
          <CardTitle>Series Utilization & Participation</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Series Utilization & Participation</CardTitle>
        <p className="text-sm text-muted-foreground">
          Track utilization rates and participant counts across event series
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="seriesName" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
            <YAxis
              yAxisId="utilization"
              orientation="left"
              tick={{ fontSize: 12 }}
              label={{ value: "Utilization (%)", angle: -90, position: "insideLeft" }}
            />
            <YAxis
              yAxisId="participants"
              orientation="right"
              tick={{ fontSize: 12 }}
              label={{ value: "Participants", angle: 90, position: "insideRight" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Legend />
            <Line
              yAxisId="utilization"
              type="monotone"
              dataKey="utilization"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              name="Utilization (%)"
            />
            <Line
              yAxisId="participants"
              type="monotone"
              dataKey="participants"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              name="Participants"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
