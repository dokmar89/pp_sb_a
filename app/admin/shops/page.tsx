import { ShopsTable } from "@/components/admin/shops/shops-table"

export default function ShopsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">E-shopy</h1>
        <p className="text-muted-foreground">Správa registrovaných e-shopů</p>
      </div>
      <ShopsTable />
    </div>
  )
}

