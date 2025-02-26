// components/admin/admin-guard.tsx
"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/hooks/use-admin"

interface AdminGuardProps {
  children: React.ReactNode
  requiredRole?: "support" | "admin" | "super_admin"
}

export function AdminGuard({ children, requiredRole = "support" }: AdminGuardProps) {
  const router = useRouter()
  const { admin, isLoading } = useAdmin()

  useEffect(() => {
    console.log("AdminGuard useEffect running - isLoading:", isLoading, "admin:", admin); // <-- ADD THIS LOG

    if (!isLoading && !admin) {
      console.log("AdminGuard: Not loading and no admin - pushing to login"); // <-- ADD THIS LOG
      router.push("/admin/login")
      return
    }

    if (admin) {
      console.log("AdminGuard: Admin data found - role:", admin.role, "requiredRole:", requiredRole); // <-- ADD THIS LOG
      const roles = ["support", "admin", "super_admin"]
      const adminRoleIndex = roles.indexOf(admin.role)
      const requiredRoleIndex = roles.indexOf(requiredRole)

      if (adminRoleIndex < requiredRoleIndex) {
        console.log("AdminGuard: Insufficient role - pushing to admin dashboard (base)"); // <-- ADD THIS LOG
        router.push("/admin")
      }
    }
  }, [admin, isLoading, router, requiredRole])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!admin) {
    return null
  }

  return <>{children}</>
}