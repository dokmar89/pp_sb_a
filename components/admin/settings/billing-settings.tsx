// components/admin/settings/billing-settings.tsx
"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const companySchema = z.object({
  name: z.string().min(2, "Název společnosti musí mít alespoň 2 znaky"),
  address: z.string().min(5, "Zadejte platnou adresu"),
  ico: z.string().length(8, "IČO musí mít 8 číslic"),
  dic: z.string().min(10, "DIČ musí mít správný formát").max(12),
  bank_account: z.string().min(5, "Zadejte platné číslo účtu"),
})

const invoiceSchema = z.object({
  number_format: z.string().min(1, "Zadejte formát čísla faktury"),
  vat_rate: z.number().min(0).max(100),
  due_days: z.number().min(1),
})

export function BillingSettings() {
  const [activeTab, setActiveTab] = useState("company")
  const [isLoading, setIsLoading] = useState(true)

  const companyForm = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      address: "",
      ico: "",
      dic: "",
      bank_account: "",
    },
  })

  const invoiceForm = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      number_format: "YYYY/NNNNN",
      vat_rate: 21,
      due_days: 14,
    },
  })

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("system_settings").select("*").eq("category", "billing")

        if (error) throw error

        data.forEach((setting) => {
          if (setting.key === "company_details") {
            companyForm.reset(setting.value)
          } else if (setting.key === "invoice_settings") {
            invoiceForm.reset(setting.value)
          }
        })
      } catch (error) {
        console.error("Error loading settings:", error)
        toast.error("Nepodařilo se načíst nastavení")
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [companyForm, invoiceForm])

  const saveCompanyDetails = async (values: z.infer<typeof companySchema>) => {
    try {
      const { error } = await supabase
        .from("system_settings")
        .update({ value: values })
        .eq("category", "billing")
        .eq("key", "company_details")

      if (error) throw error

      toast.success("Nastavení bylo úspěšně uloženo")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Nepodařilo se uložit nastavení")
    }
  }

  const saveInvoiceSettings = async (values: z.infer<typeof invoiceSchema>) => {
    try {
      const { error } = await supabase
        .from("system_settings")
        .update({ value: values })
        .eq("category", "billing")
        .eq("key", "invoice_settings")

      if (error) throw error

      toast.success("Nastavení bylo úspěšně uloženo")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Nepodařilo se uložit nastavení")
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fakturační údaje</CardTitle>
          <CardDescription>Nastavení fakturačních údajů a parametrů</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             {/* Removed Mock Data, using loading placeholders */}
            <div className="h-[72px] animate-pulse rounded bg-muted" />
            <div className="h-[72px] animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fakturační údaje</CardTitle>
        <CardDescription>Nastavení fakturačních údajů a parametrů</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="company">Údaje společnosti</TabsTrigger>
            <TabsTrigger value="invoice">Nastavení faktur</TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <Form {...companyForm}>
              <form onSubmit={companyForm.handleSubmit(saveCompanyDetails)} className="space-y-4">
                <FormField
                  control={companyForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Název společnosti</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={companyForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresa</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={companyForm.control}
                    name="ico"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IČO</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={companyForm.control}
                    name="dic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DIČ</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={companyForm.control}
                  name="bank_account"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bankovní účet</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">Uložit změny</Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="invoice">
            <Form {...invoiceForm}>
              <form onSubmit={invoiceForm.handleSubmit(saveInvoiceSettings)} className="space-y-4">
                <FormField
                  control={invoiceForm.control}
                  name="number_format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formát čísla faktury</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>Použijte YYYY pro rok a NNNNN pro pořadové číslo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={invoiceForm.control}
                  name="vat_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sazba DPH (%)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={invoiceForm.control}
                  name="due_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Splatnost (dny)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">Uložit změny</Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}