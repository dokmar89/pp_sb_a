// app/shops/page.tsx
import { ShopsTable } from "@/components/admin/shops/shops-table"
import { AdminGuard } from "@/components/admin/admin-guard"

export default function ShopsPage() {
  return (
    <AdminGuard requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">E-shopy</h1>
          <p className="text-muted-foreground">Správa registrovaných e-shopů</p>
        </div>
        <ShopsTable />
      </div>
    </AdminGuard>
  )
}