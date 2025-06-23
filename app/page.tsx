"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Settings, Moon, Sun, Sunset } from "lucide-react"
import { SettingsPage } from "@/components/settings-page"

interface PrayerTime {
  name: string
  time: string
  icon: React.ReactNode
  passed: boolean
}

interface LocationData {
  zipcode: string
  city: string
  country: string
}

interface PrayerTimesData {
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
  date: {
    readable: string
    hijri: string
  }
}

export default function PrayerTimesApp() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showSettings, setShowSettings] = useState(false)
  const [location, setLocation] = useState<LocationData>({ zipcode: "10001", city: "New York", country: "US" })
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null)
  const [loading, setLoading] = useState(false)
  const [nextPrayer, setNextPrayer] = useState({ name: "Asr", timeLeft: "1 hr, 25 min" })

  // Load saved settings on component mount
  useEffect(() => {
    const savedLocation = localStorage.getItem("prayerApp_location")
    const savedPrayerData = localStorage.getItem("prayerApp_prayerData")

    if (savedLocation) {
      setLocation(JSON.parse(savedLocation))
    }
    if (savedPrayerData) {
      setPrayerData(JSON.parse(savedPrayerData))
    }
  }, [])

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Calculate next prayer and time remaining
  useEffect(() => {
    if (prayerData) {
      calculateNextPrayer()
    }
  }, [prayerData, currentTime])

  const calculateNextPrayer = () => {
    if (!prayerData) return

    const now = new Date()
    const today = now.toDateString()

    const prayers = [
      { name: "Fajr", time: prayerData.fajr },
      { name: "Dhuhr", time: prayerData.dhuhr },
      { name: "Asr", time: prayerData.asr },
      { name: "Maghrib", time: prayerData.maghrib },
      { name: "Isha", time: prayerData.isha },
    ]

    for (const prayer of prayers) {
      const prayerTime = new Date(`${today} ${prayer.time}`)
      if (prayerTime > now) {
        const timeDiff = prayerTime.getTime() - now.getTime()
        const hours = Math.floor(timeDiff / (1000 * 60 * 60))
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

        let timeLeft = ""
        if (hours > 0) {
          timeLeft = `${hours} hr, ${minutes} min`
        } else {
          timeLeft = `${minutes} min`
        }

        setNextPrayer({ name: prayer.name, timeLeft })
        return
      }
    }

    // If no prayer found for today, next is Fajr tomorrow
    setNextPrayer({ name: "Fajr", timeLeft: "tomorrow" })
  }

  const getPrayerTimes = (): PrayerTime[] => {
    if (!prayerData) {
      // Default times if no data loaded
      return [
        { name: "Fajr", time: "5:32 AM", icon: <Moon className="w-5 h-5 text-blue-400" />, passed: true },
        { name: "Sunrise", time: "7:03 AM", icon: <Sun className="w-5 h-5 text-orange-400" />, passed: true },
        { name: "Dhuhr", time: "12:48 PM", icon: <Sun className="w-5 h-5 text-yellow-400" />, passed: true },
        { name: "Asr", time: "3:50 PM", icon: <Sun className="w-5 h-5 text-orange-500" />, passed: false },
        { name: "Maghrib", time: "6:25 PM", icon: <Sunset className="w-5 h-5 text-orange-600" />, passed: false },
        { name: "Isha", time: "7:42 PM", icon: <Moon className="w-5 h-5 text-indigo-400" />, passed: false },
      ]
    }

    const now = new Date()
    const today = now.toDateString()

    const checkIfPassed = (timeStr: string) => {
      const prayerTime = new Date(`${today} ${timeStr}`)
      return prayerTime < now
    }

    return [
      {
        name: "Fajr",
        time: prayerData.fajr,
        icon: <Moon className="w-5 h-5 text-blue-400" />,
        passed: checkIfPassed(prayerData.fajr),
      },
      {
        name: "Sunrise",
        time: prayerData.sunrise,
        icon: <Sun className="w-5 h-5 text-orange-400" />,
        passed: checkIfPassed(prayerData.sunrise),
      },
      {
        name: "Dhuhr",
        time: prayerData.dhuhr,
        icon: <Sun className="w-5 h-5 text-yellow-400" />,
        passed: checkIfPassed(prayerData.dhuhr),
      },
      {
        name: "Asr",
        time: prayerData.asr,
        icon: <Sun className="w-5 h-5 text-orange-500" />,
        passed: checkIfPassed(prayerData.asr),
      },
      {
        name: "Maghrib",
        time: prayerData.maghrib,
        icon: <Sunset className="w-5 h-5 text-orange-600" />,
        passed: checkIfPassed(prayerData.maghrib),
      },
      {
        name: "Isha",
        time: prayerData.isha,
        icon: <Moon className="w-5 h-5 text-indigo-400" />,
        passed: checkIfPassed(prayerData.isha),
      },
    ]
  }

  const handleLocationUpdate = (newLocation: LocationData, newPrayerData: PrayerTimesData) => {
    setLocation(newLocation)
    setPrayerData(newPrayerData)
    setShowSettings(false)
  }

  if (showSettings) {
    return (
      <SettingsPage
        currentLocation={location}
        onLocationUpdate={handleLocationUpdate}
        onBack={() => setShowSettings(false)}
      />
    )
  }

  const prayerTimes = getPrayerTimes()
  const currentPrayer = prayerTimes.find((p) => !p.passed) || prayerTimes[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="pt-12 pb-6 text-center relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-12 right-6 text-gray-400 hover:text-white"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-medium text-gray-300 mb-2">{location.city}</h1>
          <h2 className="text-2xl font-semibold mb-1">Time for {currentPrayer.name}</h2>
          <p className="text-gray-400 text-sm">
            {nextPrayer.name} is in {nextPrayer.timeLeft}
          </p>
        </div>

        {/* Date */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center">
            <div className="h-px bg-gray-600 flex-1"></div>
            <span className="px-4 text-sm text-gray-400">{prayerData?.date.hijri || "Thursday, Safar 2, 1440"}</span>
            <div className="h-px bg-gray-600 flex-1"></div>
          </div>
        </div>

        {/* Prayer Times */}
        <div className="px-6 space-y-4 pb-8">
          {prayerTimes.map((prayer, index) => (
            <div
              key={prayer.name}
              className={`flex items-center justify-between py-3 ${
                prayer.name === currentPrayer.name ? "bg-slate-700/50 rounded-lg px-4" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                {prayer.icon}
                <span className={`text-lg ${prayer.passed ? "text-gray-500" : "text-white"}`}>{prayer.name}</span>
              </div>
              <span className={`text-lg font-medium ${prayer.passed ? "text-gray-500" : "text-white"}`}>
                {prayer.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
