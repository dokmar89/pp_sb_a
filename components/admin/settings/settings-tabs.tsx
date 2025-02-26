// components/admin/settings/settings-tabs.tsx
"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PricingSettings } from "./pricing-settings"
import { LimitsSettings } from "./limits-settings"
import { NotificationSettings } from "./notification-settings"
import { ServicesSettings } from "./services-settings"
import { BillingSettings } from "./billing-settings"
import { SettingsAuditLog } from "./settings-audit-log"

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState("pricing")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="pricing">Ceny</TabsTrigger>
        <TabsTrigger value="limits">Limity</TabsTrigger>
        <TabsTrigger value="notifications">Notifikace</TabsTrigger>
        <TabsTrigger value="services">Služby</TabsTrigger>
        <TabsTrigger value="billing">Fakturace</TabsTrigger>
        <TabsTrigger value="audit">Historie změn</TabsTrigger>
      </TabsList>

      <TabsContent value="pricing" className="space-y-4">
        <PricingSettings />
      </TabsContent>

      <TabsContent value="limits" className="space-y-4">
        <LimitsSettings />
      </TabsContent>

      <TabsContent value="notifications" className="space-y-4">
        <NotificationSettings />
      </TabsContent>

      <TabsContent value="services" className="space-y-4">
        <ServicesSettings />
      </TabsContent>

      <TabsContent value="billing" className="space-y-4">
        <BillingSettings />
      </TabsContent>

      <TabsContent value="audit" className="space-y-4">
        <SettingsAuditLog />
      </TabsContent>
    </Tabs>
  )
}