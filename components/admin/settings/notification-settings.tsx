// components/admin/settings/notification-settings.tsx
"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

const formSchema = z.object({
  error_alerts: z.boolean(),
  daily_summary: z.boolean(),
  recipients: z.array(z.string().email("Neplatný email")),
})

export function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [newRecipient, setNewRecipient] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      error_alerts: true,
      daily_summary: true,
      recipients: [],
    },
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("system_settings")
          .select("value")
          .eq("category", "notifications")
          .eq("key", "email_notifications")
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
        .eq("category", "notifications")
        .eq("key", "email_notifications")

      if (error) throw error

      toast.success("Nastavení bylo úspěšně uloženo")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Nepodařilo se uložit nastavení")
    }
  }

  const addRecipient = () => {
    if (!newRecipient) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newRecipient)) {
      toast.error("Zadejte platnou emailovou adresu")
      return
    }

    const currentRecipients = form.getValues("recipients")
    if (currentRecipients.includes(newRecipient)) {
      toast.error("Tento příjemce již existuje")
      return
    }

    form.setValue("recipients", [...currentRecipients, newRecipient])
    setNewRecipient("")
  }

  const removeRecipient = (email: string) => {
    const currentRecipients = form.getValues("recipients")
    form.setValue(
      "recipients",
      currentRecipients.filter((r) => r !== email),
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Emailové notifikace</CardTitle>
          <CardDescription>Nastavení emailových notifikací systému</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Removed Mock Data, using loading placeholders */}
            <div className="h-[72px] animate-pulse rounded bg-muted" />
            <div className="h-[72px] animate-pulse rounded bg-muted" />
            <div className="h-[100px] animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emailové notifikace</CardTitle>
        <CardDescription>Nastavení emailových notifikací systému</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="error_alerts"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Upozornění na chyby</FormLabel>
                    <FormDescription>Dostávat upozornění při výskytu chyb v systému</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="daily_summary"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Denní přehled</FormLabel>
                    <FormDescription>Dostávat denní přehled aktivit a statistik</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Příjemci notifikací</FormLabel>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                />
                <Button type="button" onClick={addRecipient}>
                  Přidat
                </Button>
              </div>
              <div className="space-y-2">
                {form.watch("recipients").map((email) => (
                  <div key={email} className="flex items-center justify-between rounded-lg border p-2">
                    <span>{email}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeRecipient(email)}>
                      Odebrat
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit">Uložit změny</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}