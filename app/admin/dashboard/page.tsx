import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { AdminGuard } from "@/components/admin/admin-guard"

export default function DashboardPage() {
  return (
    <AdminGuard requiredRole="admin">
      <AdminDashboard />
    </AdminGuard>
  )
}