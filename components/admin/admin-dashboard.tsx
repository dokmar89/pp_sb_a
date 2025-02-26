"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/admin/overview"
import { RecentVerifications } from "@/components/admin/recent-verifications"
import { TopCompanies } from "@/components/admin/top-companies"
import { supabase } from "@/lib/supabase/client"
import { RegistrationRequests } from "@/components/admin/registration-requests"

export function AdminDashboard() {
  const [totalVerifications, setTotalVerifications] = useState<number>(0)
  const [activeCompanies, setActiveCompanies] = useState<number>(0)
  const [verificationSuccessRate, setVerificationSuccessRate] = useState<number>(0)
  const [errorCount, setErrorCount] = useState<number>(0)
  const [previousMonthVerifications, setPreviousMonthVerifications] = useState<number>(0)
  const [previousMonthErrors, setPreviousMonthErrors] = useState<number>(0)
  const [newCompaniesThisMonth, setNewCompaniesThisMonth] = useState<number>(0)
  const [previousMonthSuccessRate, setPreviousMonthSuccessRate] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        console.log("Fetching dashboard data...")
        
        const { data: { session } } = await supabase.auth.getSession()
        console.log("Current session:", session)

        const today = new Date()
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)

        // Total verifications count
        const { count: verificationsCount, error: verificationsError } = await supabase
          .from("verifications")
          .select("*", { count: "exact" })
        if (verificationsError) throw verificationsError
        setTotalVerifications(verificationsCount || 0)

        // Active companies count
        const { count: companiesCount, error: companiesError } = await supabase
          .from("companies")
          .select("*", { count: "exact" })
          .eq("status", "approved")
        if (companiesError) throw companiesError
        setActiveCompanies(companiesCount || 0)

        // Verification success rate
        const { count: successVerifications, error: successRateError } = await supabase
          .from("verifications")
          .select("*", { count: "exact" })
          .eq("result", "success")
        if (successRateError) throw successRateError;
        const successRate = verificationsCount ? (successVerifications || 0) / verificationsCount * 100 : 0;
        setVerificationSuccessRate(parseFloat(successRate.toFixed(1)));


        // Error count
        const { count: errorsCount, error: errorsError } = await supabase
          .from("errors")
          .select("*", { count: "exact" })
          .neq("status", "resolved")
        if (errorsError) throw errorsError
        setErrorCount(errorsCount || 0)


        // Verifications last month
        const { count: lastMonthVerificationsCount, error: lastMonthVerificationsError } = await supabase
          .from("verifications")
          .select('*', { count: 'exact' })
          .gte('created_at', firstDayOfLastMonth.toISOString())
          .lt('created_at', firstDayOfMonth.toISOString())
        if (lastMonthVerificationsError) throw lastMonthVerificationsError;
        setPreviousMonthVerifications(lastMonthVerificationsCount || 0);

        const percentageVerificationChange = previousMonthVerifications === 0 ? 100 : ((verificationsCount || 0) - previousMonthVerifications) / previousMonthVerifications * 100;


        // Errors last month
        const { count: lastMonthErrorsCount, error: lastMonthErrorsError } = await supabase
          .from("errors")
          .select('*', { count: 'exact' })
          .gte('created_at', firstDayOfLastMonth.toISOString())
          .lt('created_at', firstDayOfMonth.toISOString())
          .neq("status", "resolved")
        if (lastMonthErrorsError) throw lastMonthErrorsError;
        setPreviousMonthErrors(lastMonthErrorsCount || 0);

        const percentageErrorChange = previousMonthErrors === 0 ? 100 : ((errorCount || 0) - previousMonthErrors) / previousMonthErrors * 100;


        // New companies this month
        const { count: newCompaniesCount, error: newCompaniesError } = await supabase
          .from("companies")
          .select('*', { count: 'exact' })
          .gte('created_at', firstDayOfMonth.toISOString())
          .lt('created_at', today.toISOString())
        if (newCompaniesError) throw newCompaniesError;
        setNewCompaniesThisMonth(newCompaniesCount || 0);

        // Success rate last month
        const { count: lastMonthSuccessVerifications, error: lastMonthSuccessRateError } = await supabase
          .from("verifications")
          .select('*', { count: 'exact' })
          .gte('created_at', firstDayOfLastMonth.toISOString())
          .lt('created_at', firstDayOfMonth.toISOString())
          .eq('result', 'success')
        if (lastMonthSuccessRateError) throw lastMonthSuccessRateError;
        const lastMonthSuccessRate = lastMonthVerificationsCount ? (lastMonthSuccessVerifications || 0) / lastMonthVerificationsCount * 100 : 0;
        setPreviousMonthSuccessRate(parseFloat(lastMonthSuccessRate.toFixed(1)));
        const percentageSuccessRateChange = previousMonthSuccessRate === 0 ? 100 : (successRate - previousMonthSuccessRate);


        setCardData({
          totalVerifications: { value: verificationsCount || 0, percentageChange: percentageVerificationChange },
          activeCompanies: { value: companiesCount || 0, newCount: newCompaniesThisMonth },
          verificationSuccessRate: { value: parseFloat(successRate.toFixed(1)), percentageChange: percentageSuccessRateChange },
          errorCount: { value: errorsCount || 0, percentageChange: percentageErrorChange },
        });

        console.log("Dashboard data loaded:", {
          totalVerifications,
          activeCompanies,
          verificationSuccessRate,
          errorCount
        })

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])


  interface CardData {
    totalVerifications: { value: number, percentageChange: number | undefined };
    activeCompanies: { value: number, newCount: number };
    verificationSuccessRate: { value: number, percentageChange: number | undefined };
    errorCount: { value: number, percentageChange: number | undefined };
  }

  const [cardData, setCardData] = useState<CardData>({
    totalVerifications: { value: 0, percentageChange: undefined },
    activeCompanies: { value: 0, newCount: 0 },
    verificationSuccessRate: { value: 0, percentageChange: undefined },
    errorCount: { value: 0, percentageChange: undefined },
  });


  const formatPercentageChange = (change: number | undefined) => {
    if (change === undefined) return "";
    const formattedChange = change.toFixed(1);
    return `${change > 0 ? '+' : ''}${formattedChange}% oproti minulému měsíci`;
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Přehled systému věkové verifikace</p>
        </div>
        <Card>
  <CardHeader>
    <CardTitle>Žádosti o registraci</CardTitle>
    <CardDescription>Seznam čekajících žádostí o registraci</CardDescription>
  </CardHeader>
  <CardContent>
    <RegistrationRequests />
  </CardContent>
</Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Celkem ověření</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold animate-pulse bg-muted h-6 w-32 rounded" />
              <p className="text-xs text-muted-foreground animate-pulse bg-muted h-4 w-48 rounded mt-2" ></p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktivní společnosti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold animate-pulse bg-muted h-6 w-24 rounded" />
              <p className="text-xs text-muted-foreground animate-pulse bg-muted h-4 w-32 rounded mt-2"></p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Úspěšnost ověření</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold animate-pulse bg-muted h-6 w-20 rounded" />
              <p className="text-xs text-muted-foreground animate-pulse bg-muted h-4 w-40 rounded mt-2"></p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chyby</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold animate-pulse bg-muted h-6 w-16 rounded" />
              <p className="text-xs text-muted-foreground animate-pulse bg-muted h-4 w-48 rounded mt-2"></p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Přehled</CardTitle>
              <CardDescription>Počet ověření za posledních 30 dní</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="animate-pulse bg-muted h-[300px] rounded" />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Top společnosti</CardTitle>
              <CardDescription>Podle počtu ověření tento měsíc</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse bg-muted h-[300px] rounded" />
            </CardContent>
          </Card>
       </div>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Přehled systému věkové verifikace</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Žádosti o registraci</CardTitle>
          <CardDescription>Seznam čekajících žádostí o registraci</CardDescription>
        </CardHeader>
        <CardContent>
          <RegistrationRequests />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkem ověření</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cardData.totalVerifications.value}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentageChange(cardData.totalVerifications.percentageChange)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktivní společnosti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cardData.activeCompanies.value}</div>
            <p className="text-xs text-muted-foreground">
              {cardData.activeCompanies.newCount} nových tento měsíc
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Úspěšnost ověření</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cardData.verificationSuccessRate.value}%</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentageChange(cardData.verificationSuccessRate.percentageChange)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chyby</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cardData.errorCount.value}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentageChange(cardData.errorCount.percentageChange)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Přehled</CardTitle>
            <CardDescription>Počet ověření za posledních 30 dní</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top společnosti</CardTitle>
            <CardDescription>Podle počtu ověření tento měsíc</CardDescription>
          </CardHeader>
          <CardContent>
            <TopCompanies />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}