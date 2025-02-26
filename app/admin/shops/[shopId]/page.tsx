import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { notFound } from "next/navigation"

import { ShopDetail } from "@/components/admin/shops/shop-detail"
import { ShopCustomization } from "@/components/admin/shops/shop-customization"
import { ShopVerifications } from "@/components/admin/shops/shop-verifications"

interface ShopDetailPageProps {
  params: {
    shopId: string
  }
}

export default async function ShopDetailPage({ params }: ShopDetailPageProps) {
  const supabase = createServerComponentClient({ cookies })

  const { data: shop } = await supabase
    .from("shops")
    .select(
      `
      *,
      companies (
        name,
        email,
        phone
      ),
      customizations (*)
    `,
    )
    .eq("id", params.shopId)
    .single()

  if (!shop) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{shop.name}</h1>
        <p className="text-muted-foreground">Detail e-shopu a jeho nastavení</p>
      </div>

      <div className="grid gap-6">
        <ShopDetail shop={shop} />
        <ShopCustomization shop={shop} customization={shop.customizations} />
        <ShopVerifications shopId={shop.id} />
      </div>
    </div>
  )
}

