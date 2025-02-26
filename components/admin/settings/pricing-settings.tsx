// components/admin/settings/pricing-settings.tsx
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

const formSchema = z.object({
  bankid: z.number().min(0, "Cena musí být kladné číslo"),
  mojeid: z.number().min(0, "Cena musí být kladné číslo"),
  ocr: z.number().min(0, "Cena musí být kladné číslo"),
  facescan: z.number().min(0, "Cena musí být kladné číslo"),
  revalidate: z.number().min(0, "Cena musí být kladné číslo"),
})

export function PricingSettings() {
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bankid: 20,
      mojeid: 15,
      ocr: 10,
      facescan: 5,
      revalidate: 2,
    },
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("system_settings")
          .select("value")
          .eq("category", "pricing")
          .eq("key", "verification_methods")
          .single()

        if (error) throw error
        if (data) {
          form.reset(data.value)
        }
      } catch (error) {
        console.error("Error loading settings:", error)
        toast.error("Nepodařilo se načíst nastavení")
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { error } = await supabase
        .from("system_settings")
        .update({ value: values })
        .eq("category", "pricing")
        .eq("key", "verification_methods")

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
          <CardTitle>Ceny ověření</CardTitle>
          <CardDescription>Nastavení cen jednotlivých metod ověření</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Removed Mock Data, using loading placeholders */}
            <div className="h-[72px] animate-pulse rounded bg-muted" />
            <div className="h-[72px] animate-pulse rounded bg-muted" />
            <div className="h-[72px] animate-pulse rounded bg-muted" />
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
        <CardTitle>Ceny ověření</CardTitle>
        <CardDescription>Nastavení cen jednotlivých metod ověření</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bankid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BankID</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>Cena za jedno ověření pomocí BankID v Kč</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mojeid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MojeID</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>Cena za jedno ověření pomocí MojeID v Kč</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ocr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OCR</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>Cena za jedno ověření pomocí OCR v Kč</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="facescan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>FaceScan</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>Cena za jedno ověření pomocí FaceScan v Kč</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="revalidate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opakované ověření</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>Cena za jedno opakované ověření v Kč</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Uložit změny</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}