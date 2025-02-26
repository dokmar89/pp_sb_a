// app/verifications/page.tsx
import { VerificationsTable } from "@/components/admin/verifications/verifications-table"
import { AdminGuard } from "@/components/admin/admin-guard"

export default function VerificationsPage() {
  return (
    <AdminGuard requiredRole="support">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Ověření</h1>
          <p className="text-muted-foreground">Přehled všech ověření věku</p>
        </div>
        <VerificationsTable />
      </div>
    </AdminGuard>
  )
}