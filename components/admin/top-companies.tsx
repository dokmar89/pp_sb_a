"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"

interface TopCompany {
  companyName: string;
  verificationCount: number;
  successRate: number;
}

export function TopCompanies() {
  const [topCompaniesData, setTopCompaniesData] = useState<TopCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTopCompanies = async () => {
      setIsLoading(true)
      try {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const { data, error } = await supabase.rpc('get_top_companies_this_month')
          .gte('verification_created_at', firstDayOfMonth.toISOString())
          .lte('verification_created_at', today.toISOString())
          .limit(5);


        if (error) {
          throw error;
        }

        if (data) {
          const formattedData = data.map(company => ({
            companyName: company.company_name,
            verificationCount: company.verification_count,
            successRate: parseFloat(company.success_rate).toFixed(1)
          }));
          setTopCompaniesData(formattedData as TopCompany[]);
        }


      } catch (error) {
        console.error("Error fetching top companies:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopCompanies()
  }, [])

  if (isLoading) {
    return (
      <CardContent className="space-y-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center animate-pulse">
            <Avatar className="h-9 w-9 bg-muted rounded-full" >
              <AvatarFallback className="animate-pulse bg-muted rounded-full"></AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1 flex-1">
              <div className="h-4 w-48 bg-muted rounded"></div>
              <div className="h-3 w-32 bg-muted rounded mt-1"></div>
            </div>
            <div className="font-medium h-4 w-16 bg-muted rounded ml-auto"></div>
          </div>
        ))}
      </CardContent>
    )
  }


  return (
    <CardContent className="space-y-8">
      {topCompaniesData.map((company, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{company.companyName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1 flex-1">
            <p className="text-sm font-medium leading-none">{company.companyName}</p>
            <p className="text-sm text-muted-foreground">{company.verificationCount} ověření tento měsíc</p>
          </div>
          <div className="ml-auto font-medium">{company.successRate}%</div>
        </div>
      ))}
    </CardContent>
  )
}