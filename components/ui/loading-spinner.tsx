import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  color?: string
  label?: string
  overlay?: boolean
}

export function LoadingSpinner({
  size = "md",
  className = "",
  color = "text-primary",
  label = "Loading...",
  overlay = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  const spinner = (
    <div className={`flex items-center justify-center ${overlay ? "fixed inset-0 bg-black/20 z-50" : ""}`}>
      <Loader2
        className={`animate-spin ${sizeClasses[size]} ${color} ${className}`}
        role="status"
        aria-label={label}
      />
    </div>
  )

  return spinner
}
