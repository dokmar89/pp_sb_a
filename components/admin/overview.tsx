"use client"

import { useState, useEffect } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { supabase } from "@/lib/supabase/client"
import { format } from "date-fns";

interface VerificationDataPoint {
  date: string;
  total: number;
}

export function Overview() {
  const [data, setData] = useState<VerificationDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOverviewData = async () => {
      setIsLoading(true)
      try {
        const today = new Date()
        const startDate = new Date(today)
        startDate.setDate(today.getDate() - 30) // Fetch data for the last 30 days

        const { data: verifications, error } = await supabase
          .from("verifications")
          .select("created_at")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", today.toISOString())

        if (error) {
          throw error
        }

        // Process data to count verifications per day
        const dailyCounts: { [date: string]: number } = {};
        verifications.forEach((v) => {
          const date = format(new Date(v.created_at), 'yyyy-MM-dd');
          dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        });

        // Format data for recharts
        const chartData: VerificationDataPoint[] = [];
        for (let i = 0; i < 30; i++) {
          const currentDate = new Date(startDate)
          currentDate.setDate(startDate.getDate() + i)
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          chartData.push({
            date: dateStr,
            total: dailyCounts[dateStr] || 0,
          });
        }
        setData(chartData);


      } catch (error) {
        console.error("Error fetching overview data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOverviewData()
  }, [])

  if (isLoading) {
    return (
      <div className="animate-pulse bg-muted h-[350px] rounded" />
    )
  }


  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}