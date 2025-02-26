// app/companies/page.tsx
import { CompaniesTable } from "@/components/admin/companies/companies-table"
import { AdminGuard } from "@/components/admin/admin-guard"

export default function CompaniesPage() {
  return (
    <AdminGuard requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Společnosti</h1>
          <p className="text-muted-foreground">Správa registrovaných společností</p>
        </div>
        <CompaniesTable />
      </div>
    </AdminGuard>
  )
}