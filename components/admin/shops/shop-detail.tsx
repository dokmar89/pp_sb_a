// components/admin/shops/shop-detail.tsx
"use client"

import { format } from "date-fns"
import { cs } from "date-fns/locale"
import { Building, Globe, Package, Phone, Mail } from "lucide-react"

import type { Tables } from "@/lib/supabase/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ShopDetailProps {
  shop: Tables<"shops"> & {
    companies: {
      name: string
      email: string
      phone: string
    } | null
  }
}

export function ShopDetail({ shop }: ShopDetailProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Základní informace</CardTitle>
        <CardDescription>Detailní informace o e-shopu</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Status</div>
            <Badge variant={shop.status === "active" ? "success" : "destructive"}>
              {shop.status === "active" ? "Aktivní" : "Neaktivní"}
            </Badge>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Registrace</div>
            <div>
              {format(new Date(shop.created_at), "Pp", {
                locale: cs,
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-muted-foreground mb-2">Základní údaje</div>
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a href={shop.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {shop.url}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>Sektor: {shop.sector}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-muted-foreground mb-2">Společnost</div>
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>{shop.companies?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{shop.companies?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{shop.companies?.phone}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-muted-foreground mb-2">Integrace</div>
          <div className="grid gap-4">
            <div>
              <div className="font-medium">Způsob integrace</div>
              <div className="text-muted-foreground">
                {shop.integration_type === "api"
                  ? "API (vlastní řešení)"
                  : shop.integration_type === "widget"
                    ? "Widget"
                    : "Plugin pro platformu"}
              </div>
            </div>
            <div>
              <div className="font-medium">Povolené metody ověření</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {shop.verification_methods.map((method) => (
                  <Badge key={method} variant="secondary">
                    {method}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="font-medium">Cenový plán</div>
              <div className="text-muted-foreground">
                {shop.pricing_plan === "contract" ? "Se smlouvou na 2 roky" : "Bez smlouvy"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}