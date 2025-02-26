import { CompaniesTable } from "@/components/admin/companies/companies-table"

export default function CompaniesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Společnosti</h1>
        <p className="text-muted-foreground">Správa registrovaných společností</p>
      </div>
      <CompaniesTable />
    </div>
  )
}

