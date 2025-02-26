import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase configuration")
      return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Logout failed:", error)
      return NextResponse.json({ error: "Logout failed" }, { status: 500 })
    }

    // Clear all cookies and redirect to login
    const response = NextResponse.redirect(new URL("/admin/login", request.url))
    
    // Clear authentication-related cookies
    response.cookies.delete("sb-access-token")
    response.cookies.delete("sb-refresh-token")
    response.cookies.delete("sb:token")

    return response
  } catch (err) {
    console.error("Unexpected error during logout:", err)
    return NextResponse.json({ error: "Unexpected logout error" }, { status: 500 })
  }
}
