import type React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface PrayerCardProps {
  name: string
  time: string
  icon: React.ReactNode
  isNext?: boolean
  isPassed?: boolean
}

export function PrayerCard({ name, time, icon, isNext = false, isPassed = false }: PrayerCardProps) {
  return (
    <Card
      className={`
      border-none shadow-none
      ${isNext ? "bg-slate-700/50" : "bg-transparent"}
      ${isPassed ? "opacity-60" : ""}
    `}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          {icon}
          <span className={`text-lg ${isPassed ? "text-gray-500" : "text-white"}`}>{name}</span>
        </div>
        <span className={`text-lg font-medium ${isPassed ? "text-gray-500" : "text-white"}`}>{time}</span>
      </CardContent>
    </Card>
  )
}
