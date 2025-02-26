"use client"

// app/admin/layout.tsx
import { Inter } from "next/font/google"
import { usePathname } from "next/navigation"
import { Toaster } from "@/components/ui/toaster"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useAdmin } from "@/hooks/use-admin"
import "@/styles/globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { admin, isLoading } = useAdmin()
  const pathname = usePathname()
  const isLoginPage = pathname === "/admin/login"

  // Na login stránce nezobrazujeme sidebar
  if (isLoginPage) {
    return (
      <html lang="cs">
        <body className={inter.className}>
          <div className="min-h-screen bg-gray-100">
            {children}
          </div>
          <Toaster />
        </body>
      </html>
    )
  }

  // Když načítáme data nebo nemáme admina, zobrazíme loading stav
  if (isLoading || !admin) {
    return (
      <html lang="cs">
        <body className={inter.className}>
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
          </div>
          <Toaster />
        </body>
      </html>
    )
  }

  // Hlavní admin layout se sidebarem
  return (
    <html lang="cs">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-100">
          <div className="flex">
            <AdminSidebar />
            <main className="flex-1 p-8">
              {children}
            </main>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  )
}