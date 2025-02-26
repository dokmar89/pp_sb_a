import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getAdmin, hasPermission } from "@/lib/admin"

export async function GET(request: Request) {
  const admin = await getAdmin()

  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // Example of permission check
  if (!hasPermission(admin.role, "admin")) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  // Get all admins (only accessible by admins and super_admins)
  const { data: admins, error } = await supabase.from("admins").select("*").order("created_at", { ascending: false })

  if (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }

  return NextResponse.json(admins)
}

export async function POST(request: Request) {
  const admin = await getAdmin()

  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // Only super_admins can create new admins
  if (!hasPermission(admin.role, "super_admin")) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  try {
    const body = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

    // Create new user in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    })

    if (authError) throw authError

    // Create admin record
    const { data: newAdmin, error: adminError } = await supabase
      .from("admins")
      .insert({
        user_id: authUser.user.id,
        role: body.role,
        name: body.name,
        email: body.email,
      })
      .select()
      .single()

    if (adminError) throw adminError

    return NextResponse.json(newAdmin)
  } catch (error) {
    console.error("Error creating admin:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

