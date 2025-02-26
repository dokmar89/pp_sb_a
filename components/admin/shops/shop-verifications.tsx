"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { cs } from "date-fns/locale"

import { supabase } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface ShopVerificationsProps {
  shopId: string
}

export function ShopVerifications({ shopId }: ShopVerificationsProps) {
  const [verifications, setVerifications] = useState<Tables<"verifications">[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        const { data, error } = await supabase
          .from("verifications")
          .select("*")
          .eq("shop_id", shopId)
          .order("created_at", { ascending: false })
          .limit(10)

        if (error) throw error
        setVerifications(data)
      } catch (error) {
        console.error("Error fetching verifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVerifications()

    // Subscribe to realtime changes
    const channel = supabase
      .channel("verifications_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "verifications",
          filter: `shop_id=eq.${shopId}`,
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
  }, [shopId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nedávná ověření</CardTitle>
          <CardDescription>Historie posledních 10 ověření</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nedávná ověření</CardTitle>
        <CardDescription>Historie posledních 10 ověření</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Metoda</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Výsledek</TableHead>
              <TableHead className="text-right">Cena</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {verifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Žádná ověření k zobrazení
                </TableCell>
              </TableRow>
            ) : (
              verifications.map((verification) => (
                <TableRow key={verification.id}>
                  <TableCell>
                    {format(new Date(verification.created_at), "Pp", {
                      locale: cs,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{verification.method}</Badge>
                  </TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

