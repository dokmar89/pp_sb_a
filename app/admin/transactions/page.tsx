import { TransactionsTable } from "@/components/admin/transactions/transactions-table"

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transakce</h1>
        <p className="text-muted-foreground">Přehled všech transakcí v systému</p>
      </div>
      <TransactionsTable />
    </div>
  )
}

