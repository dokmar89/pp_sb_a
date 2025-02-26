// components/admin/transactions/transactions-table.tsx
"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import { CalendarIcon, Download, Search } from "lucide-react"
import { toast } from "sonner"

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

export function TransactionsTable() {
  const [transactions, setTransactions] = useState<
    (Tables<"wallet_transactions"> & {
      companies: {
        name: string
      } | null
    })[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [date, setDate] = useState<Date>()
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true)
      try {
        let query = supabase
          .from("wallet_transactions")
          .select(`
            *,
            companies (
              name
            )
          `)
          .order("created_at", { ascending: false })

        // Apply filters
        if (typeFilter !== "all") {
          query = query.eq("type", typeFilter)
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
          query = query.or(`companies.name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        }

        const { data, error } = await query

        if (error) throw error
        setTransactions(data || [])
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()

    // Subscribe to realtime changes - KEEP THIS AS IT IS, ALREADY BACKEND CONNECTED
    const channel = supabase
      .channel("transactions_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "wallet_transactions" }, (payload) => {
        if (payload.eventType === "INSERT") {
          // Fetch the complete transaction data including relations
          supabase
            .from("wallet_transactions")
            .select(
              `
              *,
              companies (
                name
              )
            `,
            )
            .eq("id", payload.new.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setTransactions((current) => [data, ...current])
              }
            })
        } else if (payload.eventType === "UPDATE") {
          setTransactions((current) =>
            current.map((transaction) =>
              transaction.id === payload.new.id ? { ...transaction, ...payload.new } : transaction,
            ),
          )
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [searchQuery, typeFilter, statusFilter, date])

  const handleDownloadInvoice = async (transactionId: string) => {
    try {
      setDownloadingInvoice(transactionId)
      const response = await fetch(`/api/invoice/${transactionId}`)

      if (!response.ok) {
        throw new Error("Nepodařilo se stáhnout fakturu")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `faktura-${transactionId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading invoice:", error)
      toast.error("Nepodařilo se stáhnout fakturu")
    } finally {
      setDownloadingInvoice(null)
    }
  }

  const formatAmount = (amount: number, type: string) => `${type === "credit" ? "+" : "-"}${amount.toFixed(2)} Kč`

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
    <Card>
      <div className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Hledat transakce..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Typ transakce" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny typy</SelectItem>
                <SelectItem value="credit">Příchozí</SelectItem>
                <SelectItem value="debit">Odchozí</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny statusy</SelectItem>
                <SelectItem value="completed">Dokončené</SelectItem>
                <SelectItem value="pending">Čekající</SelectItem>
                <SelectItem value="failed">Zamítnuté</SelectItem>
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
                setTypeFilter("all")
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
              <TableHead>Společnost</TableHead>
              <TableHead>Popis</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Částka</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Žádné transakce k zobrazení
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.created_at), "Pp", {
                      locale: cs,
                    })}
                  </TableCell>
                  <TableCell>{transaction.companies?.name}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === "credit" ? "success" : "default"}>
                      {transaction.type === "credit" ? "Příchozí" : "Odchozí"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.status === "completed"
                          ? "success"
                          : transaction.status === "pending"
                            ? "warning"
                            : "destructive"
                      }
                    >
                      {transaction.status === "completed"
                        ? "Dokončeno"
                        : transaction.status === "pending"
                          ? "Čeká na zpracování"
                          : "Zamítnuto"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium",
                      transaction.type === "credit" ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {formatAmount(transaction.amount, transaction.type)}
                  </TableCell>
                  <TableCell>
                    {transaction.type === "credit" && transaction.status === "completed" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={downloadingInvoice === transaction.id}
                        onClick={() => handleDownloadInvoice(transaction.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}