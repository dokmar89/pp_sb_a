// components/admin/verifications/verifications-table.tsx
"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import { Search } from "lucide-react"

import { supabase } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function VerificationsTable() {
  const [verifications, setVerifications] = useState<
    (Tables<"verifications"> & {
      shops: {
        name: string
        companies: {
          name: string
        } | null
      } | null
    })[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [resultFilter, setResultFilter] = useState<string>("all")

  useEffect(() => {
    const fetchVerifications = async () => {
      setIsLoading(true)
      try {
        let query = supabase
          .from("verifications")
          .select(`
            *,
            shops (
              name,
              companies (
                name
              )
            )
          `)
          .order("created_at", { ascending: false })

        // Apply filters
        if (methodFilter !== "all") {
          query = query.eq("method", methodFilter)
        }
        if (resultFilter !== "all") {
          query = query.eq("result", resultFilter)
        }
        if (searchQuery) {
          query = query.or(`shops.name.ilike.%${searchQuery}%,shops.companies.name.ilike.%${searchQuery}%`)
        }

        const { data, error } = await query

        if (error) throw error
        setVerifications(data || [])
      } catch (error) {
        console.error("Error fetching verifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVerifications()

    // Subscribe to realtime changes - KEEP THIS AS IT IS, ALREADY BACKEND CONNECTED
    const channel = supabase
      .channel("verifications_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "verifications" }, (payload) => {
        if (payload.eventType === "INSERT") {
          // Fetch the complete verification data including relations
          supabase
            .from("verifications")
            .select(
              `
              *,
              shops (
                name,
                companies (
                  name
                )
              )
            `,
            )
            .eq("id", payload.new.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setVerifications((current) => [data, ...current])
              }
            })
        } else if (payload.eventType === "UPDATE") {
          setVerifications((current) =>
            current.map((verification) =>
              verification.id === payload.new.id ? { ...verification, ...payload.new } : verification,
            ),
          )
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [searchQuery, methodFilter, resultFilter])

  if (isLoading) {
    return (
      <Card>
        <div className="p-4">
          <div className="space-y-4">
            <div className="h-8 w-[200px] animate-pulse rounded bg-muted" />
            <div className="space-y-2">
               {/* Removed Mock Data, using loading placeholders */}
              <div className="h-12 animate-pulse rounded bg-muted" />
              <div className="h-12 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Hledat ověření..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Metoda ověření" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny metody</SelectItem>
                <SelectItem value="bankid">BankID</SelectItem>
                <SelectItem value="mojeid">MojeID</SelectItem>
                <SelectItem value="ocr">OCR</SelectItem>
                <SelectItem value="facescan">FaceScan</SelectItem>
                <SelectItem value="revalidate">Opakované ověření</SelectItem>
              </SelectContent>
            </Select>
            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Výsledek" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny výsledky</SelectItem>
                <SelectItem value="success">Úspěšné</SelectItem>
                <SelectItem value="failure">Neúspěšné</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setMethodFilter("all")
                setResultFilter("all")
              }}
            >
              Reset filtrů
            </Button>
            <Button variant="outline">Export CSV</Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>E-shop</TableHead>
              <TableHead>Společnost</TableHead>
              <TableHead>Metoda</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Výsledek</TableHead>
              <TableHead className="text-right">Cena</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {verifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
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
                  <TableCell>{verification.shops?.name}</TableCell>
                  <TableCell>{verification.shops?.companies?.name}</TableCell>
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
      </div>
    </Card>
  );
}