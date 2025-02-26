// app/settings/page.tsx
import { SettingsTabs } from "@/components/admin/settings/settings-tabs"
import { AdminGuard } from "@/components/admin/admin-guard"

export default function SettingsPage() {
  return (
    <AdminGuard requiredRole="super_admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Nastavení</h1>
          <p className="text-muted-foreground">Správa systémových nastavení</p>
        </div>
        <SettingsTabs />
      </div>
    </AdminGuard>
  )
}