// components/admin/recent-verifications.tsx
"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { cs } from "date-fns/locale"

import { supabase } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card" // Import Card as well
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface RecentVerification {
  created_at: string;
  company_name: string | null;
  shop_name: string | null;
  method: string | null;
  status: string | null;
  price: number | null;
  result: string | null;
}


export function RecentVerifications() {
  const [recentVerifications, setRecentVerifications] = useState<RecentVerification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecentVerifications = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("verifications")
          .select(`
            created_at,
            method,
            status,
            price,
            result,
            shops (
              name,
              companies (
                name
              )
            )
          `)
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) {
          throw error
        }

        if (data) {
          const formattedData = data.map(verification => ({
            created_at: verification.created_at,
            company_name: verification.shops?.companies?.name || null,
            shop_name: verification.shops?.name || null,
            method: verification.method,
            status: verification.status,
            price: verification.price,
            result: verification.result
          }));
          setRecentVerifications(formattedData as RecentVerification[]);
        }


      } catch (error) {
        console.error("Error fetching recent verifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentVerifications()

    // Subscribe to realtime changes
    const channel = supabase
      .channel("verifications_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "verifications",
               },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setVerifications((current) => [payload.new as Tables<"verifications">, ...current.slice(0, 9)])
          } else if (payload.eventType === "UPDATE") {
            setVerifications((current) =>
              current.map((verification) =>
                verification.id === payload.new.id ? (payload.new as Tables<"verifications">) : verification,
              ),
            )
          }
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Společnost</TableHead>
                <TableHead>E-shop</TableHead>
                <TableHead>Metoda</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Cena</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell className="h-4 w-24 bg-muted rounded"></TableCell>
                  <TableCell className="h-4 w-32 bg-muted rounded"></TableCell>
                  <TableCell className="h-4 w-24 bg-muted rounded"></TableCell>
                  <TableCell className="h-4 w-20 bg-muted rounded"></TableCell>
                  <TableCell className="h-4 w-24 bg-muted rounded"></TableCell>
                  <TableCell className="text-right h-4 w-16 bg-muted rounded"></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }


  return (
    <Card> 
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Společnost</TableHead>
              <TableHead>E-shop</TableHead>
              <TableHead>Metoda</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Výsledek</TableHead>
              <TableHead className="text-right">Cena</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentVerifications.map((verification, index) => (
              <TableRow key={index}>
                <TableCell>{format(new Date(verification.created_at), "Pp", { locale: cs })}</TableCell>
                <TableCell>{verification.company_name}</TableCell>
                <TableCell>{verification.shop_name}</TableCell>
                <TableCell><Badge variant="secondary">{verification.method}</Badge></TableCell>
                <TableCell>
                  <Badge variant={verification.status === "completed" ? "success" : "warning"}>
                    {verification.status === "completed" ? "Dokončeno" : "Probíhá"}
                  </Badge>
                </TableCell>
                 <TableCell>
                  <Badge variant={verification.result === "success" ? "success" : "destructive"}>
                    {verification.result === "success" ? "Úspěšné" : "Neúspěšné"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{verification.price} Kč</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
