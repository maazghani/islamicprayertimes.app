"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MapPin, Loader2 } from "lucide-react"

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

interface SettingsPageProps {
  currentLocation: LocationData
  onLocationUpdate: (location: LocationData, prayerData: PrayerTimesData) => void
  onBack: () => void
}

export function SettingsPage({ currentLocation, onLocationUpdate, onBack }: SettingsPageProps) {
  const [zipcode, setZipcode] = useState(currentLocation.zipcode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchPrayerTimes = async (zip: string) => {
    setLoading(true)
    setError("")

    try {
      // Validate zipcode format
      if (!/^\d{5}$/.test(zip)) {
        throw new Error("Please enter a valid 5-digit ZIP code")
      }

      console.log("Fetching location data for ZIP:", zip)

      // First, get coordinates from zipcode
      let geoResponse
      try {
        geoResponse = await fetch(`https://api.zippopotam.us/us/${zip}`)
      } catch (fetchError) {
        console.error("Geocoding fetch error:", fetchError)
        throw new Error("Unable to connect to location service. Please check your internet connection.")
      }

      if (!geoResponse.ok) {
        if (geoResponse.status === 404) {
          throw new Error("ZIP code not found. Please enter a valid US ZIP code.")
        }
        throw new Error(`Location service error: ${geoResponse.status}`)
      }

      const geoData = await geoResponse.json()
      console.log("Location data:", geoData)

      const lat = Number.parseFloat(geoData.places[0].latitude)
      const lng = Number.parseFloat(geoData.places[0].longitude)
      const city = geoData.places[0]["place name"]
      const state = geoData.places[0]["state abbreviation"]
      const country = geoData.country_abbreviation

      console.log("Coordinates:", { lat, lng, city, state })

      // Get current date
      const today = new Date()
      const day = today.getDate().toString().padStart(2, "0")
      const month = (today.getMonth() + 1).toString().padStart(2, "0")
      const year = today.getFullYear()

      console.log("Fetching prayer times for date:", `${day}-${month}-${year}`)

      // Fetch prayer times from Aladhan API with better error handling
      let prayerResponse
      try {
        const apiUrl = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${lat}&longitude=${lng}&method=2&school=1`
        console.log("Prayer API URL:", apiUrl)

        prayerResponse = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        })
      } catch (fetchError) {
        console.error("Prayer times fetch error:", fetchError)
        throw new Error("Unable to connect to prayer times service. Please try again later.")
      }

      if (!prayerResponse.ok) {
        console.error("Prayer API response not ok:", prayerResponse.status, prayerResponse.statusText)
        throw new Error(`Prayer times service error: ${prayerResponse.status}`)
      }

      const prayerData = await prayerResponse.json()
      console.log("Prayer data received:", prayerData)

      if (!prayerData.data || !prayerData.data.timings) {
        throw new Error("Invalid response from prayer times service")
      }

      const timings = prayerData.data.timings
      const date = prayerData.data.date

      // Convert 24-hour format to 12-hour format
      const convertTo12Hour = (time24: string) => {
        try {
          // Remove any extra characters and get just HH:MM
          const cleanTime = time24.split(" ")[0] // Remove timezone info if present
          const [hours, minutes] = cleanTime.split(":")
          const hour = Number.parseInt(hours, 10)
          const ampm = hour >= 12 ? "PM" : "AM"
          const hour12 = hour % 12 || 12
          return `${hour12}:${minutes} ${ampm}`
        } catch (err) {
          console.error("Time conversion error for:", time24, err)
          return time24 // Return original if conversion fails
        }
      }

      const locationData: LocationData = {
        zipcode: zip,
        city: `${city}, ${state}`,
        country: country,
      }

      const prayerTimesData: PrayerTimesData = {
        fajr: convertTo12Hour(timings.Fajr),
        sunrise: convertTo12Hour(timings.Sunrise),
        dhuhr: convertTo12Hour(timings.Dhuhr),
        asr: convertTo12Hour(timings.Asr),
        maghrib: convertTo12Hour(timings.Maghrib),
        isha: convertTo12Hour(timings.Isha),
        date: {
          readable: date?.readable || today.toDateString(),
          hijri: date?.hijri
            ? `${date.hijri.weekday?.en || ""}, ${date.hijri.month?.en || ""} ${date.hijri.day}, ${date.hijri.year}`
            : "Islamic Date",
        },
      }

      console.log("Final prayer times data:", prayerTimesData)

      // Save to localStorage
      localStorage.setItem("prayerApp_location", JSON.stringify(locationData))
      localStorage.setItem("prayerApp_prayerData", JSON.stringify(prayerTimesData))

      onLocationUpdate(locationData, prayerTimesData)
    } catch (err) {
      console.error("Full error details:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (zipcode.trim()) {
      fetchPrayerTimes(zipcode.trim())
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center p-6">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-gray-400 hover:text-white mr-4">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>

        {/* Location Settings */}
        <div className="px-6">
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <MapPin className="w-5 h-5 mr-2" />
                Location Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zipcode" className="text-gray-300">
                  ZIP Code
                </Label>
                <Input
                  id="zipcode"
                  type="text"
                  placeholder="Enter your ZIP code"
                  value={zipcode}
                  onChange={(e) => setZipcode(e.target.value)}
                  className="bg-slate-600 border-slate-500 text-white placeholder-gray-400"
                  maxLength={5}
                />
              </div>

              {currentLocation.city && (
                <div className="text-sm text-gray-400">
                  Current location: {currentLocation.city}, {currentLocation.country}
                </div>
              )}

              {error && <div className="text-sm text-red-400 bg-red-900/20 p-3 rounded-lg">{error}</div>}

              <Button
                onClick={handleSubmit}
                disabled={loading || !zipcode.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fetching Prayer Times...
                  </>
                ) : (
                  "Update Location"
                )}
              </Button>
              <Button
                onClick={() => {
                  // Use sample data for testing
                  const sampleLocation: LocationData = {
                    zipcode: zipcode || "10001",
                    city: "New York, NY",
                    country: "US",
                  }

                  const samplePrayerData: PrayerTimesData = {
                    fajr: "5:32 AM",
                    sunrise: "7:03 AM",
                    dhuhr: "12:48 PM",
                    asr: "3:50 PM",
                    maghrib: "6:25 PM",
                    isha: "7:42 PM",
                    date: {
                      readable: new Date().toDateString(),
                      hijri: "Thursday, Safar 2, 1440",
                    },
                  }

                  localStorage.setItem("prayerApp_location", JSON.stringify(sampleLocation))
                  localStorage.setItem("prayerApp_prayerData", JSON.stringify(samplePrayerData))

                  onLocationUpdate(sampleLocation, samplePrayerData)
                }}
                variant="outline"
                className="w-full mt-2 border-slate-500 text-gray-300 hover:bg-slate-600"
              >
                Use Sample Data (for testing)
              </Button>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card className="bg-slate-700/50 border-slate-600 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Prayer Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Calculation Method</span>
                <span className="text-sm text-gray-400">Islamic Society of North America</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Juristic Method</span>
                <span className="text-sm text-gray-400">Standard (Shafi, Maliki, Hanbali)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">High Latitude Adjustment</span>
                <span className="text-sm text-gray-400">Middle of Night</span>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card className="bg-slate-700/50 border-slate-600 mt-6 mb-20">
            <CardContent className="pt-6">
              <div className="text-center text-gray-400 text-sm">
                <p>Prayer times calculated using the Aladhan API</p>
                <p className="mt-2">Data is accurate for locations within the United States</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
