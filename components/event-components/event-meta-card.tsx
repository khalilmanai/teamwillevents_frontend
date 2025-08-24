

interface EventMetaCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
  color: "green" | "green" | "green"
}

export function EventMetaCard({ icon: Icon, label, value, color }: EventMetaCardProps) {
  const colorClasses = {
    green: "bg-green-500/10 text-green-600",
    green: "bg-green-500/10 text-green-600",
    green: "bg-green-500/10 text-green-600"
  }

  return (
    <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <div className="font-semibold text-foreground">{value}</div>
      </div>
    </div>
  )
}