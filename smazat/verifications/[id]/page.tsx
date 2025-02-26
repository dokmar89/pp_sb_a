// app/admin/verifications/[id]/page.tsx
import { AdminGuard } from "@/components/admin/admin-guard"

interface VerificationDetailPageProps {
  params: {
    id: string
  }
}

export default function VerificationDetailPage({ params }: VerificationDetailPageProps) {
  return (
    <AdminGuard requiredRole="support">
      <div>
        <h1>Detail Ověření ID: {params.id}</h1>
        {/* Zde by mohl být detail ověření - zatím komponenta není vytvořena */}
        <p>Detail ověření s ID: {params.id} bude zobrazen zde.</p>
      </div>
    </AdminGuard>
  )
}