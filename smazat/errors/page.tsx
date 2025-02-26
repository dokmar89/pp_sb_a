// app/errors/page.tsx
import { ErrorsTable } from "@/components/admin/errors/errors-table"
import { AdminGuard } from "@/components/admin/admin-guard"

export default function ErrorsPage() {
  return (
    <AdminGuard requiredRole="support">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Chyby</h1>
          <p className="text-muted-foreground">Přehled chyb v systému</p>
        </div>
        <ErrorsTable />
      </div>
    </AdminGuard>
  )
}