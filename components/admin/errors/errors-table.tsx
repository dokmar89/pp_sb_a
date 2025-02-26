// components/admin/errors/errors-table.tsx
"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import { CalendarIcon, Search } from "lucide-react"

import { supabase } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ErrorDetailsDialog } from "./error-details-dialog"

export function ErrorsTable() {
  const [errors, setErrors] = useState<
    (Tables<"errors"> & {
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
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [date, setDate] = useState<Date>()
  const [selectedError, setSelectedError] = useState<Tables<"errors"> | null>(null)

  useEffect(() => {
    const fetchErrors = async () => {
      try {
        let query = supabase
          .from("errors")
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
        if (sourceFilter !== "all") {
          query = query.eq("source", sourceFilter)
        }
        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter)
        }
        if (date) {
          const startOfDay = new Date(date)
          startOfDay.setHours(0, 0, 0, 0)
          const endOfDay = new Date(date)
          endOfDay.setHours(23, 59, 59, 999)

          query = query.gte("created_at", startOfDay.toISOString()).lte("created_at", endOfDay.toISOString())
        }
        if (searchQuery) {
          query = query.or(
            `shops.name.ilike.%${searchQuery}%,shops.companies.name.ilike.%${searchQuery}%,error_message.ilike.%${searchQuery}%`,
          )
        }

        const { data, error } = await query

        if (error) throw error
        setErrors(data || [])
      } catch (error) {
        console.error("Error fetching errors:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchErrors()

    // Subscribe to realtime changes
    const channel = supabase
      .channel("errors_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "errors" }, (payload) => {
        if (payload.eventType === "INSERT") {
          // Fetch the complete error data including relations
          supabase
            .from("errors")
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
                setErrors((current) => [data, ...current])
              }
            })
        } else if (payload.eventType === "UPDATE") {
          setErrors((current) =>
            current.map((error) => (error.id === payload.new.id ? { ...error, ...payload.new } : error)),
          )
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [searchQuery, sourceFilter, statusFilter, date])

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
    )
  }

  return (
    <>
      <Card>
        <div className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Hledat chyby..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Zdroj chyby" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny zdroje</SelectItem>
                  <SelectItem value="bankid">BankID</SelectItem>
                  <SelectItem value="mojeid">MojeID</SelectItem>
                  <SelectItem value="ocr">OCR</SelectItem>
                  <SelectItem value="facescan">FaceScan</SelectItem>
                  <SelectItem value="system">Systém</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny statusy</SelectItem>
                  <SelectItem value="open">Otevřené</SelectItem>
                  <SelectItem value="investigating">V řešení</SelectItem>
                  <SelectItem value="resolved">Vyřešené</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-[200px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: cs }) : "Vyberte datum"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSourceFilter("all")
                  setStatusFilter("all")
                  setDate(undefined)
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
                <TableHead>Zdroj</TableHead>
                <TableHead>Typ chyby</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Zpráva</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Žádné chyby k zobrazení
                  </TableCell>
                </TableRow>
              ) : (
                errors.map((error) => (
                  <TableRow
                    key={error.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedError(error)}
                  >
                    <TableCell>
                      {format(new Date(error.created_at), "Pp", {
                        locale: cs,
                      })}
                    </TableCell>
                    <TableCell>{error.shops?.name}</TableCell>
                    <TableCell>{error.shops?.companies?.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{error.source}</Badge>
                    </TableCell>
                    <TableCell>{error.error_type}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          error.status === "resolved"
                            ? "success"
                            : error.status === "investigating"
                              ? "warning"
                              : "destructive"
                        }
                      >
                        {error.status === "resolved"
                          ? "Vyřešeno"
                          : error.status === "investigating"
                            ? "V řešení"
                            : "Otevřeno"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">{error.error_message}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ErrorDetailsDialog
        error={selectedError}
        open={!!selectedError}
        onOpenChange={(open) => !open && setSelectedError(null)}
      />
    </>
  )
}