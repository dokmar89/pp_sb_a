// components/admin/settings/limits-settings.tsx
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
  requests_per_minute: z.number().min(1, "Limit musí být alespoň 1"),
  requests_per_hour: z.number().min(1, "Limit musí být alespoň 1"),
  requests_per_day: z.number().min(1, "Limit musí být alespoň 1"),
})

export function LimitsSettings() {
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requests_per_minute: 60,
      requests_per_hour: 1000,
      requests_per_day: 10000,
    },
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("system_settings")
          .select("value")
          .eq("category", "limits")
          .eq("key", "api_rate_limits")
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
        .eq("category", "limits")
        .eq("key", "api_rate_limits")

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
          <CardTitle>API Limity</CardTitle>
          <CardDescription>Nastavení limitů pro API volání</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Removed Mock Data, using loading placeholders */}
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
        <CardTitle>API Limity</CardTitle>
        <CardDescription>Nastavení limitů pro API volání</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="requests_per_minute"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Požadavky za minutu</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>Maximální počet požadavků za minutu pro jeden API klíč</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requests_per_hour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Požadavky za hodinu</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>Maximální počet požadavků za hodinu pro jeden API klíč</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requests_per_day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Požadavky za den</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>Maximální počet požadavků za den pro jeden API klíč</FormDescription>
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