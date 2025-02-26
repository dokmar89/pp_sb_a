// app/admin/errors/[id]/page.tsx
import { ErrorDetailsDialog } from "@/components/admin/errors/error-details-dialog"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { notFound } from "next/navigation"
import { AdminGuard } from "@/components/admin/admin-guard"

interface ErrorDetailPageProps {
  params: {
    id: string
  }
}

export default async function ErrorDetailPage({ params }: ErrorDetailPageProps) {
  const supabase = createServerComponentClient({ cookies })

  const { data: error, error: supabaseError } = await supabase
    .from("errors")
    .select(`
      *,
      shops (
        name,
        companies (
          name
        )
      )
    `)
    .eq("id", params.id)
    .single()

  if (supabaseError || !error) {
    notFound()
  }

  return (
    <AdminGuard requiredRole="support">
      <div>
        <ErrorDetailsDialog error={error} open={true} onOpenChange={() => null} />
      </div>
    </AdminGuard>
  )
}