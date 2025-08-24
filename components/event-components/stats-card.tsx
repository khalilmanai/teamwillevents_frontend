import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  color?: "green" | "green" | "green" | "orange"
}

export function StatsCard({ 
  icon: Icon, 
  label, 
  value, 
  color = "green" 
}: StatsCardProps) {
  const colorClasses = {
    green: "from-green-500/10 to-green-600/5 border-green-200 text-green-700",
    green: "from-green-500/10 to-green-600/5 border-green-200 text-green-700", 
    green: "from-emerald-500/10 to-emerald-600/5 border-emerald-200 text-emerald-700",
    orange: "from-orange-500/10 to-orange-600/5 border-orange-200 text-orange-700"
  }

  const iconColorClasses = {
    green: "bg-green-500/10 text-green-600",
    green: "bg-green-500/10 text-green-600",
    green: "bg-emerald-500/10 text-emerald-600", 
    orange: "bg-orange-500/10 text-orange-600"
  }

  return (
    <Card className={`border-2 bg-gradient-to-br ${colorClasses[color]} shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              {label}
            </p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}