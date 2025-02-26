import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "./types"

export function createClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}
