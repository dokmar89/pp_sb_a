// components/admin/shops/edit-shop-dialog.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { supabase } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  name: z.string().min(2, "Název e-shopu musí mít alespoň 2 znaky"),
  url: z.string().url("Zadejte platnou URL adresu"),
  sector: z.string().min(1, "Vyberte sektor"),
  verification_methods: z.array(z.string()).min(1, "Vyberte alespoň jednu metodu ověření"),
  integration_type: z.string().min(1, "Vyberte typ integrace"),
  pricing_plan: z.string().min(1, "Vyberte cenový plán"),
  status: z.enum(["active", "inactive"]),
})

const sectors = [
  { value: "pyrotechnika", label: "Pyrotechnika" },
  { value: "kuracke-potreby", label: "Kuřácké potřeby" },
  { value: "chemicke-latky", label: "Chemické a nebezpečné látky" },
  { value: "eroticke-zbozi", label: "Erotické zboží" },
  { value: "online-hazard", label: "Online hazard" },
  { value: "jine", label: "Jiné" },
]

const verificationMethods = [
  { id: "bankid", label: "BankID" },
  { id: "mojeid", label: "MojeID" },
  { id: "ocr", label: "OCR" },
  { id: "facescan", label: "Facescan" },
]

const integrationTypes = [
  { value: "api", label: "API (vlastní řešení)" },
  { value: "widget", label: "Widget" },
  { value: "plugin", label: "Plugin pro platformu" },
]

const pricingPlans = [
  { value: "contract", label: "Se smlouvou na 2 roky" },
  { value: "no-contract", label: "Bez smlouvy" },
]

interface EditShopDialogProps {
  shop: Tables<"shops"> | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditShopDialog({ shop, open, onOpenChange }: EditShopDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: shop || {
      name: "",
      url: "",
      sector: "",
      verification_methods: [],
      integration_type: "",
      pricing_plan: "",
      status: "active",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!shop) return

    try {
      const { error } = await supabase.from("shops").update(values).eq("id", shop.id)

      if (error) throw error

      toast.success("E-shop byl úspěšně upraven")
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating shop:", error)
      toast.error("Došlo k chybě při úpravě e-shopu")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upravit e-shop</DialogTitle>
          <DialogDescription>Upravte údaje o e-shopu</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Název e-shopu</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL adresa</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sektor zboží</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte sektor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sectors.map((sector) => (
                        <SelectItem key={sector.value} value={sector.value}>
                          {sector.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="verification_methods"
              render={() => (
                <FormItem>
                  <FormLabel>Metody ověření</FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    {verificationMethods.map((method) => (
                      <FormField
                        key={method.id}
                        control={form.control}
                        name="verification_methods"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(method.id)}
                                onCheckedChange={(checked) => {
                                  const value = field.value || []
                                  if (checked) {
                                    field.onChange([...value, method.id])
                                  } else {
                                    field.onChange(value.filter((val) => val !== method.id))
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{method.label}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="integration_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Způsob integrace</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte způsob integrace" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {integrationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pricing_plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cenový plán</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte cenový plán" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {pricingPlans.map((plan) => (
                          <SelectItem key={plan.value} value={plan.value}>
                            {plan.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Aktivní</SelectItem>
                      <SelectItem value="inactive">Neaktivní</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Uložit změny
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}