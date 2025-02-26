import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies, headers } from "next/headers"
import { cache } from "react"

export const getAdmin = cache(async () => {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: admin } = await supabase.from("admins").select("*").eq("user_id", session.user.id).single()

  return admin
})

export async function logAdminAction(
  adminId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: any,
) {
  const supabase = createServerComponentClient({ cookies })

  const actionLog = {
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
    ip_address: headers().get("x-forwarded-for") || "unknown",
    user_agent: headers().get("user-agent"),
  }

  await supabase.from("admin_actions_log").insert(actionLog)
}

export function hasPermission(adminRole: string, requiredRole: string) {
  const roles = ["support", "admin", "super_admin"]
  const adminRoleIndex = roles.indexOf(adminRole)
  const requiredRoleIndex = roles.indexOf(requiredRole)

  return adminRoleIndex >= requiredRoleIndex
}

