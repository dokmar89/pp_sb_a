"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, Building, CreditCard, Settings, ShoppingBag, Users, AlertTriangle, LogOut } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navigation = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: BarChart,
  },
  {
    title: "Společnosti",
    href: "/admin/companies",
    icon: Building,
  },
  {
    title: "E-shopy",
    href: "/admin/shops",
    icon: ShoppingBag,
  },
  {
    title: "Ověření",
    href: "/admin/verifications",
    icon: Users,
  },
  {
    title: "Transakce",
    href: "/admin/transactions",
    icon: CreditCard,
  },
  {
    title: "Chyby",
    href: "/admin/errors",
    icon: AlertTriangle,
  },
  {
    title: "Nastavení",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex w-64 flex-col border-r">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-semibold">Admin Portál</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="grid gap-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent" : "transparent",
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="border-t p-4">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/admin/logout">
            <LogOut className="mr-2 h-4 w-4" />
            Odhlásit se
          </Link>
        </Button>
      </div>
    </div>
  )
}