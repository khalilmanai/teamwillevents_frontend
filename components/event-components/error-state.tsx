import { Calendar } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

export function ErrorState() {
  const { t } = useLanguage()
  
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <Calendar className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-destructive">{t("errors.eventNotFound")}</h2>
        <p className="text-muted-foreground">{t("events.noEvents")}</p>
      </div>
    </div>
  )
}