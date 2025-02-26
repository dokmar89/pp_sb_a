"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import { MoreHorizontal, Search } from "lucide-react"

import { supabase } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EditCompanyDialog } from "./edit-company-dialog"
import { CreditDialog } from "./credit-dialog"

export function CompaniesTable() {
  const [companies, setCompanies] = useState<Tables<"companies">[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingCompany, setEditingCompany] = useState<Tables<"companies"> | null>(null)
  const [creditCompany, setCreditCompany] = useState<Tables<"companies"> | null>(null)

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true)
      try {
        const query = supabase
          .from("companies")
          .select("*, wallet_transactions(amount, type)")
          .order("created_at", { ascending: false })

        if (searchQuery) {
          query.or(`name.ilike.%${searchQuery}%,ico.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        }

        const { data, error } = await query

        if (error) throw error
        setCompanies(data || [])
      } catch (error) {
        console.error("Error fetching companies:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanies()

    // Subscribe to realtime changes - KEEP THIS AS IT IS, IT'S ALREADY BACKEND CONNECTED
    const channel = supabase
      .channel("companies_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "companies" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setCompanies((current) => [payload.new as Tables<"companies">, ...current])
        } else if (payload.eventType === "UPDATE") {
          setCompanies((current) =>
            current.map((company) => (company.id === payload.new.id ? (payload.new as Tables<"companies">) : company)),
          )
        } else if (payload.eventType === "DELETE") {
          setCompanies((current) => current.filter((company) => company.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [searchQuery])

  const calculateBalance = (company: Tables<"companies">) => {
    if (!company.wallet_transactions) return 0

    return (company.wallet_transactions as any[]).reduce((acc, transaction) => {
      if (transaction.type === "credit") {
        return acc + transaction.amount
      } else {
        return acc - transaction.amount
      }
    }, 0)
  }

  if (isLoading) {
    return (
      <Card>
        <div className="p-4">
          <div className="space-y-4">
            <div className="h-8 w-[200px] animate-pulse rounded bg-muted" />
            <div className="space-y-2">
              {/* Removed Mock Data here, using loading placeholders */}
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
        <div className="flex items-center gap-4 pb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Hledat společnosti..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Název</TableHead>
              <TableHead>IČO</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Kredit</TableHead>
              <TableHead>Registrace</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Žádné společnosti k zobrazení
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.ico}</TableCell>
                  <TableCell>{company.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        company.status === "approved"
                          ? "success"
                          : company.status === "pending"
                            ? "warning"
                            : "destructive"
                      }
                    >
                      {company.status === "approved"
                        ? "Schváleno"
                        : company.status === "pending"
                          ? "Čeká na schválení"
                          : "Zamítnuto"}
                    </Badge>
                  </TableCell>
                  <TableCell>{calculateBalance(company).toFixed(2)} Kč</TableCell>
                  <TableCell>
                    {format(new Date(company.created_at), "Pp", {
                      locale: cs,
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Akce</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/companies/${company.id}`}>Detail</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingCompany(company)}>Upravit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCreditCompany(company)}>Upravit kredit</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <EditCompanyDialog
        company={editingCompany}
        open={!!editingCompany}
        onOpenChange={(open) => !open && setEditingCompany(null)}
      />
      <CreditDialog
        company={creditCompany}
        open={!!creditCompany}
        onOpenChange={(open) => !open && setCreditCompany(null)}
      />
    </Card>
  )
}