// hooks/use-admin.ts
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/types"

export function useAdmin() {
  const [admin, setAdmin] = useState<Tables<"admins"> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAdmin = async () => {
      setIsLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log("Session in useAdmin:", session)

        if (!session) {
          console.log("No session found")
          setAdmin(null)
          return
        }

        const { data, error } = await supabase
          .from("admins")
          .select("*")
          .eq("user_id", session.user.id)
          .single()

        console.log("Admin data:", data)
        console.log("Admin error:", error)

        if (error) throw error
        setAdmin(data)

      } catch (error) {
        console.error("Error in useAdmin:", error)
        if (error instanceof Error) {
          console.error("Error details:", error.message)
        }
        setAdmin(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdmin()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchAdmin()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { admin, isLoading }
}