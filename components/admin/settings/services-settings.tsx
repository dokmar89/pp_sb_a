// components/admin/settings/services-settings.tsx
"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const bankidSchema = z.object({
  environment: z.enum(["sandbox", "production"]),
  timeout: z.number().min(1),
  retry_attempts: z.number().min(0),
})

const mojeidSchema = z.object({
  environment: z.enum(["sandbox", "production"]),
  timeout: z.number().min(1),
  retry_attempts: z.number().min(0),
})

const ocrSchema = z.object({
  min_confidence: z.number().min(0).max(1),
  max_file_size: z.number().min(1),
  allowed_formats: z.array(z.string()),
})

const facescanSchema = z.object({
  min_confidence: z.number().min(0).max(1),
  min_face_size: z.number().min(1),
  max_faces: z.number().min(1),
})

export function ServicesSettings() {
  const [activeTab, setActiveTab] = useState("bankid")
  const [isLoading, setIsLoading] = useState(true)

  const bankidForm = useForm<z.infer<typeof bankidSchema>>({
    resolver: zodResolver(bankidSchema),
    defaultValues: {
      environment: "sandbox",
      timeout: 30,
      retry_attempts: 3,
    },
  })

  const mojeidForm = useForm<z.infer<typeof mojeidSchema>>({
    resolver: zodResolver(mojeidSchema),
    defaultValues: {
      environment: "sandbox",
      timeout: 30,
      retry_attempts: 3,
    },
  })

  const ocrForm = useForm<z.infer<typeof ocrSchema>>({
    resolver: zodResolver(ocrSchema),
    defaultValues: {
      min_confidence: 0.8,
      max_file_size: 5242880,
      allowed_formats: ["jpg", "jpeg", "png"],
    },
  })

  const facescanForm = useForm<z.infer<typeof facescanSchema>>({
    resolver: zodResolver(facescanSchema),
    defaultValues: {
      min_confidence: 0.9,
      min_face_size: 100,
      max_faces: 1,
    },
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase.from("system_settings").select("*").eq("category", "services")

        if (error) throw error

        data.forEach((setting) => {
          switch (setting.key) {
            case "bankid":
              bankidForm.reset(setting.value)
              break
            case "mojeid":
              mojeidForm.reset(setting.value)
              break
            case "ocr":
              ocrForm.reset(setting.value)
              break
            case "facescan":
              facescanForm.reset(setting.value)
              break
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
  }, [bankidForm, mojeidForm, ocrForm, facescanForm])

  const saveSettings = async (key: string, values: any) => {
    try {
      const { error } = await supabase
        .from("system_settings")
        .update({ value: values })
        .eq("category", "services")
        .eq("key", key)

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
          <CardTitle>Nastavení služeb</CardTitle>
          <CardDescription>Konfigurace jednotlivých služeb pro ověření</CardDescription>
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
        <CardTitle>Nastavení služeb</CardTitle>
        <CardDescription>Konfigurace jednotlivých služeb pro ověření</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bankid">BankID</TabsTrigger>
            <TabsTrigger value="mojeid">MojeID</TabsTrigger>
            <TabsTrigger value="ocr">OCR</TabsTrigger>
            <TabsTrigger value="facescan">FaceScan</TabsTrigger>
          </TabsList>

          <TabsContent value="bankid">
            <Form {...bankidForm}>
              <form
                onSubmit={bankidForm.handleSubmit((values) => saveSettings("bankid", values))}
                className="space-y-4"
              >
                <FormField
                  control={bankidForm.control}
                  name="environment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prostředí</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte prostředí" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sandbox">Sandbox</SelectItem>
                          <SelectItem value="production">Produkce</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bankidForm.control}
                  name="timeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeout (sekundy)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bankidForm.control}
                  name="retry_attempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Počet pokusů</FormLabel>
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

          <TabsContent value="mojeid">
            <Form {...mojeidForm}>
              <form
                onSubmit={mojeidForm.handleSubmit((values) => saveSettings("mojeid", values))}
                className="space-y-4"
              >
                <FormField
                  control={mojeidForm.control}
                  name="environment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prostředí</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte prostředí" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sandbox">Sandbox</SelectItem>
                          <SelectItem value="production">Produkce</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={mojeidForm.control}
                  name="timeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeout (sekundy)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={mojeidForm.control}
                  name="retry_attempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Počet pokusů</FormLabel>
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

          <TabsContent value="ocr">
            <Form {...ocrForm}>
              <form onSubmit={ocrForm.handleSubmit((values) => saveSettings("ocr", values))} className="space-y-4">
                <FormField
                  control={ocrForm.control}
                  name="min_confidence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimální důvěryhodnost (0-1)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ocrForm.control}
                  name="max_file_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximální velikost souboru (bytes)</FormLabel>
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

          <TabsContent value="facescan">
            <Form {...facescanForm}>
              <form
                onSubmit={facescanForm.handleSubmit((values) => saveSettings("facescan", values))}
                className="space-y-4"
              >
                <FormField
                  control={facescanForm.control}
                  name="min_confidence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimální důvěryhodnost (0-1)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={facescanForm.control}
                  name="min_face_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimální velikost obličeje (px)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={facescanForm.control}
                  name="max_faces"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximální počet obličejů</FormLabel>
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