// components/admin/shops/shops-table.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import { Copy, MoreHorizontal, Search } from "lucide-react"

import { supabase } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { EditShopDialog } from "./edit-shop-dialog"
import { RegenerateApiKeyDialog } from "./regenerate-api-key-dialog"

export function ShopsTable() {
  const [shops, setShops] = useState<Tables<"shops">[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingShop, setEditingShop] = useState<Tables<"shops"> | null>(null)
  const [regeneratingApiKey, setRegeneratingApiKey] = useState<Tables<"shops"> | null>(null)

  const fetchShops = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("shops")
        .select("*, companies(name)")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Detailed error fetching shops:", error)
        toast.error("Nepodařilo se načíst obchody")
        throw error
      }

      // Add null checks and default values
      const processedShops = (data || []).map(shop => ({
        ...shop,
        company_name: (shop.companies as any)?.name || 'Bez společnosti',
        status: shop.status || 'active',
        api_key: shop.api_key || 'N/A'
      }))

      setShops(processedShops)
    } catch (error) {
      console.error("Error processing shops:", error)
      toast.error("Chyba při zpracování obchodů")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchShops()

    // Subscribe to realtime changes
    const channel = supabase
      .channel("shops_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "shops" }, (payload) => {
        console.log("Realtime shops payload:", payload)
        
        if (payload.eventType === "INSERT") {
          setShops((current) => [
            {
              ...(payload.new as Tables<"shops">),
              company_name: (payload.new as any).companies?.name || 'Bez společnosti'
            }, 
            ...current
          ])
        } else if (payload.eventType === "UPDATE") {
          setShops((current) =>
            current.map((shop) => 
              shop.id === payload.new.id 
                ? {
                    ...(payload.new as Tables<"shops">),
                    company_name: (payload.new as any).companies?.name || 'Bez společnosti'
                  } 
                : shop
            )
          )
        } else if (payload.eventType === "DELETE") {
          setShops((current) => current.filter((shop) => shop.id !== payload.old.id))
        }
      })
      .subscribe()

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey)
    toast.success("API klíč byl zkopírován do schránky")
  }

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
        <div className="flex items-center gap-4 pb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Hledat e-shopy..."
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
              <TableHead>URL</TableHead>
              <TableHead>Společnost</TableHead>
              <TableHead>API klíč</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registrace</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shops.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Žádné e-shopy k zobrazení
                </TableCell>
              </TableRow>
            ) : (
              shops.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell className="font-medium">{shop.name}</TableCell>
                  <TableCell>{shop.url}</TableCell>
                  <TableCell>{shop.company_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted px-2 py-1">{shop.api_key.slice(0, 8)}...</code>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyApiKey(shop.api_key)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={shop.status === "active" ? "success" : "destructive"}>
                      {shop.status === "active" ? "Aktivní" : "Neaktivní"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(shop.created_at), "Pp", {
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
                          <Link href={`/admin/shops/${shop.id}`}>Detail</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingShop(shop)}>Upravit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRegeneratingApiKey(shop)}>Změnit API klíč</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <EditShopDialog shop={editingShop} open={!!editingShop} onOpenChange={(open) => !open && setEditingShop(null)} />
      <RegenerateApiKeyDialog
        shop={regeneratingApiKey}
        open={!!regeneratingApiKey}
        onOpenChange={(open) => !open && setRegeneratingApiKey(null)}
      />
    </Card>
  )
}