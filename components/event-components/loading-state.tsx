import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useLanguage } from "@/lib/i18n"

export function LoadingState() {
  const { t } = useLanguage()
  
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">{t("common.loadingEventDetails")}</p>
      </div>
    </div>
  )
}