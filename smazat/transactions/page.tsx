// app/transactions/page.tsx
import { TransactionsTable } from "@/components/admin/transactions/transactions-table"
import { AdminGuard } from "@/components/admin/admin-guard"

export default function TransactionsPage() {
  return (
    <AdminGuard requiredRole="support">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Transakce</h1>
          <p className="text-muted-foreground">Přehled všech transakcí v systému</p>
        </div>
        <TransactionsTable />
      </div>
    </AdminGuard>
  )
}