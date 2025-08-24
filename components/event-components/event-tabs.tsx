"use client"

import { Settings, Users, MessageSquare, BarChart3, ListTodo, MessageCircle } from "lucide-react"
import { Card } from "../ui/card"
import { useLanguage } from "@/lib/i18n"

 import { Calculator } from "lucide-react";
interface EventTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function EventTabs({ activeTab, setActiveTab }: EventTabsProps) {
  const { t } = useLanguage()


const tabs = [
  { id: "overview", label: t("navigation.overview"), icon: Settings },
  { id: "participants", label: t("navigation.participants"), icon: Users },
  { id: "feedback", label: t("navigation.feedback"), icon: MessageSquare },
  { id: "statistics", label: t("navigation.statistics"), icon: BarChart3 },
  { id: "tasks", label: t("navigation.tasks"), icon: ListTodo },
  { id: "costs", label: "Costs", icon: Calculator },
  { id: "chat", label: "Chat", icon: MessageCircle },
];


  return (
    <Card className="px-4 md:px-6 py-3 border-0 shadow-xl bg-white/90 backdrop-blur-md rounded-xl">
      <nav
        className="flex flex-col md:flex-row gap-2 md:gap-3"
        aria-label="Event navigation"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2
                ${
                  isActive
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg border border-green-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </Card>
  )
}
